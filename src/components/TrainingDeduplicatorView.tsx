/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, HrEmployee, TrainingProgram, TrainingParticipant, TrainingDeduplicationLog } from '../types';
import { mockTrainingPrograms, mockTrainingParticipants, mockLocations } from '../data/seedData';
import { checkTrainingDeduplication } from '../utils/algorithms';
import { GraduationCap, Sparkles, Filter, CheckCircle2, AlertTriangle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrainingDeduplicatorViewProps {
  currentUser: User | null;
  employees: HrEmployee[];
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function TrainingDeduplicatorView({ currentUser, employees, onAddAuditLog }: TrainingDeduplicatorViewProps) {
  const [historyParticipants, setHistoryParticipants] = useState<TrainingParticipant[]>(mockTrainingParticipants);
  const [dedupLogs, setDedupLogs] = useState<TrainingDeduplicationLog[]>([]);
  
  // Selection States for new nomination
  const [nomineeId, setNomineeId] = useState<number>(1002); // default Arwa (has completed the mathematicians program in Taiz!)
  const [programId, setProgramId] = useState<number>(702); // mathematics specialization
  const [currentNominationGovId, setCurrentNominationGovId] = useState<number>(2); // Now nominating her in Aden

  const [notification, setNotification] = useState<{ type: 'success' | 'warn'; msg: string } | null>(null);

  // Filter lists
  const teachersOnly = employees.filter(e => e.cadreTypeId === 2);
  const programs = mockTrainingPrograms;

  const handleNominate = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const matchedEmp = employees.find(emp => emp.employeeId === nomineeId);
    if (!matchedEmp) return;

    // Run custom deduplication logic
    const { isDuplicate, log } = checkTrainingDeduplication(
      nomineeId,
      programId,
      currentNominationGovId,
      historyParticipants,
      programs,
      mockLocations
    );

    if (isDuplicate && log) {
      // Create Deduplication Log
      const newLogId = Math.floor(Math.random() * 950000) + 10000;
      const fullLog: TrainingDeduplicationLog = {
        logId: newLogId,
        ...log,
        employeeName: matchedEmp.fullName,
        detectedAt: new Date().toISOString()
      };

      setDedupLogs(prev => [fullLog, ...prev]);
      setNotification({
        type: 'warn',
        msg: `تحذير رقابي! تم رفع قيد استبعاد فوري للمعلم(ة) [${matchedEmp.fullName}] بسبب تكرار الترشيح المتقاطع في محافظة أخرى.`
      });

      onAddAuditLog(
        'INSERT',
        'TrainingDeduplicationLogs',
        newLogId,
        undefined,
        JSON.stringify(fullLog)
      );
    } else {
      // Register success participant
      const newPartId = Math.floor(Math.random() * 95000) + 1000;
      const newPart: TrainingParticipant = {
        id: newPartId,
        programId: programId,
        employeeId: nomineeId,
        locationId: currentNominationGovId,
        status: 'مرشح',
        nominatedAt: new Date().toISOString()
      };

      setHistoryParticipants(prev => [newPart, ...prev]);
      setNotification({
        type: 'success',
        msg: `تم ترشيح المعلم(ة) [${matchedEmp.fullName}] بنجاح للبرنامج التدريبي كونه لا يمتلك مشاركة سابقة.`
      });

      onAddAuditLog(
        'INSERT',
        'TrainingParticipants',
        newPartId,
        undefined,
        JSON.stringify(newPart)
      );
    }
  };

  return (
    <div id="training-deduplicator-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Nomination Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 lg:col-span-1 shadow-sm text-xs">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <GraduationCap className="h-5 w-5 text-emerald-700" />
          <span>ترشيح المعلمين للبرامج التدريبية</span>
        </h3>

        <form onSubmit={handleNominate} className="space-y-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="nominee-select">اختر المعلم المرشح:</label>
            <select
              id="nominee-select"
              value={nomineeId}
              onChange={(e) => setNomineeId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-emerald-600 font-sans font-semibold text-slate-800"
            >
              {teachersOnly.map(t => (
                <option key={t.employeeId} value={t.employeeId}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="program-select">المجموعة/البرنامج التدريبي المقترح:</label>
            <select
              id="program-select"
              value={programId}
              onChange={(e) => setProgramId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-emerald-600 font-sans font-semibold"
            >
              {programs.map(p => (
                <option key={p.programId} value={p.programId}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block" htmlFor="target-location">أمانة المحافظة الجارية المنسقة للبرنامج:</label>
            <select
              id="target-location"
              value={currentNominationGovId}
              onChange={(e) => setCurrentNominationGovId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-emerald-600 font-sans font-semibold text-slate-850"
            >
              {mockLocations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="submit-nomination-btn"
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 font-bold transition-all shadow-sm"
          >
            تأكيد الترشيح ومطابقة الازدواجية
          </button>
        </form>

        {/* Dynamic Warning Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 leading-relaxed ${
                notification.type === 'warn' 
                  ? 'bg-red-500/5 text-red-900 border-red-500/20' 
                  : 'bg-emerald-500/5 text-emerald-900 border-emerald-500/20'
              }`}
            >
              {notification.type === 'warn' ? (
                <AlertTriangle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              )}
              <p className="font-semibold text-[11px]">{notification.msg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Excluded & Deduplicated warning list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm text-xs">
          <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <Layers className="h-5 w-5 text-amber-600" />
            <span>سجل الرصد ومنع التكرار المتقاطع (Cross-Location Deduplication Logs)</span>
          </h2>
          
          <p className="text-slate-500 font-semibold leading-relaxed">
            تعمل هذه الخوارزمية كغطاء حماية يمنع استقطاع موازنات التدريب وإلحاق المعلم ببرامج قد اجتازها سابقاً بملاكات أخرى (مثل محافظة تعز أو حضرموت). يتم تتبع المعلم برقمه الموحد.
          </p>

          <div className="space-y-3 pt-1">
            {dedupLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-slate-100 border-dashed rounded-xl font-bold">
                لم يتم تسجيل أي محاولات تكرار أو استبعاد في الكاش المحلي حتى الآن. جرب ترشيح المعلمة (أروى محمد صالح) لبرنامج (الاستقصاء الموجه) لتشاهد الخوارزمية تعمل!
              </div>
            ) : (
              dedupLogs.map(log => (
                <div key={log.logId} className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 text-right">
                    <span className="bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded text-[9px]">
                      تم الرصد والاستبعاد التلقائي
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">المستبعد(ة): {log.employeeName}</h4>
                    <p className="text-slate-650 leading-relaxed font-semibold">
                      <strong>عنوان البرنامج الدراسي:</strong> {log.programTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      تاريخ الرصد: {new Date(log.detectedAt).toLocaleTimeString('ar-YE')} • إثبات التموضع: {log.proofDetails}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
