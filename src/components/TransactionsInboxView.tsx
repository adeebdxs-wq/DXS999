/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, WorkflowTransaction, WorkflowTransactionStep } from '../types';
import { mockWorkflowTransactions, mockWorkflowSteps, mockLocations, mockDistricts, mockDocumentTypes } from '../data/seedData';
import { generateSmartReferralCode } from '../utils/algorithms';
import { Inbox, FileCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, PenTool, Sparkles, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsInboxViewProps {
  currentUser: User | null;
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function TransactionsInboxView({ currentUser, onAddAuditLog }: TransactionsInboxViewProps) {
  const [transactions, setTransactions] = useState<WorkflowTransaction[]>(mockWorkflowTransactions);
  const [steps, setSteps] = useState<WorkflowTransactionStep[]>(mockWorkflowSteps);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(101);

  // States for Smart Generator
  const [genGovId, setGenGovId] = useState<number>(1);
  const [genDistId, setGenDistId] = useState<number>(10);
  const [genTypeId, setGenTypeId] = useState<number>(3);
  const [genSeq, setGenSeq] = useState<number>(1);
  const [generatedResult, setGeneratedResult] = useState<string>('011003001');

  const selectedTx = transactions.find(t => t.transactionId === selectedTxId);
  const selectedSteps = steps.filter(s => s.transactionId === selectedTxId);

  // Handle action simulation
  const handleAction = (actionType: 'اعتماد' | 'رفض' | 'طلب استكمال') => {
    if (!selectedTx || !currentUser) return;

    // Update Status
    const statusMap: Record<string, 'معتمد' | 'مرفوض' | 'مستكمل'> = {
      'اعتماد': 'معتمد',
      'رفض': 'مرفوض',
      'طلب استكمال': 'مستكمل'
    };

    const newStatus = statusMap[actionType];

    const oldTxVal = JSON.stringify(selectedTx);
    
    // Update Transaction
    setTransactions(prev => prev.map(t => {
      if (t.transactionId === selectedTx.transactionId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // Append Step
    const newStepId = Math.floor(Math.random() * 50000) + 1000;
    const cryptSig = actionType === 'اعتماد' 
      ? `SIG_SHA256_${Array.from({length: 44}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join('')}`
      : undefined;

    const newStep: WorkflowTransactionStep = {
      stepId: newStepId,
      transactionId: selectedTx.transactionId,
      actorName: currentUser.fullName,
      actionTaken: actionType,
      actionDate: new Date().toISOString(),
      comments: actionType === 'اعتماد' ? 'تم الفحص والتدقيق واعتماده نهائياً بمسؤولية.' : 'مرفوض أو يرجى مراجعته وتعديل النواقص المطلوبة.',
      digitalSignature: cryptSig
    };

    setSteps(prev => [...prev, newStep]);

    onAddAuditLog(
      'UPDATE',
      'WorkflowTransactions',
      selectedTx.transactionId,
      oldTxVal,
      JSON.stringify({ ...selectedTx, status: newStatus, action: actionType, authorizedBy: currentUser.username })
    );
  };

  // Trigger Smart generator calculation
  const handleRegenerateCode = () => {
    const code = generateSmartReferralCode(genGovId, genDistId, genTypeId, genSeq);
    setGeneratedResult(code);
  };

  return (
    <div id="transactions-inbox-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Smart Referral Generator Sidebar (Extremely educational & exact request) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 lg:col-span-1 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Sparkles className="h-4.5 w-4.5 text-amber-600" />
          <span>مولد الأرقام المرجعية الذكية المشفرة</span>
        </h3>
        
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="gen-gov">المحافظة (الخانة 1-2):</label>
            <select 
              id="gen-gov"
              value={genGovId}
              onChange={(e) => setGenGovId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-600 font-sans"
            >
              {mockLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="gen-dist">المديرية المتفرعة (الخانة 3-4):</label>
            <select 
              id="gen-dist"
              value={genDistId}
              onChange={(e) => setGenDistId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-600 font-sans"
            >
              {mockDistricts.filter(d => d.govId === genGovId || genGovId === 1).map(d => (
                <option key={d.id} value={d.id}>{d.name} (كود {d.id})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="gen-type">نوع المعاملة وسياق الملف (الخانة 5-6):</label>
            <select 
              id="gen-type"
              value={genTypeId}
              onChange={(e) => setGenTypeId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-600 font-sans"
            >
              {mockDocumentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="gen-seq">الرقم التسلسلي (الخانة 7-9):</label>
            <input 
              id="gen-seq"
              type="number" 
              min={1} 
              max={999}
              value={genSeq}
              onChange={(e) => setGenSeq(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          <button
            id="regenerate-code-btn"
            type="button"
            onClick={handleRegenerateCode}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-2 font-bold transition-all"
          >
            توليد الكود الذكي الموحد
          </button>

          <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20 text-center font-mono font-black text-emerald-800 text-base leading-tight">
            {generatedResult}
          </div>
        </div>
      </div>

      {/* Main Inbox view and details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Inbox className="h-4.5 w-4.5 text-emerald-700" />
              <span>معاملات قطاع الشؤون الإدارية (صندوق الوارد)</span>
            </h2>
            <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {transactions.filter(t => t.status === 'معلق').length} معاملات معلقة
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {transactions.map(tx => (
              <div 
                key={tx.transactionId}
                onClick={() => setSelectedTxId(tx.transactionId)}
                className={`p-4 hover:bg-slate-50/50 cursor-pointer transition-all flex items-start justify-between ${
                  selectedTxId === tx.transactionId ? 'bg-emerald-500/5/30 border-r-4 border-emerald-600' : ''
                }`}
              >
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{tx.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      tx.status === 'معلق' ? 'bg-amber-100 text-amber-800' : tx.status === 'معتمد' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">المرسل: {tx.senderName} • جهة الاستلام: {tx.receiverDept}</p>
                </div>
                
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold shrink-0">
                  {tx.referralCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Transaction Details / Actions */}
        {selectedTx && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{selectedTx.title}</h3>
                <p className="text-xs text-slate-400 mt-1">الرقم المرجعي الذكي للمستند: {selectedTx.referralCode}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                selectedTx.status === 'معلق' ? 'bg-amber-100 text-amber-800' : selectedTx.status === 'معتمد' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                حالة القرار: {selectedTx.status}
              </span>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">تتبع خطوات وسير التوقيع الفني المعتمد</h4>
              
              <div className="space-y-3 font-semibold relative before:absolute before:right-3.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-100">
                {selectedSteps.map(step => (
                  <div key={step.stepId} className="flex gap-4 items-start relative pr-8">
                    <div className="absolute right-1.5 top-1 h-4 w-4 bg-emerald-600 rounded-full border-4 border-white shadow-sm ring-1 ring-emerald-500/20" />
                    
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 text-xs text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{step.actorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(step.actionDate).toLocaleDateString('ar-YE', {hour: '2-digit', minute: '2-digit', hour12: true})}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5">{step.comments}</p>
                      
                      {step.digitalSignature && (
                        <div className="flex items-center gap-1.5 bg-emerald-700/5 text-emerald-800 p-2 rounded-lg border border-emerald-500/10 mt-1 font-mono text-[9px] break-all leading-tight">
                          <PenTool className="h-4.5 w-4.5 text-emerald-700 shrink-0" />
                          <span>توقيع موثّق: {step.digitalSignature}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons (Only if pending or simulation requested) */}
            {selectedTx.status === 'معلق' && currentUser ? (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <button 
                  onClick={() => handleAction('اعتماد')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>اعتماد وإصدار توقيع تشفيري</span>
                </button>
                <button 
                  onClick={() => handleAction('طلب استكمال')}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  طلب تفاصيل واستكمال للنظام
                </button>
                <button 
                  onClick={() => handleAction('رفض')}
                  className="bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  رفض المعاملة معللة
                </button>
              </div>
            ) : !currentUser ? (
              <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>سجل الدخول كـ (ديوان الوزارة أو قطاع مالي) لتمتلك أزار الاعتماد والمعينات الرقمية الآمنة.</span>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl text-center text-xs text-slate-500 font-bold border border-slate-100">
                المعاملة مكتملة وموثقة في خادم الأرشيف السحابي بنجاح.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
