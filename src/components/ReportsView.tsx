/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileSpreadsheet, Map, Award, Users, Printer, TrendingUp, Sparkles, Sliders } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportsView() {
  const [activeReport, setActiveReport] = useState<'surplus' | 'supervision' | 'payroll_diff' | 'funnel'>('surplus');

  return (
    <div id="reports-view-root" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar selection */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3.5 lg:col-span-1 shadow-sm text-xs">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-700" />
          <span>التقارير المؤسسية (Crystal Reports Standard)</span>
        </h3>

        <div className="space-y-1.5">
          <button
            onClick={() => setActiveReport('surplus')}
            className={`w-full text-right p-3 rounded-xl font-bold flex items-center justify-between transition-all ${
              activeReport === 'surplus' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>عجز ووفورات المعلمين بالمديريات</span>
            <Map className="h-4.5 w-4.5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveReport('supervision')}
            className={`w-full text-right p-3 rounded-xl font-bold flex items-center justify-between transition-all ${
              activeReport === 'supervision' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>الزيارات التوجيهية الشهرية للموجهين</span>
            <Award className="h-4.5 w-4.5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveReport('payroll_diff')}
            className={`w-full text-right p-3 rounded-xl font-bold flex items-center justify-between transition-all ${
              activeReport === 'payroll_diff' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>فروقات الرواتب وبدل الريف والبدل المضاف</span>
            <TrendingUp className="h-4.5 w-4.5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveReport('funnel')}
            className={`w-full text-right p-3 rounded-xl font-bold flex items-center justify-between transition-all ${
              activeReport === 'funnel' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>قمع التوظيف والتعاقد السنوي (Funnel)</span>
            <Users className="h-4.5 w-4.5 shrink-0" />
          </button>
        </div>

        <button
          id="print-crystal-report"
          onClick={() => window.print()}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl py-2.5 font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-250 mt-4"
        >
          <Printer className="h-4 w-4" />
          <span>تصدير وطباعة Crystal PDF</span>
        </button>
      </div>

      {/* Main Report Canvas */}
      <div className="lg:col-span-3 relative">
        <div id="crystal-report-canvas" className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm min-h-[480px] relative overflow-hidden">
          
          {/* Prominent Corner Watermark (Alawlqe Brand) */}
          <div className="absolute top-22 right-6 pointer-events-none select-none opacity-[0.08] text-right font-black z-0">
            <p className="text-4xl tracking-widest uppercase font-mono text-emerald-800">Alawlqe</p>
            <p className="text-[10px] pr-1">العلامة المائية المعتمدة لقوانين الصرف</p>
          </div>

          {/* Official MoE Header style for all report cards when printing */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right text-xs text-slate-600 font-bold relative z-10">
            <div className="space-y-1">
              <h1 className="text-sm font-black text-slate-900">وزارة التربية والتعليم والتعليم الفني</h1>
              <h2>قطاع التخطيط والمديريات - قطاع الرقابة المالية</h2>
              <p>نظام الاستحقاق وإدارة الموارد البشرية المتكامل</p>
            </div>
            
            <div className="text-center">
              {/* MoE Emblem mockup */}
              <div className="h-10 w-10 bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-black rounded-lg mx-auto text-emerald-800 border-emerald-500/20">M.O.E</div>
              <span className="text-[9px] font-mono block mt-1 tracking-wider text-slate-400">MoE Yemen Official</span>
            </div>
            
            <div className="space-y-1 font-mono text-left text-[10px]">
              <p>رقم التقرير الفني: RPT-{activeReport.toUpperCase()}-2026</p>
              <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
              {/* Mecca Time timezone and 12-hour AM/PM format display */}
              <p>توقيت مكة المكرمة: {new Date().toLocaleTimeString('ar-YE', { timeZone: 'Asia/Riyadh', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              <p className="text-emerald-700 font-bold">الحالة: معمد ومطابق لمعايير الحماية</p>
            </div>
          </div>

          <div className="space-y-4">
            {activeReport === 'surplus' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">تقرير الاحتياج الفعلي وعجز ووفورات معلمي المواد الأساسية بالمديريات</h3>
                  <p className="text-slate-500 mt-1">تحديد نسب العجز والتكدس في المدارس الأساسية لموازنة حصص التدريس الأسبوعية.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y-2 divide-slate-900 bg-white border border-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-bold">
                      <tr>
                        <th className="px-4 py-3">المديرية المستهدفة</th>
                        <th className="px-4 py-3">المادة الدراسية</th>
                        <th className="px-4 py-3 text-center">إجمالي حصص التدريس الأسبوعية</th>
                        <th className="px-4 py-3 text-center">الكادر المتوفر بالميدان</th>
                        <th className="px-4 py-3 text-center">العجز / الوفر (معلمون)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="px-4 py-2.5">مديرية صيرة - أمانة العاصمة</td>
                        <td className="px-4 py-2.5">رياضيات (إعدادي والثانوية)</td>
                        <td className="px-4 py-2.5 text-center">340 حصة أسوعية</td>
                        <td className="px-4 py-2.5 text-center">15 معلم مكرر</td>
                        <td className="px-4 py-2.5 text-center text-red-650 font-black">-2 عجز معلم رئيسي</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">مديرية التحرير - صنعاء</td>
                        <td className="px-4 py-2.5">فيزياء وعلوم الطقس</td>
                        <td className="px-4 py-2.5 text-center">210 حصة</td>
                        <td className="px-4 py-2.5 text-center">12 معلم</td>
                        <td className="px-4 py-2.5 text-center text-emerald-800 font-black">+1 وفر (توزيع بديل)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">مديرية المكلا - حضرموت</td>
                        <td className="px-4 py-2.5">اللغة العربية والنحو</td>
                        <td className="px-4 py-2.5 text-center">520 حصة</td>
                        <td className="px-4 py-2.5 text-center">24 معلم</td>
                        <td className="px-4 py-2.5 text-center text-amber-800 font-bold">-4 عجز مدرج</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeReport === 'supervision' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">تقرير المتابعة والزيارات التوجيهية وتتبع الزيارات الميدانية للموجهين</h3>
                  <p className="text-slate-500 mt-1">تتبع نشاطات التوجيه المدرسي للتأكد من صهر مخرجات التدريس وتعديل السلوك الصفي.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y-2 divide-slate-900 bg-white border border-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-bold">
                      <tr>
                        <th className="px-4 py-3">اسم الموجه المكلف بالزيارة</th>
                        <th className="px-4 py-3">المدرسة المستهدفة</th>
                        <th className="px-4 py-3 text-center">المعلم المزار</th>
                        <th className="px-4 py-3 text-center">تاريخ المتابعة</th>
                        <th className="px-4 py-3 text-center">تقييم الموجه النهائي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="px-4 py-2.5">أ. عبد الله القدسي (موجه أول)</td>
                        <td className="px-4 py-2.5">مدرسة الثورة الأساسية للبنين</td>
                        <td className="px-4 py-2.5 text-center">فاطمة القباطي</td>
                        <td className="px-4 py-2.5 text-center font-mono">2026-06-05</td>
                        <td className="px-4 py-2.5 text-center text-red-650 font-black">48/100 (ضعيف - دون المتوسط)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">أ. هناء جميل (موجه تخصصي)</td>
                        <td className="px-4 py-2.5">مدرسة بلقيس للتعليم الأساسي</td>
                        <td className="px-4 py-2.5 text-center">أروى محمد صالح</td>
                        <td className="px-4 py-2.5 text-center font-mono">2026-06-07</td>
                        <td className="px-4 py-2.5 text-center text-emerald-800 font-black">92/100 (ممتاز)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeReport === 'payroll_diff' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">تقرير فروقات وصافي تداول كشف الرواتب وبدل الريف والبدلات الهيكلية</h3>
                  <p className="text-slate-500 mt-1">تبيان مستحقات وعلاوات وبدلات المناطق السكنية الوعرة والصعبة بالمحافظات للعام المالي الجاري.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y-2 divide-slate-900 bg-white border border-slate-200">
                    <thead className="bg-slate-50 text-slate-705 font-bold">
                      <tr>
                        <th className="px-4 py-3">المستوى الجغرافي</th>
                        <th className="px-4 py-3">إجمالي الكادر المستحق</th>
                        <th className="px-4 py-3 text-center">إجمالي الرواتب الأساسية</th>
                        <th className="px-4 py-3 text-center">مجموع بدل الريف (15%)</th>
                        <th className="px-4 py-3 text-center">الخصومات والاستقطاعات</th>
                        <th className="px-4 py-3 text-center">صافي التدفق المالي الكلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="px-4 py-2.5">مكتب أمانة العاصمة صنعاء</td>
                        <td className="px-4 py-2.5">485 معلم وعامل</td>
                        <td className="px-4 py-2.5 text-center font-mono">15,480,000 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono">2,322,000 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono text-amber-800">430,000 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold">17,372,000 ر.ي</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">مكتب تربية محافظة عدن</td>
                        <td className="px-4 py-2.5">182 معلم وعامل</td>
                        <td className="px-4 py-2.5 text-center font-mono">8,950,000 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono">1,342,500 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono text-amber-800">120,500 ر.ي</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold">10,172,000 ر.ي</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeReport === 'funnel' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 text-center md:text-right">قمع تتبع تصفية وترشيح التوظيف والتعاقد السنوي الوزاري (Recruitment Funnel)</h3>
                  <p className="text-slate-500 mt-1 text-center md:text-right">تحليل إحصائي لمراحل التصفية والقبول النهائي لكادر المعلمين المتعاقدين الجدد في المدارس.</p>
                </div>

                <div className="max-w-md mx-auto space-y-4 pt-4 font-bold text-slate-700">
                  {/* Stages */}
                  <div className="relative text-center bg-slate-900 text-white rounded-xl py-3.5 px-4 shadow-sm">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">المرحلة 1: المتقدمون للمسابقة السنوية</span>
                    <p className="text-sm font-mono font-bold">14,250 ملم تعليمي ورائد</p>
                    <p className="text-[9px] text-slate-400 mt-1">توزيع الطلبات عبر الموقع الموحد وبوابات المديريات</p>
                  </div>

                  <div className="relative text-center bg-slate-800 text-slate-100 rounded-xl py-3 px-4 shadow-sm max-w-[90%] mx-auto">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">المرحلة 2: من تمت مقابلتهم واجتازوا الفحص الأولي</span>
                    <p className="text-xs font-mono font-semibold">4,120 متأهل للمرحلة الشفهية</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">مقارنة المؤهلات مع نظام شق الكفاءات</p>
                  </div>

                  <div className="relative text-center bg-teal-900 border border-teal-800 text-slate-100 rounded-xl py-3 px-4 shadow-sm max-w-[80%] mx-auto">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">المرحلة 3: المتخرجون من معاهد التوجيه والتدريب الأولي</span>
                    <p className="text-xs font-mono font-semibold">1,850 مؤهل نهائي للدرجة</p>
                  </div>

                  <div className="relative text-center bg-emerald-700 text-white rounded-xl py-3.5 px-4 shadow-sm max-w-[70%] mx-auto">
                    <span className="text-[10px] text-yellow-300 font-black block mb-1">المرحلة 4: الذين تم تعيينهم رسميًا والتعاقد معهم</span>
                    <p className="text-xs font-mono font-black">940 عقود تعيين سنوية نشطة بالمدارس</p>
                    <div className="text-[8px] bg-emerald-900/40 text-emerald-100 py-1 rounded inline-block mt-1.5 px-2.5">
                      معدل التحويل الكلي: 6.6٪ كفاءة تصفية تخصصية
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Secure Verification QR Code & Endorsement Signatures (Adeeb Alawlqe) */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-500 font-semibold relative z-10">
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {/* QR Verification Vector representation */}
              <div className="h-14 w-14 bg-white border border-slate-350 p-1 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-full w-full text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h6v6H3V3zM3 15h6v6H3v-6zM15 3h6v6h-6V3zM15 15h6v6h-6v-6zM9 9h2v2H9V9zM13 13h2v2h-2v-2zM9 13h2v2H9v-2zM13 9h2v2h-2V9z" />
                </svg>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="font-bold text-slate-850">كود التحقق والنزاهة الثنائي</p>
                <p className="text-[10px] text-slate-400 leading-tight">امسح لمطابقة السجلات بالخادم السحابي الوطني</p>
                <p className="font-mono text-[9px] text-emerald-700">HASH: SHA256_YEM_EDU_908X</p>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <p className="text-slate-400">اسم الاعتماد والتوقيع الرسمي للدولة:</p>
              <p className="text-xs font-black text-slate-900 font-sans tracking-wide">أديب العولقي</p>
              <p className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block">مدير عام قطاع الرقابة والاعتماد المؤسسي</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
