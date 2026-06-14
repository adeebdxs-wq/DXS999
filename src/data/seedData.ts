/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Location,
  District,
  Position,
  DocumentType,
  HrEmployee,
  HrEmployeeQualification,
  TeacherProfile,
  PayrollPeriod,
  User,
  WorkflowTransaction,
  WorkflowTransactionStep,
  Document,
  AttendanceDevice,
  AttendanceLog,
  AttendanceViolation,
  TrainingProgram,
  TrainingParticipant,
  Evaluation,
  EvaluationIndicator,
  PayrollFormula,
  PayrollLoan,
  AuditLog
} from '../types';

export const mockLocations: Location[] = [
  { id: 1, name: 'محافظة أمانة العاصمة' },
  { id: 2, name: 'محافظة عدن' },
  { id: 3, name: 'محافظة تعز' },
  { id: 4, name: 'محافظة حضرموت' }
];

export const mockDistricts: District[] = [
  { id: 10, name: 'مديرية التحرير', govId: 1 },
  { id: 11, name: 'مديرية السبعين', govId: 1 },
  { id: 20, name: 'مديرية صيرة', govId: 2 },
  { id: 21, name: 'مديرية التواهي', govId: 2 },
  { id: 30, name: 'مديرية القاهرة', govId: 3 },
  { id: 40, name: 'مديرية المكلا', govId: 4 }
];

export const mockPositions: Position[] = [
  { id: 1, name: 'معلم رياضيات' },
  { id: 2, name: 'أخصائي موارد بشرية' },
  { id: 3, name: 'معلم لغة عربية' },
  { id: 4, name: 'معلم فيزياء' },
  { id: 5, name: 'مدير مدرسة' },
  { id: 6, name: 'موجه تربوي' }
];

export const mockDocumentTypes: DocumentType[] = [
  { id: 1, name: 'بطاقة شخصية' },
  { id: 2, name: 'مؤهل جامعي' },
  { id: 3, name: 'قرار تعيين' },
  { id: 4, name: 'شهادة تدريب' }
];

export const mockEmployees: HrEmployee[] = [
  {
    employeeId: 1001,
    employeeNo: 'EMP-2024-001',
    fullName: 'أحمد علي حسن الشامي',
    nationalNo: '01010382918',
    gender: 'ذكر',
    birthDate: '1988-05-12',
    cadreTypeId: 1, // إداري
    currentLocationId: 1, // أمانة العاصمة
    currentDistrictId: 10, // التحرير
    employmentStatusId: 1, // على رأس العمل
    baseSalary: 120000,
    hireDate: '2012-03-01'
  },
  {
    employeeId: 1002,
    employeeNo: 'EMP-2024-002',
    fullName: 'أروى محمد صالح اليافعي',
    nationalNo: '02010493819',
    gender: 'أنثى',
    birthDate: '1992-09-24',
    cadreTypeId: 2, // تربوي (معلم)
    currentLocationId: 2, // عدن
    currentDistrictId: 20, // صيرة
    employmentStatusId: 1, // على رأس العمل
    baseSalary: 145000,
    hireDate: '2015-10-15'
  },
  {
    employeeId: 1003,
    employeeNo: 'EMP-2024-003',
    fullName: 'خالد عمر عبد الهادي باوزير',
    nationalNo: '04020984920',
    gender: 'ذكر',
    birthDate: '1985-02-18',
    cadreTypeId: 2, // تربوي (معلم)
    currentLocationId: 4, // حضرموت
    currentDistrictId: 40, // المكلا
    employmentStatusId: 1, // على رأس العمل
    baseSalary: 155000,
    hireDate: '2010-01-20'
  },
  {
    employeeId: 1004,
    employeeNo: 'EMP-2024-004',
    fullName: 'فاطمة طارق سيف القباطي',
    nationalNo: '03010728192',
    gender: 'أنثى',
    birthDate: '1994-11-30',
    cadreTypeId: 2, // تربوي (معلم)
    currentLocationId: 3, // تعز
    currentDistrictId: 30, // القاهرة
    employmentStatusId: 1, // على رأس العمل
    baseSalary: 130000,
    hireDate: '2018-09-01'
  }
];

