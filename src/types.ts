/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// الجداول المرجعية الموحدة (Standard Reference Tables)
// ==========================================

export interface Location {
  id: number;
  name: string; // e.g. محافظة أمانة العاصمة
}

export interface District {
  id: number;
  name: string; // e.g. مديرية التحرير
  govId: number; // Foreign Key to Location (Governorate)
}

export interface Position {
  id: number;
  name: string; // e.g. معلم رياضيات, أخصائي موارد بشرية
}

export interface DocumentType {
  id: number;
  name: string; // e.g. بطاقة شخصية, مؤهل جامعي
}

// ==========================================
// المجال 1: الموارد البشرية الأساسية (Core HR)
// ==========================================

export interface HrEmployee {
  employeeId: number;
  employeeNo: string; // e.g. EMP-2024-001
  fullName: string;
  nationalNo: string; // encrypted or masked
  gender: 'ذكر' | 'أنثى';
  birthDate: string;
  cadreTypeId: number; // 1: إداري, 2: تعليمي/تربوي
  currentLocationId: number; // FK to Location
  currentDistrictId: number; // FK to District
  employmentStatusId: number; // 1: على رأس العمل, 2: موقوف مؤقتا, 3: متقاعد
  baseSalary: number;
  hireDate: string;
}

export interface HrEmployeeAssignment {
  assignmentId: number;
  employeeId: number;
  workplaceType: 'وزارة' | 'محافظة' | 'مديرية' | 'مدرسة';
  workplaceId: number; // FK to corresponding level entity
  positionId: number; // FK to Position
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface HrEmployeeQualification {
  qualificationId: number;
  employeeId: number;
  degreeName: string; // بكالوريوس, ماجستير, دبلوم
  specialization: string;
  university: string;
  graduationYear: number;
}

export interface HrEmployeeLeave {
  leaveId: number;
  employeeId: number;
  leaveType: 'سنوية' | 'مرضية' | 'اضطرارية' | 'بدون راتب';
  startDate: string;
  endDate: string;
  status: 'معتمد' | 'قيد المراجعة' | 'مرفوض';
}

export interface HrEmployeeTransfer {
  transferId: number;
  employeeId: number;
  sourceLocationId: number;
  sourceDistrictId: number;
  destLocationId: number;
  destDistrictId: number;
  transferDate: string;
  status: 'مكتمل' | 'معلق' | 'ملغى';
}

export interface HrEmployeeStatusHistory {
  historyId: number;
  employeeId: number;
  oldStatusId: number;
  newStatusId: number;
  changeDate: string;
  reason: string;
}

// ==========================================
// المجال 2: شؤون المعلمين (Teacher Affairs)
// ==========================================

export interface TeacherProfile {
  teacherProfileId: number;
  employeeId: number;
  teachingSpecializationId: number; // FK to corresponding Subject
  teacherRank: number; // رتبة المعلم: 1: معلم مساعد, 2: معلم, 3: معلم أول
  totalTeachingHoursWeek: number;
}

export interface TeacherSchoolAssignment {
  id: number;
  teacherProfileId: number;
  schoolName: string;
  semester: string;
  isPrimarySchool: boolean;
}

export interface TeacherSubject {
  id: number;
  name: string; // رياضيات, فيزياء, لغة عربية
  gradeLevel: string; // الصف السابع, الأول الثانوي...
}

export interface TeacherSchedule {
  id: number;
  teacherProfileId: number;
  schoolName: string;
  dayOfWeek: string; // السبت, الأحد...
  periodNo: number; // الحصة 1, 2...
  subjectName: string;
  className: string;
}

export interface TeacherContract {
  contractId: number;
  teacherProfileId: number;
  contractNo: string;
  startDate: string;
  endDate: string;
  monthlySalary: number;
  isSigned: boolean;
}

// ==========================================
// المجال 3: المالية والرواتب (Payroll & Finance)
// ==========================================

export interface PayrollPeriod {
  periodId: number;
  periodName: string; // e.g. يونيو 2026
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface PayrollEmployeeTransaction {
  transactionId: number;
  employeeId: number;
  periodId: number;
  transactionType: 'استحقاق' | 'استقطاع';
  amount: number;
  description: string; // e.g. بدل الريف, غياب يومين
  createdAt: string;
}

export interface PayrollFormula {
  formulaId: number;
  formulaName: string; // e.g. بدل الريف, خصم الغياب
  formulaExpression: string; // e.g. BaseSalary * 0.15
  isActive: boolean;
}

export interface PayrollLoan {
  loanId: number;
  employeeId: number;
  totalAmount: number;
  remainingAmount: number;
  monthlyDeduction: number;
  startDate: string;
  status: 'نشط' | 'مسدد' | 'موقوف';
}

export interface PayrollBatchOperation {
  batchId: number;
  periodId: number;
  batchName: string;
  targetLevel: 'الكل' | 'محافظة' | 'مديرية';
  targetId?: number; // corresponding location or district ID
  formulaId: number;
  runDate: string;
  processedBy: string;
}

export interface PayrollBatchDetail {
  id: number;
  batchId: number;
  employeeId: number;
  calculatedAmount: number;
  status: 'مقبول' | 'موقوف مؤقتاً للمراجعة';
}

// ==========================================
// المجال 4: التدريب والتأهيل (Training)
// ==========================================

export interface TrainingProgram {
  programId: number;
  title: string; // e.g. طرق التدريس الحديثة للحساب الذهني
  startDate: string;
  endDate: string;
  trainerName: string;
}

export interface TrainingParticipant {
  id: number;
  programId: number;
  employeeId: number;
  locationId: number; // where they did the training
  status: 'مرشح' | 'مستمر' | 'مجتاز' | 'مستبعد للتكرار';
  nominatedAt: string;
}

export interface TrainingNeed {
  needId: number;
  employeeId: number;
  suggestedProgramTitle: string;
  priority: 1 | 2 | 3; // 1 is absolute priority
  source: 'تقييم ضعيف' | 'توصية موجه' | 'طلب شخصي';
  createdAt: string;
  status: 'معلق' | 'تم الترشيح' | 'ملغى';
}

export interface TrainingDeduplicationLog {
  logId: number;
  employeeId: number;
  employeeName: string;
  programId: number;
  programTitle: string;
  previousLocationName: string;
  detectedAt: string;
  proofDetails: string; // JSON or text proving past training
}

// ==========================================
// المجال 5: التوجيه والتقييم (Evaluation & Supervision)
// ==========================================

export interface EvaluationIndicator {
  indicatorId: number;
  title: string; // تحضير الدروس, تفاعل الطلاب, استخدام الوسائل
  weight: number; // Max score
}

export interface Evaluation {
  evaluationId: number;
  employeeId: number;
  evaluatorName: string;
  evaluationDate: string;
  finalScore: number; // sum of details
  finalResult: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'دون المتوسط';
  notes?: string;
}

export interface EvaluationDetail {
  detailId: number;
  evaluationId: number;
  indicatorId: number;
  score: number;
}

export interface SupervisionVisit {
  visitId: number;
  teacherProfileId: number;
  supervisorName: string;
  visitDate: string;
  classroomObserved: string;
  goalsMetRating: number; // 1-10
  feedback: string;
}

// ==========================================
// المجال 6: الأرشفة وحركة المعاملات (Archiving & Workflow)
// ==========================================

export interface WorkflowTransaction {
  transactionId: number;
  referralCode: string; // الصيغة الذكية: [المحافظة: خانتان][المديرية: خانتان][نوع المعاملة: خانتان][تسلسلي: 3 خانات]
  title: string;
  senderName: string;
  receiverDept: string;
  initiatorId: number;
  createdAt: string;
  status: 'معلق' | 'معتمد' | 'مرفوض' | 'مستكمل';
  qrCodeUrl: string; // Base64 or content string for QR
}

export interface WorkflowTransactionStep {
  stepId: number;
  transactionId: number;
  actorName: string;
  actionTaken: 'إرسال' | 'اعتماد' | 'رفض' | 'طلب استكمال';
  actionDate: string;
  comments?: string;
  digitalSignature?: string; // Mock cryptographic signature string
}

export interface Document {
  documentId: number;
  title: string;
  employeeId?: number;
  documentTypeId: number;
  uploadedAt: string;
  sha256Hash: string; // file integrity check
}

export interface DocumentVersion {
  versionId: number;
  documentId: number;
  versionNo: number;
  filePath: string;
  fileSizeKb: number;
  uploadedBy: string;
}

// ==========================================
// المجال 7: البصمة والحضور (Attendance & Biometrics)
// ==========================================

export interface AttendanceDevice {
  deviceId: number;
  schoolName: string;
  ipAddress: string;
  status: 'متصل' | 'غير متصل';
  lastPingTime: string;
}

export interface AttendanceLog {
  logId: number;
  employeeId: number;
  timestamp: string;
  verifyMethod: 'بصمة إصبع' | 'بصمة وجه' | 'بطاقة ذكية';
  deviceId: number;
}

export interface AttendanceViolation {
  violationId: number;
  employeeId: number;
  violationDate: string;
  violationType: 'غياب بدون عذر' | 'تأخر صباحي' | 'خروج مبكر';
  minutesCount: number;
  isProcessed: boolean; // if trigger already created payroll transaction
  deductionAmount: number;
}

// ==========================================
// المجال 8: الأمن والصلاحيات (Security & IAM)
// ==========================================

export interface User {
  userId: number;
  username: string; // SSO email or code e.g. admin@edu.gov
  fullName: string;
  roleId: number;
  govId?: number; // limited to locations
  districtId?: number; // limited to districts
  mfaEnabled: boolean;
  mfaSecret?: string;
  isLoggedIn: boolean;
}

export interface Role {
  roleId: number;
  roleName: 'مدير وزارة' | 'مسؤول محافظة' | 'مسؤول مديرية' | 'مدير مدرسة' | 'مسؤول مالي' | 'تربوي';
}

export interface Permission {
  permissionId: number;
  roleId: number;
  resource: string;
  action: 'READ' | 'WRITE' | 'APPROVE' | 'ADMIN';
}

export interface AuditLog {
  logId: number;
  userId: number;
  actionType: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SYNC_OFFLINE';
  tableName: string;
  recordId: number;
  oldValueJson?: string; // Immutable JSON
  newValueJson?: string; // Immutable JSON
  actionTimestamp: string;
  ipAddress: string;
}

export interface UserSession {
  sessionId: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
}
