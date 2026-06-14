/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  mockEmployees,
  mockLocations,
  mockDistricts,
  mockAuditLogs,
  mockEvaluations,
  mockEvaluationIndicators,
  mockAttendanceViolations
} from './data/seedData';
import { HrEmployee, User, AuditLog, Evaluation, AttendanceViolation } from './types';
import { evaluateTeacherScore, processAttendanceViolationBenefit } from './utils/algorithms';

// Components
import SSOModal from './components/SSOModal';
import DashboardView from './components/DashboardView';
import EmployeeProfileView from './components/EmployeeProfileView';
import TransactionsInboxView from './components/TransactionsInboxView';
import PayrollManagerView from './components/PayrollManagerView';
import TrainingDeduplicatorView from './components/TrainingDeduplicatorView';
import OfflineSyncView from './components/OfflineSyncView';
import ReportsView from './components/ReportsView';
import SqlExplorer from './components/SqlExplorer';

import {
  LayoutDashboard,
  FileCheck,
  Calculator,
  GraduationCap,
  Wifi,
  FileText,
  Database,
  Building,
  UserCheck,
  ShieldCheck,
  ListTodo,
  TrendingDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [employees, setEmployees] = useState<HrEmployee[]>(mockEmployees);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Custom interactive testing states
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [violations, setViolations] = useState<AttendanceViolation[]>(mockAttendanceViolations);

  // Active Tab navigation indicator representation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'inbox' | 'payroll' | 'training' | 'offline' | 'reports' | 'sql'>('dashboard');

  // Trigger evaluation score calculation & testing autolink
  const [testEvalEmpId, setTestEvalEmpId] = useState<number>(1004); // Fatima القباطي
  const [testScorePrep, setTestScorePrep] = useState<number>(8); // Under average triggers
  const [testScoreInteract, setTestScoreInteract] = useState<number>(6);
  const [testScoreTech, setTestScoreTech] = useState<number>(5);
  const [testScoreEqual, setTestScoreEqual] = useState<number>(10);
  const [testScoreCommit, setTestScoreCommit] = useState<number>(9);
  const [evalCreatedMsg, setEvalCreatedMsg] = useState<string | null>(null);

  // Trigger attendance violation process autolink
  const [testViolEmpId, setTestViolEmpId] = useState<number>(1003); // Khaled
  const [testViolType, setTestViolType] = useState<'غياب بدون عذر' | 'تأخر صباحي'>('غياب بدون عذر');
  const [violationCreatedMsg, setViolationCreatedMsg] = useState<string | null>(null);

  // Global helper to add simulated audit logs
  const handleAddNewAuditLog = (
    action: AuditLog['actionType'],
    tableName: string,
    recordId: number,
    valOld?: string,
    valNew?: string
  ) => {
    const newLogId = Math.floor(Math.random() * 900000) + 10000;
    const newLog: AuditLog = {
      logId: newLogId,
      userId: currentUser ? currentUser.userId : 1,
      actionType: action,
      tableName,
      recordId,
      oldValueJson: valOld,
      newValueJson: valNew,
      actionTimestamp: new Date().toISOString(),
      ipAddress: '192.168.10.45'
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const currentRoleName = currentUser ? currentUser.username : 'زائر تصفح فقط';

  // Autolink #1: Evaluation grade weak -> automated Training Needs creation
  const handleTestCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setEvalCreatedMsg(null);

    const scores = [
      { indicatorId: 1, score: testScorePrep },
      { indicatorId: 2, score: testScoreInteract },
      { indicatorId: 3, score: testScoreTech },
      { indicatorId: 4, score: testScoreEqual },
      { indicatorId: 5, score: testScoreCommit }
    ];

    const { finalScore, finalResult, autoCreatedNeed } = evaluateTeacherScore(
      testEvalEmpId, 
      scores, 
      mockEvaluationIndicators
    );

    const targetEmp = employees.find(emp => emp.employeeId === testEvalEmpId);
    if (!targetEmp) return;

    const newEvalId = Math.floor(Math.random() * 5000) + 1000;
    const newEval: Evaluation = {
      evaluationId: newEvalId,
      employeeId: testEvalEmpId,
      evaluatorName: currentUser ? currentUser.fullName : 'زائر تجريبي',
      evaluationDate: new Date().toISOString().split('T')[0],
      finalScore,
      finalResult,
      notes: `اختبار تشابك المعطيات التلقائي. النسبة: %${finalScore}`
    };

    setEvaluations(prev => [newEval, ...prev]);

    let extraLog = '';
    if (autoCreatedNeed) {
      extraLog = ` [تم أيضاً إدراج احتياج تدريبي مكثف بـ Priority 1 تلقائياً!]`;
    }

    setEvalCreatedMsg(`تم تسجيل التقييم بنجاح بنتيجة [${finalResult}] (${finalScore}/100)${extraLog}.`);
    
    handleAddNewAuditLog(
      'INSERT',
      'Evaluations',
      newEvalId,
      undefined,
      JSON.stringify({ score: finalScore, result: finalResult, needTriggered: !!autoCreatedNeed })
    );
  };

  // Autolink #2: Attendance Violation -> automated Payroll balance deduction
  const handleTestCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    setViolationCreatedMsg(null);

    const targetEmp = employees.find(emp => emp.employeeId === testViolEmpId);
    if (!targetEmp) return;

    const newViolId = Math.floor(Math.random() * 8000) + 1000;
    const minutes = testViolType === 'غياب بدون عذر' ? 480 : 120; // 8 hours or 2 hours
    const baseVal: AttendanceViolation = {
      violationId: newViolId,
      employeeId: testViolEmpId,
      violationDate: new Date().toISOString().split('T')[0],
      violationType: testViolType,
      minutesCount: minutes,
      isProcessed: true,
      deductionAmount: 0
    };

    const { amount, transaction } = processAttendanceViolationBenefit(
      baseVal,
      targetEmp.baseSalary,
      2 // Current active period (June 2026)
    );

    setViolations(prev => [{ ...baseVal, deductionAmount: amount }, ...prev]);
    setViolationCreatedMsg(`تم رصد المخالفة وتعميد خصم فوري بمقدار ${amount.toLocaleString()} ر.ي من سجل الراتب.`);

    handleAddNewAuditLog(
      'INSERT',
      'AttendanceViolations',
      newViolId,
      undefined,
      JSON.stringify({ employee: targetEmp.fullName, deduction: amount, type: testViolType })
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white antialiased relative overflow-hidden" dir="rtl">
        {/* Subtle decorative background lights */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Corporate branding Watermark */}
        <div className="absolute top-10 left-10 pointer-events-none select-none opacity-[0.05] font-black z-0">
          <p className="text-5xl tracking-widest uppercase font-mono text-emerald-400">Alawlqe</p>
        </div>

        {/* Header */}
        <header className="py-6 border-b border-slate-900 relative z-10 bg-slate-950/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-right">
              <div className="h-12 w-12 bg-white text-slate-900 flex items-center justify-center text-xs font-black rounded-2xl shadow-lg border border-emerald-500/20 shrink-0">
                <Building className="h-7 w-7 text-emerald-800" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-100 leading-tight animate-fade-in">ديوان عام وزارة التربية والتعليم والتعليم العالي</h1>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">الجمهورية اليمنية • البوابة الرقمية الوطنية الموحدة</p>
              </div>
            </div>
            
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider select-none animate-pulse">
              رؤية اليمن التعليمية الموثوقة 2026
            </span>
          </div>
        </header>

        {/* Main centered card */}
        <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-normal">نظام إدارة الموارد البشرية المتكامل</h2>
              <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
                الرجاء إتمام تسجيل الدخول باستخدام حساب الموظف الموحد (OIDC) لولوج لوحة التحكم واستخدام النظام المركزي الموحد.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-1 border border-slate-800 shadow-2xl">
              <SSOModal
                currentUser={currentUser}
                onLogin={(user) => setCurrentUser(user)}
                onLogout={() => setCurrentUser(null)}
                onAddAuditLog={handleAddNewAuditLog}
              />
            </div>

            <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 flex items-start gap-2.5 text-right text-[11px] text-slate-400 max-w-md mx-auto">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">
                جميع المعاملات المالية، تعديلات الرواتب وتقارير التفتيش خاضعة لسلطة تدقيق صارمة من الفئة الرابعة (Maker-Checker). يمنع استخدام حسابات من مستويات غير مصرحة.
              </p>
            </div>
          </div>
        </main>

        {/* Footnotes / Corporate Footer */}
        <footer className="py-6 border-t border-slate-900 text-slate-500 text-center text-xs relative z-10 bg-slate-950/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p>© {new Date().getFullYear()} ديوان عام وزارة التربية والتعليم والتعليم العالي بالجمهورية اليمنية. جميع الحقوق والملكيات الأمنية محفوظة لـ Alawlqe.</p>
            <div className="flex justify-center gap-4 text-slate-600 font-mono text-[9px] flex-wrap">
              <span>التوثيق الموحد: OpenID Connect Protocol v2.5</span>
              <span>•</span>
              <span>آلة حماية البيانات: AES-PGP GnuPG Encrypted Core System</span>
              <span>•</span>
              <span>توقيع الاعتماد: أديب العولقي</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans leading-relaxed selection:bg-emerald-600 selection:text-white antialiased flex flex-col">
      {/* Official State Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-right">
            {/* National emblem emblem representation */}
            <div className="h-12 w-12 bg-white text-slate-900 flex items-center justify-center text-xs font-black rounded-2xl shadow-inner border border-emerald-500/20 shrink-0">
              <Building className="h-7 w-7 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/10 text-[9px] font-black px-2 py-0.5 rounded-full inline-block font-sans select-none animate-pulse">
                  رؤية اليمن التعليمية الموثوقة 2026
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-100 mt-0.5 leading-tight">ديوان عام وزارة التربية والتعليم والتعليم العالي</h1>
              <p className="text-xs text-slate-400 font-semibold" id="app-description">نظام إدارة الموارد البشرية وبطاقات المعلمين والبدلات المالية التكاملي</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span>مرحبا: {currentUser ? currentUser.fullName : 'تصفح كعلامة زائر'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Core Workspaces */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Top-Level Quick SSO and 2FA controller panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-tr from-slate-900 to-teal-950 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-md">
              <div className="relative z-10 space-y-3.5">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-block">
                  النظم الهيكلية والمستويات الـ 4
                </span>
                
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  بيئة التطبيق المركزي الموحد للازدواجية، الرواتب والبدلات الوطنية للمعلمين بالمدن والأرياف
                </h2>
                
                <p className="text-slate-350 text-xs leading-relaxed max-w-2xl font-semibold">
                  يربط هذا الكيان المحافظات اليمنية الأربعة (ديوان أمانة العاصمة، مكتب تعز، مكتب عدن، ومكتب حضرموت) ويحفز خوارزميات الاستبعاد الجغرافي المتقاطع وتوليد الأكواد بالتشفير الآمن.
                </p>
              </div>
              
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 select-none">
                <LayoutDashboard className="h-48 w-48 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* User Sign In and OpenID connection badge */}
          <div id="app-sso-container" className="lg:col-span-1">
            <SSOModal
              currentUser={currentUser}
              onLogin={(user) => setCurrentUser(user)}
              onLogout={() => setCurrentUser(null)}
              onAddAuditLog={handleAddNewAuditLog}
            />
          </div>
        </div>

        {/* Navigation Core Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-2.5 flex flex-wrap gap-2 shadow-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>لوحة المؤشرات والتحليلات</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profile' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="h-4.5 w-4.5" />
            <span>معاينة ملف الموظف والـ QR</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'inbox' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="h-4.5 w-4.5" />
            <span>صندوق المعاملات والتواقيع</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'payroll' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4.5 w-4.5" />
            <span>مدير الحزم وصرف المرتبات</span>
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'training' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="h-4.5 w-4.5" />
            <span>المطابقة ومنع الترشيح المكرر</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'offline' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wifi className="h-4.5 w-4.5" />
            <span>مراقبة المزامنة وعزل البيانات</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'reports' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            <span>التقارير المؤسسية (Crystal)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'sql' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Database className="h-4.5 w-4.5" />
            <span>سكريبتات الداتا والأمن (DDL)</span>
          </button>
        </div>

        {/* Dynamic Views Rendering Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  employees={employees}
                  locations={mockLocations}
                  districts={mockDistricts}
                />
              )}

              {activeTab === 'profile' && (
                <EmployeeProfileView
                  currentUser={currentUser}
                  employees={employees}
                  onAddAuditLog={handleAddNewAuditLog}
                />
              )}

              {activeTab === 'inbox' && (
                <TransactionsInboxView
                  currentUser={currentUser}
                  onAddAuditLog={handleAddNewAuditLog}
                />
              )}

              {activeTab === 'payroll' && (
                <PayrollManagerView
                  currentUser={currentUser}
                  employees={employees}
                  onAddAuditLog={handleAddNewAuditLog}
                />
              )}

              {activeTab === 'training' && (
                <TrainingDeduplicatorView
                  currentUser={currentUser}
                  employees={employees}
                  onAddAuditLog={handleAddNewAuditLog}
                />
              )}

              {activeTab === 'offline' && (
                <OfflineSyncView
                  currentUser={currentUser}
                  onAddAuditLog={handleAddNewAuditLog}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView />
              )}

              {activeTab === 'sql' && (
                <SqlExplorer />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Autolink interactive testing sandbox */}
        <div id="interactive-links-sandbox" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Autolink 1: Weak evaluation triggers training need */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-stone-50 pb-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-700" />
              <span>فحص تشابك تقييم المعلم مع احتياجه التدريبي الآلي</span>
            </h3>
            
            <p className="text-slate-500 font-semibold leading-relaxed">
              إذا قيم موجه أول المعلم(ة) بدرجة ضعيفة تقود لنتيجة <strong>"دون المتوسط"</strong> (أقل من 50 درجة من 100)، سينشئ رمز التشابك بالخادم تلقائياً طلباً مستعجلاً في جدول <code>TrainingNeeds</code> بأعلى أولوية.
            </p>

            <form onSubmit={handleTestCreateEvaluation} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">المعلم المفترض للتقييم:</label>
                  <select 
                    value={testEvalEmpId}
                    onChange={(e) => setTestEvalEmpId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans font-semibold text-slate-800 focus:outline-none"
                  >
                    {employees.map(e => (
                      <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">تحضير الدروس وتوزيع الصفحات (أقصى 20):</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={20}
                    value={testScorePrep}
                    onChange={(e) => setTestScorePrep(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">تفاعل الطلاب (20):</label>
                  <input 
                    type="number" min={0} max={20} value={testScoreInteract}
                    onChange={(e) => setTestScoreInteract(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">استخدام التقنيات (20):</label>
                  <input 
                    type="number" min={0} max={20} value={testScoreTech}
                    onChange={(e) => setTestScoreTech(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">دفتر الدرجات (20):</label>
                  <input 
                    type="number" min={0} max={20} value={testScoreEqual}
                    onChange={(e) => setTestScoreEqual(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-2 font-bold transition-all text-center block"
              >
                تعديل وتخمين التقييم ومطابقة التشابك
              </button>
            </form>

            {evalCreatedMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 text-[10px] font-bold">
                {evalCreatedMsg}
              </div>
            )}
          </div>

          {/* Autolink 2: biometric violation -> automated payroll benefit deduction */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-stone-50 pb-2">
              <TrendingDown className="h-4.5 w-4.5 text-emerald-700" />
              <span>فحص تشابك البصمة والخصومات المالية التلقائية</span>
            </h3>

            <p className="text-slate-500 font-semibold leading-relaxed">
              تؤدي مخالفات الحضور والانضباط بجدول البصمة المدرسي آلياً لتوليد استقطاع ومعاملة خصم من مرتب الموظف الجاري في جدول الرواتب الفنية بمقدار موازٍ لنسبة غيابه أو تأخيره.
            </p>

            <form onSubmit={handleTestCreateViolation} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">الموظف المعني بالمخالفة:</label>
                  <select 
                    value={testViolEmpId}
                    onChange={(e) => setTestViolEmpId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans font-semibold text-slate-800 focus:outline-none"
                  >
                    {employees.map(e => (
                      <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">نوع المخالفة المرصودة بالبصمة:</label>
                  <select 
                    value={testViolType}
                    onChange={(e) => setTestViolType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans font-semibold focus:outline-none text-slate-850"
                  >
                    <option value="غياب بدون عذر">غياب بدون عذر (يصادر يوم مال كامل)</option>
                    <option value="تأخر صباحي">تأخر صباحي (خصم نسبي مضاف بـ 1.5)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-2 font-bold transition-all text-center block"
              >
                توليد مخالفة البصمة وتطبيق الخصم بالدفتر المالي
              </button>
            </form>

            {violationCreatedMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 text-[10px] font-bold">
                {violationCreatedMsg}
              </div>
            )}
          </div>
        </div>

        {/* Global Immutable Security Audit Logs (Demonstrates Database constraint) */}
        <div id="security-audit-panel" className="bg-slate-900 text-slate-200 rounded-2xl p-6 space-y-4 border border-slate-850 shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>سجلات الرقابة الأمنية اللامتناهية (Immutable Audit Logs Ledger)</span>
            </h3>
            
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-block">
              زناد الحماية نشط: يمنع التعديل نهائياً
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed font-semibold">
            يتم تسجيل كافة إجراءات SSO، مزامنة الشبكة لـ IndexedDB، والتشابكات المباشرة بالأعلى داخل هذا السجل المحمي بزناد قاعدة البيانات <code>Auditlogs_Immutable_Trigger</code> الذي يقيد الحذف أو التعديل لأغراض الرقابة الرسمية السنوية للوزارة.
          </p>

          <div className="divide-y divide-slate-800 max-h-[190px] overflow-y-auto scrollbar-thin pr-1 font-mono text-[10px] space-y-2 mt-2">
            {auditLogs.map((log, index) => (
              <div key={log.logId} className="pt-2 flex items-start justify-between gap-4">
                <div className="space-y-1.5 text-right flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-100">{log.actionType}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">الجدول: {log.tableName}</span>
                    <span className="text-[9px] text-slate-500">رقم السجل: #{log.recordId}</span>
                  </div>
                  
                  {log.newValueJson && (
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400 break-all leading-tight text-right">
                      {log.newValueJson}
                    </div>
                  )}
                </div>

                <div className="text-left shrink-0 text-slate-500 space-y-0.5 whitespace-nowrap">
                  <p className="font-mono text-[9px] text-slate-500">الرقم: L-{log.logId}</p>
                  <p className="text-slate-500 font-mono text-[9px]">الوقت: {new Date(log.actionTimestamp).toLocaleTimeString('ar-YE', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true})}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Corporate Institution Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p>© {new Date().getFullYear()} ديوان عام وزارة التربية والتعليم والتعليم العالي بالجمهورية اليمنية. جميع الحقوق والملكيات الأمنية محفوظة.</p>
          <div className="flex justify-center gap-4 text-slate-500 font-mono text-[10px]">
            <span>التوثيق الموحد: OpenID Connect Open Identity Protocol v2.5</span>
            <span>•</span>
            <span>آلة حماية البيانات: AES-PGP GnuPG Encrypted Core System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