export const mockQualifications: HrEmployeeQualification[] = [
  {
    qualificationId: 1,
    employeeId: 1001,
    degreeName: 'ماجستير',
    specialization: 'إدارة أفراد وموارد بشرية',
    university: 'جامعة صنعاء',
    graduationYear: 2016
  },
  {
    qualificationId: 2,
    employeeId: 1002,
    degreeName: 'بكالوريوس',
    specialization: 'تربية رياضيات',
    university: 'جامعة عدن',
    graduationYear: 2014
  },
  {
    qualificationId: 3,
    employeeId: 1003,
    degreeName: 'بكالوريوس',
    specialization: 'لغة عربية وآدابها',
    university: 'جامعة حضرموت',
    graduationYear: 2008
  },
  {
    qualificationId: 4,
    employeeId: 1004,
    degreeName: 'بكالوريوس',
    specialization: 'علوم فيزياء تخصص مجهري',
    university: 'جامعة تعز',
    graduationYear: 2016
  }
];

export const mockTeacherProfiles: TeacherProfile[] = [
  {
    teacherProfileId: 501,
    employeeId: 1002, // أروى (رياضيات)
    teachingSpecializationId: 1, // رياضيات
    teacherRank: 2, // معلم
    totalTeachingHoursWeek: 20
  },
  {
    teacherProfileId: 502,
    employeeId: 1003, // خالد (عربي)
    teachingSpecializationId: 3, // لغة عربية
    teacherRank: 3, // معلم أول
    totalTeachingHoursWeek: 16
  },
  {
    teacherProfileId: 503,
    employeeId: 1004, // فاطمة (فيزياء)
    teachingSpecializationId: 4, // فيزياء
    teacherRank: 2, // معلم
    totalTeachingHoursWeek: 22
  }
];

export const mockPayrollPeriods: PayrollPeriod[] = [
  { periodId: 1, periodName: 'مايو 2026', startDate: '2026-05-01', endDate: '2026-05-31', isClosed: true },
  { periodId: 2, periodName: 'يونيو 2026', startDate: '2026-06-01', endDate: '2026-06-30', isClosed: false }
];

export const mockPayrollFormulas: PayrollFormula[] = [
  { formulaId: 1, formulaName: 'بدل الريف والمناطق النائية', formulaExpression: 'BaseSalary * 0.15', isActive: true },
  { formulaId: 2, formulaName: 'علاوة معلم أول الإرشادية', formulaExpression: 'BaseSalary * 0.08', isActive: true },
  { formulaId: 3, formulaName: 'خصم الغياب اليومي التلقائي', formulaExpression: '(BaseSalary / 30) * Days', isActive: true }
];

export const mockPayrollLoans: PayrollLoan[] = [
  { loanId: 1, employeeId: 1001, totalAmount: 150000, remainingAmount: 90000, monthlyDeduction: 15000, startDate: '2025-12-01', status: 'نشط' },
  { loanId: 2, employeeId: 1002, totalAmount: 200000, remainingAmount: 200000, monthlyDeduction: 20000, startDate: '2026-06-01', status: 'نشط' }
];

export const mockUsers: User[] = [
  { userId: 1, username: 'admin@edu.gov', fullName: 'أ. د. عبد الرحمن الكحلاني', roleId: 1, mfaEnabled: true, isLoggedIn: false },
  { userId: 2, username: 'aden.admin@edu.gov', fullName: 'أ. صالح مفرج السعدي', roleId: 2, govId: 2, mfaEnabled: true, isLoggedIn: false },
  { userId: 3, username: 'seerah.edu@edu.gov', fullName: 'أ. جلال عمر الحبيشي', roleId: 3, govId: 2, districtId: 20, mfaEnabled: false, isLoggedIn: false },
  { userId: 4, username: 'school.principal@edu.gov', fullName: 'أ. مريم يحيى الميسري', roleId: 4, govId: 2, districtId: 20, mfaEnabled: false, isLoggedIn: false },
  { userId: 5, username: 'payroll.head@edu.gov', fullName: 'أ. عادل محمد باشراحيل', roleId: 5, mfaEnabled: true, isLoggedIn: false }
];

