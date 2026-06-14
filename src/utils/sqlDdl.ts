/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SQL_DDL_SCRIPT = `-- =========================================================================
-- نظام إدارة الموارد البشرية المتكامل لوزارة التربية والتعليم والتعليم العالي
-- سكريبت قواعد البيانات المركزي الموحد (PostgreSQL Standard Enterprise)
-- تصميم وهيكلية: مهندس نظم أول وقواعد بيانات مؤسسية آمنة
-- =========================================================================

-- تفعيل إضافات الأمان والتشفير والأوزان الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 0. الجداول المرجعية الموحدة (Standard Reference Tables)
-- ==========================================

CREATE TABLE Locations (
    LocationID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    LocationName VARCHAR(150) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Districts (
    DistrictID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DistrictName VARCHAR(150) NOT NULL,
    LocationID INT NOT NULL REFERENCES Locations(LocationID) ON DELETE RESTRICT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_District_In_Location UNIQUE(DistrictName, LocationID)
);

CREATE TABLE Positions (
    PositionID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PositionName VARCHAR(150) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DocumentTypes (
    DocumentTypeID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TypeName VARCHAR(100) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 1. المجال الأول: الموارد البشرية الأساسية (Core HR)
-- ==========================================

CREATE TABLE HrEmployees (
    EmployeeID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeNo VARCHAR(30) NOT NULL UNIQUE,
    FullName VARCHAR(250) NOT NULL,
    NationalNo_Encrypted BYTEA NOT NULL, -- مشفر باستخدام AES-256 (pgp_sym_encrypt)
    Gender VARCHAR(10) CHECK (Gender IN ('ذكر', 'أنثى')),
    BirthDate DATE NOT NULL,
    CadreTypeID INT NOT NULL CHECK (CadreTypeID IN (1, 2)), -- 1: كادر إداري، 2: كادر تعليمي/تربوي
    CurrentLocationID INT NOT NULL REFERENCES Locations(LocationID),
    CurrentDistrictID INT NOT NULL REFERENCES Districts(DistrictID),
    EmploymentStatusID INT NOT NULL DEFAULT 1, -- 1: على رأس العمل، 2: موقوف مؤقتاً، 3: متقاعد
    BaseSalary DECIMAL(12, 2) NOT NULL CHECK (BaseSalary >= 0),
    HireDate DATE NOT NULL DEFAULT CURRENT_DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE HrEmployeeAssignments (
    AssignmentID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    WorkplaceType VARCHAR(20) CHECK (WorkplaceType IN ('وزارة', 'محافظة', 'مديرية', 'مدرسة')),
    WorkplaceID INT NOT NULL, -- يعبر عن كود الوزارة أو كود المحافظة إلخ..
    PositionID INT NOT NULL REFERENCES Positions(PositionID),
    StartDate DATE NOT NULL,
    EndDate DATE,
    IsActive BOOLEAN DEFAULT TRUE,
    CONSTRAINT CK_Assignment_Dates CHECK (EndDate IS NULL OR EndDate >= StartDate)
);

CREATE TABLE HrEmployeeQualifications (
    QualificationID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    DegreeName VARCHAR(100) NOT NULL, -- بكالوريوس، ماجستير دبلوم، دكتوراه
    Specialization VARCHAR(150) NOT NULL,
    University VARCHAR(150) NOT NULL,
    GraduationYear INT CHECK (GraduationYear BETWEEN 1950 AND 2100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE HrEmployeeLeaves (
    LeaveID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    LeaveType VARCHAR(30) CHECK (LeaveType IN ('سنوية', 'مرضية', 'اضطرارية', 'بدون راتب')),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('معتمد', 'قيد المراجعة', 'مرفوض')) DEFAULT 'قيد المراجعة',
    CONSTRAINT CK_Leave_Dates CHECK (EndDate >= StartDate)
);

CREATE TABLE HrEmployeeTransfers (
    TransferID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    SourceLocationID INT NOT NULL REFERENCES Locations(LocationID),
    SourceDistrictID INT NOT NULL REFERENCES Districts(DistrictID),
    DestLocationID INT NOT NULL REFERENCES Locations(LocationID),
    DestDistrictID INT NOT NULL REFERENCES Districts(DistrictID),
    TransferDate DATE NOT NULL DEFAULT CURRENT_DATE,
    Status VARCHAR(20) CHECK (Status IN ('مكتمل', 'معلق', 'ملغى')) DEFAULT 'معلق'
);

CREATE TABLE HrEmployeeStatusHistory (
    HistoryID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    OldStatusID INT NOT NULL,
    NewStatusID INT NOT NULL,
    ChangeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT NOT NULL
);

-- ==========================================
-- 2. المجال الثاني: شؤون المعلمين (Teacher Affairs)
-- ==========================================

CREATE TABLE TeacherProfiles (
    TeacherProfileID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL UNIQUE REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    TeachingSpecializationID INT NOT NULL, -- يربط بتصنيف المواد
    TeacherRank INT CHECK (TeacherRank IN (1, 2, 3)) NOT NULL, -- 1: كادر مساعد، 2: كادر رسمي، 3: كادر قيادي تربوي
    TotalTeachingHoursWeek INT CHECK (TotalTeachingHoursWeek >= 0) DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TeacherSchoolAssignments (
    SchoolAssignmentID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TeacherProfileID INT NOT NULL REFERENCES TeacherProfiles(TeacherProfileID) ON DELETE CASCADE,
    SchoolName VARCHAR(200) NOT NULL,
    Semester VARCHAR(50) NOT NULL,
    IsPrimarySchool BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TeacherSchedules (
    ScheduleID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TeacherProfileID INT NOT NULL REFERENCES TeacherProfiles(TeacherProfileID) ON DELETE CASCADE,
    SchoolName VARCHAR(200) NOT NULL,
    DayOfWeek VARCHAR(20) NOT NULL,
    PeriodNo INT CHECK (PeriodNo BETWEEN 1 AND 8),
    SubjectName VARCHAR(100) NOT NULL,
    ClassName VARCHAR(50) NOT NULL
);

CREATE TABLE TeacherContracts (
    ContractID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TeacherProfileID INT NOT NULL REFERENCES TeacherProfiles(TeacherProfileID) ON DELETE CASCADE,
    ContractNo VARCHAR(50) UNIQUE NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    MonthlySalary DECIMAL(12,2) CHECK (MonthlySalary >= 0),
    IsSigned BOOLEAN DEFAULT FALSE,
    CONSTRAINT CK_Contract_Dates CHECK (EndDate >= StartDate)
);

-- ==========================================
-- 3. المجال الثالث: المالية والرواتب (Payroll & Finance)
-- ==========================================

CREATE TABLE PayrollPeriods (
    PeriodID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PeriodName VARCHAR(50) UNIQUE NOT NULL, -- يونيو 2026
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsClosed BOOLEAN DEFAULT FALSE,
    CONSTRAINT CK_Period_Dates CHECK (EndDate >= StartDate)
);

CREATE TABLE PayrollEmployeeTransactions (
    TransactionID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    PeriodID INT NOT NULL REFERENCES PayrollPeriods(PeriodID),
    TransactionType VARCHAR(20) CHECK (TransactionType IN ('استحقاق', 'استقطاع')),
    Amount DECIMAL(12,2) NOT NULL CHECK (Amount > 0),
    Description VARCHAR(250) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PayrollFormulas (
    FormulaId INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FormulaName VARCHAR(100) UNIQUE NOT NULL,
    FormulaExpression VARCHAR(250) NOT NULL, -- تعبير مثل: BaseSalary * 0.15
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PayrollLoans (
    LoanID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    TotalAmount DECIMAL(12,2) NOT NULL CHECK (TotalAmount > 0),
    RemainingAmount DECIMAL(12,2) NOT NULL CHECK (RemainingAmount >= 0),
    MonthlyDeduction DECIMAL(12,2) NOT NULL CHECK (MonthlyDeduction > 0),
    StartDate DATE NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('نشط', 'مسدد', 'موقوف')) DEFAULT 'نشط'
);

CREATE TABLE PayrollBatchOperations (
    BatchID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PeriodID INT NOT NULL REFERENCES PayrollPeriods(PeriodID),
    BatchName VARCHAR(150) NOT NULL,
    TargetLevel VARCHAR(20) CHECK (TargetLevel IN ('الكل', 'محافظة', 'مديرية')),
    TargetID INT, -- كود يعود للمحافظة أو المديرية المشمولة
    FormulaID INT REFERENCES PayrollFormulas(FormulaId),
    RunDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ProcessedBy VARCHAR(150) NOT NULL
);

CREATE TABLE PayrollBatchDetails (
    BatchDetailID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    BatchID INT NOT NULL REFERENCES PayrollBatchOperations(BatchID) ON DELETE CASCADE,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID),
    CalculatedAmount DECIMAL(12,2) NOT NULL,
    Status VARCHAR(40) CHECK (Status IN ('مقبول', 'موقوف مؤقتاً للمراجعة')) DEFAULT 'مقبول'
);

-- ==========================================
-- 4. المجال الرابع: التدريب والتأهيل (Training)
-- ==========================================

CREATE TABLE TrainingPrograms (
    ProgramID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Title VARCHAR(250) NOT NULL UNIQUE,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TrainerName VARCHAR(150),
    CONSTRAINT CK_Program_Dates CHECK (EndDate >= StartDate)
);

CREATE TABLE TrainingParticipants (
    ParticipantID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProgramID INT NOT NULL REFERENCES TrainingPrograms(ProgramID) ON DELETE CASCADE,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    LocationID INT NOT NULL REFERENCES Locations(LocationID), -- مكان التدريب السابق
    Status VARCHAR(30) CHECK (Status IN ('مرشح', 'مستمر', 'مجتاز', 'مستبعد للتكرار')) DEFAULT 'مرشح',
    NominatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_Participant_Program UNIQUE(ProgramID, EmployeeID)
);

CREATE TABLE TrainingNeeds (
    NeedID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    SuggestedProgramTitle VARCHAR(250) NOT NULL,
    Priority INT CHECK (Priority IN (1, 2, 3)) DEFAULT 3, -- 1: أولوية قصوى
    Source VARCHAR(30) CHECK (Source IN ('تقييم ضعيف', 'توصية موجه', 'طلب شخصي')),
    Status VARCHAR(20) CHECK (Status IN ('معلق', 'تم الترشيح', 'ملغى')) DEFAULT 'معلق',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TrainingDeduplicationLogs (
    LogID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    EmployeeName VARCHAR(250) NOT NULL,
    ProgramID INT NOT NULL REFERENCES TrainingPrograms(ProgramID),
    ProgramTitle VARCHAR(250) NOT NULL,
    PreviousLocationName VARCHAR(150) NOT NULL,
    DetectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ProofDetails TEXT NOT NULL
);

-- ==========================================
-- 5. المجال الخامس: التوجيه والتقييم (Evaluation & Supervision)
-- ==========================================

CREATE TABLE EvaluationIndicators (
    IndicatorID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Title VARCHAR(250) NOT NULL UNIQUE,
    Weight INT CHECK (Weight > 0) NOT NULL
);

CREATE TABLE Evaluations (
    EvaluationID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    EvaluatorName VARCHAR(150) NOT NULL,
    EvaluationDate DATE NOT NULL DEFAULT CURRENT_DATE,
    FinalScore INT NOT NULL CHECK (FinalScore BETWEEN 0 AND 100),
    FinalResult VARCHAR(30) CHECK (FinalResult IN ('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'دون المتوسط')),
    Notes TEXT
);

CREATE TABLE EvaluationDetails (
    DetailID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EvaluationID INT NOT NULL REFERENCES Evaluations(EvaluationID) ON DELETE CASCADE,
    IndicatorID INT NOT NULL REFERENCES EvaluationIndicators(IndicatorID),
    Score INT NOT NULL CHECK (Score >= 0)
);

CREATE TABLE SupervisionVisits (
    VisitID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TeacherProfileID INT NOT NULL REFERENCES TeacherProfiles(TeacherProfileID) ON DELETE CASCADE,
    SupervisorName VARCHAR(150) NOT NULL,
    VisitDate DATE NOT NULL DEFAULT CURRENT_DATE,
    ClassroomObserved VARCHAR(100) NOT NULL,
    GoalsMetRating INT CHECK (GoalsMetRating BETWEEN 1 AND 10),
    Feedback TEXT
);

-- ==========================================
-- 6. المجال السادس: الأرشفة وحركة المعاملات (Archiving & Workflow)
-- ==========================================

CREATE TABLE WorkflowTransactions (
    TransactionID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ReferralCode VARCHAR(50) UNIQUE NOT NULL, -- كود مرجعي ذكي
    Title VARCHAR(250) NOT NULL,
    SenderName VARCHAR(150) NOT NULL,
    ReceiverDept VARCHAR(150) NOT NULL,
    InitiatorID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) CHECK (Status IN ('معلق', 'معتمد', 'مرفوض', 'مستكمل')) DEFAULT 'معلق',
    QRCodeUrl TEXT NOT NULL
);

CREATE TABLE WorkflowTransactionSteps (
    StepID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TransactionID INT NOT NULL REFERENCES WorkflowTransactions(TransactionID) ON DELETE CASCADE,
    ActorName VARCHAR(150) NOT NULL,
    ActionTaken VARCHAR(30) CHECK (ActionTaken IN ('إرسال', 'اعتماد', 'رفض', 'طلب استكمال')),
    ActionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Comments TEXT,
    DigitalSignature TEXT -- يحتفظ بالرمز المشفر للتوقيع الرقمي
);

CREATE TABLE Documents (
    DocumentID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Title VARCHAR(250) NOT NULL,
    EmployeeID INT REFERENCES HrEmployees(EmployeeID) ON DELETE SET NULL,
    DocumentTypeID INT REFERENCES DocumentTypes(DocumentTypeID),
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SHA256Hash VARCHAR(64) NOT NULL -- لبيان النزاهة ومنع العبث بالوثائق
);

CREATE TABLE DocumentVersions (
    VersionID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DocumentID INT NOT NULL REFERENCES Documents(DocumentID) ON DELETE CASCADE,
    VersionNo INT NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSizeKb INT NOT NULL,
    UploadedBy VARCHAR(150) NOT NULL,
    CONSTRAINT UQ_Doc_Version UNIQUE(DocumentID, VersionNo)
);

-- ==========================================
-- 7. المجال السابع: البصمة والحضور (Attendance & Biometrics)
-- ==========================================

CREATE TABLE AttendanceDevices (
    DeviceID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    SchoolName VARCHAR(200) NOT NULL,
    IPAddress VARCHAR(45) UNIQUE NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('متصل', 'غير متصل')) DEFAULT 'غير متصل',
    LastPingTime TIMESTAMP
);

CREATE TABLE AttendanceLogs (
    LogID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    Timestamp TIMESTAMP NOT NULL,
    VerifyMethod VARCHAR(35) CHECK (VerifyMethod IN ('بصمة إصبع', 'بصمة وجه', 'بطاقة ذكية')),
    DeviceID INT NOT NULL REFERENCES AttendanceDevices(DeviceID)
);

CREATE TABLE AttendanceViolations (
    ViolationID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EmployeeID INT NOT NULL REFERENCES HrEmployees(EmployeeID) ON DELETE CASCADE,
    ViolationDate DATE NOT NULL,
    ViolationType VARCHAR(40) CHECK (ViolationType IN ('غياب بدون عذر', 'تأخر صباحي', 'خروج مبكر')),
    MinutesCount INT DEFAULT 0,
    IsProcessed BOOLEAN DEFAULT FALSE,
    DeductionAmount DECIMAL(12,2) DEFAULT 0
);

-- ==========================================
-- 8. المجال الثامن: الأمن والصلاحيات (Security & IAM)
-- ==========================================

CREATE TABLE Users (
    UserID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL, -- SSO Email
    PasswordHash VARCHAR(255) NOT NULL, -- مشفرة بـ BCrypt
    FullName VARCHAR(150) NOT NULL,
    GovID INT REFERENCES Locations(LocationID),
    DistrictID INT REFERENCES Districts(DistrictID),
    MFAEnabled BOOLEAN DEFAULT FALSE,
    MFASecret VARCHAR(128),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Roles (
    RoleID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    RoleName VARCHAR(50) UNIQUE CHECK (RoleName IN ('مدير وزارة', 'مسؤول محافظة', 'مسؤول مديرية', 'مدير مدرسة', 'مسؤول مالي', 'تربوي'))
);

CREATE TABLE UserRoles (
    UserID INT REFERENCES Users(UserID) ON DELETE CASCADE,
    RoleID INT REFERENCES Roles(RoleID) ON DELETE CASCADE,
    PRIMARY KEY (UserID, RoleID)
);

CREATE TABLE Permissions (
    PermissionID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    RoleID INT REFERENCES Roles(RoleID) ON DELETE CASCADE,
    Resource VARCHAR(100) NOT NULL, -- e.g. HR_EMPLOYEES, PAYROLL_BATCH
    Action VARCHAR(20) CHECK (Action IN ('READ', 'WRITE', 'APPROVE', 'ADMIN')),
    CONSTRAINT UQ_Role_Res_Act UNIQUE (RoleID, Resource, Action)
);

CREATE TABLE AuditLogs (
    LogID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserID INT REFERENCES Users(UserID) ON SET NULL,
    ActionType VARCHAR(25) CHECK (ActionType IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SYNC_OFFLINE')),
    TableName VARCHAR(100) NOT NULL,
    RecordID INT NOT NULL,
    OldValueJSON JSONB, -- يحتوي القيم السابقة بشكل دائم لبيان الفروق
    NewValueJSON JSONB, -- يحتوي القيم المحدثة
    ActionTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    IPAddress VARCHAR(45) NOT NULL
);

-- ==========================================
-- فهارس تحسين الأداء في البحث والفرز (Fk Indexes)
-- ==========================================

CREATE INDEX IX_HrEmployees_No ON HrEmployees(EmployeeNo);
CREATE INDEX IX_HrEmployees_Location ON HrEmployees(CurrentLocationID, CurrentDistrictID);
CREATE INDEX IX_TeacherProfiles_Employee ON TeacherProfiles(EmployeeID);
CREATE INDEX IX_PayrollEmployeeTransactions_EmpPer ON PayrollEmployeeTransactions(EmployeeID, PeriodID);
CREATE INDEX IX_WorkflowTransactions_RefCode ON WorkflowTransactions(ReferralCode);
CREATE INDEX IX_AttendanceLogs_EmpTime ON AttendanceLogs(EmployeeID, Timestamp);
CREATE INDEX IX_AuditLogs_UserTimestamp ON AuditLogs(UserID, ActionTimestamp DESC);

-- ==========================================
-- زناد منع تعديل أو حذف سجلات التدقيق (AuditLogs Immutability Trigger)
-- ==========================================

CREATE OR REPLACE FUNCTION pr_block_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'عملية غير مصرح بها! لا يمكن تعديل أو حذف سجلات نظام التدقيق الأمني والرقابة (AuditLogs) نهائياً لضمان النزاهة.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER TR_AuditLogs_Immutable
BEFORE UPDATE OR DELETE ON AuditLogs
FOR EACH ROW
EXECUTE FUNCTION pr_block_audit_log_modification();
`;

