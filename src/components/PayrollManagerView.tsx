/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, HrEmployee, PayrollFormula, PayrollBatchOperation, PayrollBatchDetail } from '../types';
import { mockPayrollFormulas, mockLocations, mockDistricts, mockPayrollLoans } from '../data/seedData';
import { Calculator, Trees, ChevronDown, ChevronRight, Play, Server, AlertTriangle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PayrollManagerViewProps {
  currentUser: User | null;
  employees: HrEmployee[];
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function PayrollManagerView({ currentUser, employees, onAddAuditLog }: PayrollManagerViewProps) {
  const [formulas, setFormulas] = useState<PayrollFormula[]>(mockPayrollFormulas);
  const [selectedFormulaId, setSelectedFormulaId] = useState<number>(1); // default Countryside
  
  // Tree-view nodes expand status
  const [expandedGovs, setExpandedGovs] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'gov' | 'dist'>('all');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  // Computed results state
  const [batchResults, setBatchResults] = useState<PayrollBatchDetail[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  const matchedFormula = formulas.find(f => f.formulaId === selectedFormulaId);

  // Toggle Gov Collapse
  const toggleGov = (govId: number) => {
    setExpandedGovs(prev => ({ ...prev, [govId]: !prev[govId] }));
  };

  // Run calculation simulation
  const runCalculation = () => {
    if (!matchedFormula) return;

    // Filter employees based on hierarchy selection
    let targets = [...employees];
    if (selectedLevel === 'gov') {
      targets = employees.filter(e => e.currentLocationId === selectedTargetId);
    } else if (selectedLevel === 'dist') {
      targets = employees.filter(e => e.currentDistrictId === selectedTargetId);
    }

    // Apply Formula
    const calculated: PayrollBatchDetail[] = targets.map((emp, index) => {
      let extraAmount = 0;
      
      // Parse basic expressions
      if (matchedFormula.formulaExpression.includes('BaseSalary * 0.15')) {
        extraAmount = emp.baseSalary * 0.15;
      } else if (matchedFormula.formulaExpression.includes('BaseSalary * 0.08')) {
        extraAmount = emp.baseSalary * 0.08;
      } else {
        extraAmount = 4500; // default manual correction constant
      }

      return {
        id: index + 10001,
        batchId: 9005,
        employeeId: emp.employeeId,
        calculatedAmount: Math.round(extraAmount),
        status: 'مقبول'
      };
    });

    setBatchResults(calculated);
    setIsCalculated(true);

    onAddAuditLog(
      'UPDATE',
      'PayrollPeriods',
      2, // Current active period (June)
      '{"status":"pending"}',
      JSON.stringify({
        message: 'Batch calculations completed',
        formulaName: matchedFormula.formulaName,
        totalCalculated: calculated.length,
        totalPayoutIncrement: calculated.reduce((sum, c) => sum + c.calculatedAmount, 0)
      })
    );
  };

  // Toggle exception manually (Suspend for review)
  const toggleEmployeeSuspension = (detailId: number) => {
    setBatchResults(prev => prev.map(item => {
      if (item.id === detailId) {
        const nextStatus = item.status === 'مقبول' ? 'موقوف مؤقتاً للمراجعة' : 'مقبول';
        
        onAddAuditLog(
          'UPDATE',
          'PayrollBatchDetails',
          detailId,
          `{"status":"${item.status}"}`,
          `{"status":"${nextStatus}"}`
        );
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  return (
    <div id="payroll-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Target Tree Selection Sidebar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 lg:col-span-1 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Trees className="h-4.5 w-4.5 text-emerald-700" id="payroll-tree-icon" />
          <span>هيكل اختيار فئات والشرائح المستهدفة بالصرف</span>
        </h3>

        <div className="text-xs space-y-3 pt-1">
          <div 
            onClick={() => {
              setSelectedLevel('all');
              setSelectedTargetId(null);
            }}
            className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between font-bold ${
              selectedLevel === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>الجمهورية اليمنية بأكملها (كافة الكشوفات)</span>
            {selectedLevel === 'all' && <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>}
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-400 block pr-1 mb-1">المكلفون حسب مكاتب المحافظات والمديريات:</span>
            
            <div className="space-y-1.5">
              {mockLocations.map(gov => {
                const isExpanded = expandedGovs[gov.id] || false;
                const isGovSelected = selectedLevel === 'gov' && selectedTargetId === gov.id;

                return (
                  <div key={gov.id} className="space-y-1 pr-1 border-r border-slate-100 mr-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => toggleGov(gov.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      
                      <div 
                        onClick={() => {
                          setSelectedLevel('gov');
                          setSelectedTargetId(gov.id);
                        }}
                        className={`flex-1 mr-1 p-1.5 rounded cursor-pointer font-bold ${
                          isGovSelected ? 'bg-teal-700/10 text-teal-900 border-r-2 border-teal-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {gov.name}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mr-5 space-y-1 border-r border-slate-100 pr-1 mt-0.5">
                        {mockDistricts.filter(d => d.govId === gov.id).map(dist => {
                          const isDistSelected = selectedLevel === 'dist' && selectedTargetId === dist.id;

                          return (
                            <div 
                              key={dist.id}
                              onClick={() => {
                                setSelectedLevel('dist');
                                setSelectedTargetId(dist.id);
                              }}
                              className={`p-1.5 rounded cursor-pointer font-semibold ${
                                isDistSelected ? 'bg-emerald-600/10 text-emerald-900' : 'text-slate-500 hover:text-slate-850'
                              }`}
                            >
                              - {dist.name} (مديرية)
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Formulas & Calculations Output */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Calculator className="h-4.5 w-4.5 text-emerald-700" />
                <span>تطبيق المعادلات الحسابية والبدلات الوطنية</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">صياغة وتطبيق قوانين الاستحقاق والخصم الرقابية المعتمدة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Formulas List selectors */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block" htmlFor="payroll-formulas-select">المعاعدة المالية المقترحة لتوزيع الرواتب:</label>
              
              <div className="space-y-2">
                {formulas.map(form => (
                  <div 
                    key={form.formulaId}
                    onClick={() => {
                      setSelectedFormulaId(form.formulaId);
                      setBatchResults([]);
                      setIsCalculated(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFormulaId === form.formulaId 
                        ? 'border-emerald-600 bg-emerald-500/5 text-emerald-900' 
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">{form.formulaName}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">التعبير البرمجي: {form.formulaExpression}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Expression Details */}
            {matchedFormula && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col justify-between font-mono text-xs">
                <div className="space-y-2.5">
                  <span className="text-emerald-400 font-bold block">{"// SQL Server Formula Evaluation Engine"}</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    يتم استبدال المتغيرات الهرمية (BaseSalary, QualificationLevel, WorkPlaceRuralAllowance) تلقائياً من جداول Core HR في معالج الاستعلامات المجهز.
                  </p>
                  <div className="bg-slate-800 p-2.5 rounded-lg text-amber-300 font-semibold text-[10px]">
                    SELECT EmployeeID, BaseSalary, ({matchedFormula.formulaExpression}) AS CalculatedBonus FROM HrEmployees;
                  </div>
                </div>

                <button
                  id="run-calculation-btn"
                  onClick={runCalculation}
                  disabled={!currentUser}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 font-bold font-sans mt-3 shadow-md flex items-center justify-center gap-1 shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>تطبيق وتشغيل معالج الفئات المحتسبة</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Computed Results table */}
        <AnimatePresence>
          {isCalculated && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm text-xs"
            >
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">تفاصيل البدلات المالية الفردية المحتسبة مؤقتاً</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">نطاق التصفية: {selectedLevel === 'all' ? 'الكل' : selectedLevel === 'gov' ? 'محافظة' : 'مديرية'}</span>
              </div>

              {batchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-bold">لا يوجد مدخلات في نطاق التصفية هذا.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">الموظف المعني</th>
                        <th className="px-4 py-2.5">الراتب الأساسي</th>
                        <th className="px-4 py-2.5">علاوة البدل المضاف</th>
                        <th className="px-4 py-2.5 text-center">حالة الصرف والاستثناء المالي</th>
                        <th className="px-4 py-2.5 text-center">العمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {batchResults.map(res => {
                        const emp = employees.find(e => e.employeeId === res.employeeId);
                        if (!emp) return null;

                        return (
                          <tr key={res.id}>
                            <td className="px-4 py-3">
                              <span className="font-bold block text-slate-800">{emp.fullName}</span>
                              <span className="text-[9px] text-slate-400 font-mono block">{emp.employeeNo}</span>
                            </td>
                            <td className="px-4 py-3 font-mono">{emp.baseSalary.toLocaleString()} ر.ي</td>
                            <td className="px-4 py-3 font-mono text-emerald-600 font-bold">+{res.calculatedAmount.toLocaleString()} ر.ي</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                res.status === 'مقبول' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-950 font-black'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleEmployeeSuspension(res.id)}
                                className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all ${
                                  res.status === 'مقبول' 
                                    ? 'bg-amber-500/10 text-amber-800 border border-amber-500/10 hover:bg-amber-500/20' 
                                    : 'bg-emerald-650 text-emerald-800 border border-emerald-500/10 hover:bg-emerald-500/20'
                                }`}
                              >
                                {res.status === 'مقبول' ? 'إيقاف للمراجعة' : 'إبطال واستئناف الصرف'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!currentUser && (
          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">جلسة العمل غير معمدة مالياً</strong>
              <p className="text-slate-600 mt-1">يرجى تسجيل الدخول كـ (مسؤول مالي) أو (مدير ديوان الوزارة) لمطابقة الصلاحيات وتفعيل زر معالج الدفعات الفنية.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