export const mockWorkflowTransactions: WorkflowTransaction[] = [
  {
    transactionId: 101,
    referralCode: '022003001', // عدن(02)-صيرة(20)-قرار تعيين(03)-رقم(001)
    title: 'طلب اعتماد تعيين بديل في مدرسة بلقيس للتعليم الأساسي',
    senderName: 'أ. مريم يحيى الميسري (مديرة المدرسة)',
    receiverDept: 'إدارة شؤون المعلمين - أمانة المحافظة',
    initiatorId: 4,
    createdAt: '2026-06-10T09:00:00Z',
    status: 'معلق',
    qrCodeUrl: 'TRANSACTION_022003001_VERIFIED_SIGNATURE_9281A'
  },
  {
    transactionId: 102,
    referralCode: '011002005', // صنعاء(01)-التحرير(10)-مؤهل جامعي(02)-رقم(005)
    title: 'طلب تعديل درجة وظيفية بناءً على شهادة هرمية عليا (ماجستير)',
    senderName: 'أحمد علي حسن الشامي (موارد بشرية)',
    receiverDept: 'القطاع المالي والاستحقاق بوزارة التربية',
    initiatorId: 1,
    createdAt: '2026-06-12T11:30:00Z',
    status: 'معتمد',
    qrCodeUrl: 'TRANSACTION_011002005_VERIFIED_SIGNATURE_1105C'
  }
];

export const mockWorkflowSteps: WorkflowTransactionStep[] = [
  {
    stepId: 1,
    transactionId: 101,
    actorName: 'أ. مريم يحيى الميسري',
    actionTaken: 'إرسال',
    actionDate: '2026-06-10T09:05:00Z',
    comments: 'يرجى التكرم بالموافقة والتعميد بصورة عاجلة للضرورة الصفية.'
  },
  {
    stepId: 2,
    transactionId: 102,
    actorName: 'أحمد علي حسن الشامي',
    actionTaken: 'إرسال',
    actionDate: '2026-06-12T11:32:00Z',
    comments: 'مرفق لكم وثيقة شهادة الماجستير المعتمدة من وزارة التعليم العالي.'
  },
  {
    stepId: 3,
    transactionId: 102,
    actorName: 'أ. د. عبد الرحمن الكحلاني',
    actionTaken: 'اعتماد',
    actionDate: '2026-06-13T14:45:00Z',
    comments: 'يعتمد تعديل المستوى الوظيفي في كشف الراتب القادم وفق القوانين النافذة.',
    digitalSignature: 'SIG_SHA256_D7C49103B918AC24D9E9BC8F8EFE592019CD00B1A0413AA'
  }
];