export const SECURITY_MIDDLEWARE_CODE = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * طبقة الأمان في واجهات برمجة التطبيقات (API Security Middleware)
 * يتضمن ذلك التحقق من التوقيع الرقمي، تدوير رموز JWT الفعال، والتحقق الصارم من الأدوار (RBAC)
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'SYS_MOE_YEM_SEC_ACCESS_KEY';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'SYS_MOE_YEM_SEC_REFRESH_KEY';

// واجهة لتعريف بيانات المستخدم المستخرجة من الرمز المشفّر
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    roleName: string;
    govId?: number;
    districtId?: number;
  };
}

/**
 * 1. ميدل وير للترخيص والتحقق من التوكن وصلاحياته
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'لم يتم توفير تذكرة أمان لدخول النظام (Token missing)'
    });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'منتهي الصلاحية أو تذكرة أمان غير صالحة. يرجى تدوير الرمز تلقائيا.',
        errorType: 'EXPIRED_TOKEN'
      });
    }
    
    req.user = decodedUser as AuthenticatedRequest['user'];
    next();
  });
}

/**
 * 2. خوارزمية تدوير رموز الـ JWT (JWT Token Rotation) لمنع سرقة الجلسات
 */
export async function rotateAccessToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'مطلوب توفير Refresh Token للتدوير.' });
  }

  try {
    // 1. التحقق من صحة توكن التحديث
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    // 2. فحص سريان وتلافي الإلغاء الفوري للجلسات عبر الخادم (Server-Side Revocation State)
    // يتم التأكد أن التوكن غير ملغى في قاعدة البيانات أو جدول الجلسات الموقوفة
    const isRevoked = await checkSessionRevokedInDB(payload.sessionId);
    if (isRevoked) {
      return res.status(403).json({ success: false, message: 'تم إبطال هذه الجلسة من قبل الخادم المركزي.' });
    }

    // 3. إصدار زوج تذاكر أمان جديد (Access Token و Refresh Token جديدين) لتدوير الآليات
    const newSessionId = crypto.randomUUID();
    
    const newAccessToken = jwt.sign(
      { 
        userId: payload.userId, 
        username: payload.username, 
        roleName: payload.roleName,
        govId: payload.govId,
        districtId: payload.districtId
      }, 
      JWT_ACCESS_SECRET, 
      { expiresIn: '15m' } // صلاحية الـ Access 15 دقيقة فقط للحد من الهجمات
    );

    const newRefreshToken = jwt.sign(
      { userId: payload.userId, sessionId: newSessionId }, 
      JWT_REFRESH_SECRET, 
      { expiresIn: '7d' } // صلاحية الـ Refresh 7 أيام
    );

    // تحديث قاعدة البيانات بالجلسة الجديدة وإلغاء السابقة
    await replaceSessionInDB(payload.sessionId, newSessionId, payload.userId);

    // إعادة التوكنات الجديدة داخل كوكيز فائقة الأمان من جانب الخادم
    res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    
    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    return res.status(403).json({ success: false, message: 'رمز التحديث غير صالح أو منتهي الصلاحية.' });
  }
}

