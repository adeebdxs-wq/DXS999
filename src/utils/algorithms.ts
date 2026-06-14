/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrainingParticipant, TrainingProgram, TrainingNeed, TrainingDeduplicationLog, AttendanceViolation, PayrollEmployeeTransaction } from '../types';

/**
 * خوارزمية رقم 1: توليد الرقم المرجعي الذكي المشفر بالصيغة:
 * [المحافظة: خانتان][المديرية: خانتان][نوع المعاملة: خانتان][تسلسلي: 3 خانات]
 * مثال: المحافظة(01)، المديرية(10)، نوع المعاملة(03)، تسلسلي(009) -> "011003009"
 */
export function generateSmartReferralCode(
  govId: number,
  districtId: number,
  docTypeId: number,
  sequence: number
): string {
  const govStr = String(govId).padStart(2, '0').slice(-2);
  // Districts might be like 10, 20. If they are large, pad to 2 chars
  const distStr = String(districtId).slice(-2).padStart(2, '0');
  const typeStr = String(docTypeId).padStart(2, '0').slice(-2);
  const seqStr = String(sequence).padStart(3, '0').slice(-3);
  return `${govStr}${distStr}${typeStr}${seqStr}`;
}

/**
 * خوارزمية رقم 2: منع التكرار المتقاطع للتدريب (Cross-Location Deduplication)
 * تبحث الخوارزمية في تاريخ تدريب الموظف، فإذا كان قد التحق بنفس البرنامج في محافظة/موقع سابق،
 * يتم استبعاده تلقائياً وتوليد سجل إثبات المنع.
 */
export function checkTrainingDeduplication(
  employeeId: number,
  programId: number,
  nominationLocationId: number,
  historyParticipants: TrainingParticipant[],
  allPrograms: TrainingProgram[],
  locations: { id: number; name: string }[]
): {
  isDuplicate: boolean;
  log?: Omit<TrainingDeduplicationLog, 'logId' | 'detectedAt'>;
} {
  // البحث عن تاريخ مشاركة المعلم في هذا البرنامج بمكان آخر
  const previousRecord = historyParticipants.find(
    (p) => p.employeeId === employeeId && p.programId === programId && (p.status === 'مجتاز' || p.status === 'مستمر')
  );

  if (previousRecord) {
    const program = allPrograms.find((prog) => prog.programId === programId);
    const prevLoc = locations.find((l) => l.id === previousRecord.locationId);

    return {
      isDuplicate: true,
      log: {
        employeeId,
        employeeName: '', // Stored in DB
        programId,
        programTitle: program ? program.title : 'برنامج تدريب غير معرف',
        previousLocationName: prevLoc ? prevLoc.name : `موقع معرّف برقم ${previousRecord.locationId}`,
        proofDetails: `الرقم المرجعي للمشاركة الجارية: (#${previousRecord.id}) - الحالة: ${previousRecord.status} في ${prevLoc ? prevLoc.name : 'موقع آخر'}`
      }
    };
  }

  return { isDuplicate: false };
}

/**
 * خوارزمية رقم 3: التشابك الآلي للتقييم والتوجيه (Evaluation Auto-Trigger)
 * إذا حاز المعلم على تقييم "دون المتوسط" (أقل من 50 درجة من 100)،
 * ينشئ النظام تلقائياً احتياجاً تدريبياً معجلاً بأولوية قصوى واهتمام عاجل.
 */
export function evaluateTeacherScore(
  employeeId: number,
  scores: { indicatorId: number; score: number }[],
  indicators: { indicatorId: number; title: string; weight: number }[]
): {
  finalScore: number;
  finalResult: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'دون المتوسط';
  autoCreatedNeed?: Omit<TrainingNeed, 'needId' | 'createdAt'>;
} {
  // حساب المجموع الكلي الحقيقي والمجموع الأقصى
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxPossible = indicators.reduce((sum, i) => sum + i.weight, 0);

  // تحجيم النسبة المئوية لتكافئ التقييم من 100
  const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

  let result: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'دون المتوسط' = 'دون المتوسط';
  if (percentage >= 90) result = 'ممتاز';
  else if (percentage >= 80) result = 'جيد جداً';
  else if (percentage >= 65) result = 'جيد';
  else if (percentage >= 50) result = 'مقبول';

  let autoCreatedNeed: Omit<TrainingNeed, 'needId' | 'createdAt'> | undefined;

  if (result === 'دون المتوسط') {
    autoCreatedNeed = {
      employeeId,
      suggestedProgramTitle: 'البرنامج المكثف لتنمية الاستدلال المعرفي والمهارات الإيضاحية الأساسية',
      priority: 1, // أولوية قصوى
      source: 'تقييم ضعيف',
      status: 'معلق'
    };
  }

  return {
    finalScore: Math.round(percentage),
    finalResult: result,
    autoCreatedNeed
  };
}

/**
 * خوارزمية رقم 4: التشابك الآلي بين البصمة والرواتب (Attendance & Payroll Sync Code)
 * أي قيد في مخالفات الحضور والغياب يتم تحليله لتوليد معاملة خصم مالي فوري من جدول الرواتب الأساسية.
 */
export function processAttendanceViolationBenefit(
  violation: AttendanceViolation,
  baseSalary: number,
  periodId: number
): {
  amount: number;
  transaction: Omit<PayrollEmployeeTransaction, 'transactionId' | 'createdAt'>;
} {
  let deductionAmount = 0;
  const dailyRate = baseSalary / 30;

  if (violation.violationType === 'غياب بدون عذر') {
    // خصم يوم كامل
    deductionAmount = dailyRate;
  } else if (violation.violationType === 'تأخر صباحي') {
    // خصم نسبي يعتمد الدقائق، مع احتساب غرامة إضافية (سعر دقيقة العمل مضاعف بـ 1.5)
    // نعتبر يوم العمل 8 ساعات (480 دقيقة)
    const minuteRate = dailyRate / 480;
    deductionAmount = violation.minutesCount * minuteRate * 1.5;
  } else if (violation.violationType === 'خروج مبكر') {
    const minuteRate = dailyRate / 480;
    deductionAmount = violation.minutesCount * minuteRate * 1.2;
  }

  deductionAmount = Math.round(deductionAmount);

  return {
    amount: deductionAmount,
    transaction: {
      employeeId: violation.employeeId,
      periodId,
      transactionType: 'استقطاع',
      amount: deductionAmount,
      description: `خصم تلقائي نظام البصمة: مخالفة [${violation.violationType}] بتاريخ [${violation.violationDate}]`
    }
  };
}