export const mockDocuments: Document[] = [
  {
    documentId: 2001,
    title: 'الهوية الوطنية - أحمد الشامي',
    employeeId: 1001,
    documentTypeId: 1, // بطاقة شخصية
    uploadedAt: '2024-03-01T08:30:00Z',
    sha256Hash: 'a57fe23db427b003a29ec97bdaee287ae293b169b1836c1e905ea5bb6ca0d2ed'
  },
  {
    documentId: 2002,
    title: 'شهادة بكالوريوس - أروى صالح',
    employeeId: 1002,
    documentTypeId: 2, // مؤهل جامعي
    uploadedAt: '2024-10-15T10:00:00Z',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

export const mockAttendanceDevices: AttendanceDevice[] = [
  { deviceId: 1, schoolName: 'مدرسة بلقيس للبنات - صيرة', ipAddress: '10.12.30.4', status: 'متصل', lastPingTime: '2026-06-14T03:00:00-07:00' },
  { deviceId: 2, schoolName: 'مدرسة الثورة الأساسية - التحرير', ipAddress: '10.10.45.12', status: 'غير متصل', lastPingTime: '2026-06-13T21:15:00-07:00' }
];

export const mockAttendanceLogs: AttendanceLog[] = [
  { logId: 1, employeeId: 1002, timestamp: '2026-06-14T07:45:12Z', verifyMethod: 'بصمة وجه', deviceId: 1 },
  { logId: 2, employeeId: 1003, timestamp: '2026-06-14T07:58:34Z', verifyMethod: 'بصمة إصبع', deviceId: 1 }
];

export const mockAttendanceViolations: AttendanceViolation[] = [
  {
    violationId: 401,
    employeeId: 1002, // أروى (راتبها الأساسي 145,000)
    violationDate: '2026-06-08',
    violationType: 'تأخر صباحي',
    minutesCount: 120, // ساعتين
    isProcessed: true,
    deductionAmount: 1200
  },
  {
    violationId: 402,
    employeeId: 1003, // خالد (راتبه الأساسي 155,000)
    violationDate: '2026-06-09',
    violationType: 'غياب بدون عذر',
    minutesCount: 480, // يوم كامل
    isProcessed: false,
    deductionAmount: 5166 // (155000 / 30)
  }
];

export const mockTrainingPrograms: TrainingProgram[] = [
  {
    programId: 701,
    title: 'برنامج دمج التكنولوجيا بالحقيبة الصفية التفاعلية',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    trainerName: 'د. يوسف علي الغزي'
  },
  {
    programId: 702,
    title: 'الاستقصاء الموجه في تدريس مناهج الرياضيات المطورة',
    startDate: '2026-05-10',
    endDate: '2026-05-20',
    trainerName: 'أ. د. نجيبة المطهر'
  }
];

export const mockTrainingParticipants: TrainingParticipant[] = [
  {
    id: 901,
    programId: 702, // الاستقصاء الموجه
    employeeId: 1002, // أروى (أنها حضرت البرنامج سابقاً في تعز قبل انتقالها لعدن)
    locationId: 3, // تعز (موقعها السابق)
    status: 'مجتاز',
    nominatedAt: '2026-05-01T08:00:00Z'
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    evaluationId: 301,
    employeeId: 1004, // فاطمة طارق سيف
    evaluatorName: 'أ. عبد الله القدسي (موجه أول)',
    evaluationDate: '2026-06-05',
    finalScore: 48, // من أصل 100 (دون المتوسط)
    finalResult: 'دون المتوسط',
    notes: 'تعاني المعلمة من فجوة معرفية في أساليب صياغة الأسئلة السابرة ومستويات بلوم المعرفية.'
  },
  {
    evaluationId: 302,
    employeeId: 1002, // أروى صالح
    evaluatorName: 'أ. هناء جميل (موجه رياضيات)',
    evaluationDate: '2026-06-07',
    finalScore: 92,
    finalResult: 'ممتاز',
    notes: 'تحضير متميز واستخدام رائع للتطبيقات التفاعلية ودفتر الدرجات.'
  }
];

export const mockEvaluationIndicators: EvaluationIndicator[] = [
  { indicatorId: 1, title: 'تحضير وتخطيط وتوزيع المنهاج الدراسي', weight: 20 },
  { indicatorId: 2, title: 'التفاعل الصفي واستثارة دافعية المتعلمين', weight: 20 },
  { indicatorId: 3, title: 'استخدام التكنولوجيا المعاصرة والوسائل الإيضاحية', weight: 20 },
  { indicatorId: 4, title: 'التقويم الصفي المستمر والعدالة التفاضلية', weight: 20 },
  { indicatorId: 5, title: 'الانضباط والالتزام بالجدول الأسبوعي والتعليمات', weight: 20 }
];

export const mockAuditLogs: AuditLog[] = [
  {
    logId: 80001,
    userId: 1,
    actionType: 'LOGIN',
    tableName: 'Users',
    recordId: 1,
    newValueJson: '{"action":"SSO_SSO_LOGIN","success":true,"ip":"192.168.10.45","userAgent":"Mozilla/5.0"}',
    actionTimestamp: '2026-06-14T03:15:00-07:00',
    ipAddress: '192.168.10.45'
  },
  {
    logId: 80002,
    userId: 5,
    actionType: 'UPDATE',
    tableName: 'PayrollPeriods',
    recordId: 2,
    oldValueJson: '{"isClosed":false,"run_status":"initial"}',
    newValueJson: '{"isClosed":false,"run_status":"batch_calculated"}',
    actionTimestamp: '2026-06-14T03:22:00-07:00',
    ipAddress: '192.168.10.99'
  }
];