/**
 * 3. التحقق القائم على الأدوار والمستويات (Role & Hierarchy Based Access Control - RBAC)
 * نتحقق فيه من المحافظة والمديرية لمنع تسريب البيانات بين المستويات الدنيا
 */
export function authorizeRoles(allowedRoles: string[], resource: string, actionType: 'READ' | 'WRITE' | 'APPROVE' | 'ADMIN') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'مستخدم غير مصادق.' });
    }

    const { roleName, govId, districtId } = req.user;

    // أ. التحقق من صلاحية الدور العام
    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: \`خطأ في الصلاحيات! دور وظيفي غير مصرح له بالولوج إلى المورد [\${resource}].\`
      });
    }

    // ب. فرض رقابة المستويات الإدارية الهرمية الصارمة (Data Isolation Checks)
    // إذا كان المستخدم مسؤول محافظة، نتأكد أن البيانات الضمنية للمحافظة تطابق المحافظة المسجلة في توكنه
    if (roleName === 'مسؤول محافظة') {
      const targetGovId = req.params.govId || req.body.govId;
      if (targetGovId && Number(targetGovId) !== govId) {
        return res.status(403).json({
          success: false,
          message: 'لا تملك الصلاحية للوصول إلى بيانات محافظة أخرى خارج نطاق تكليفك.'
        });
      }
    }

    // ج. إذا كان مسؤول مديرية، يمنع منعاً باتاً من تداول بيانات مديريات أخرى
    if (roleName === 'مسؤول مديرية') {
      const targetDistrictId = req.params.districtId || req.body.districtId;
      if (targetDistrictId && Number(targetDistrictId) !== districtId) {
        return res.status(403).json({
          success: false,
          message: 'صلاحياتك محدودة بإطار مديريتك المعينة ولا تدعم التعديل خارجها.'
        });
      }
    }

    next();
  };
}

// توابع الميزات المفترضة لتبسيط العرض
async function checkSessionRevokedInDB(sid: string): Promise<boolean> { return false; }
async function replaceSessionInDB(oldSid: string, newSid: string, uid: number): Promise<void> {}
`;
