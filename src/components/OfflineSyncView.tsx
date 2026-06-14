/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Database, Wifi, WifiOff, CloudLightning, RefreshCw, Layers, CheckCircle2, Server, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineSyncViewProps {
  currentUser: User | null;
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function OfflineSyncView({ currentUser, onAddAuditLog }: OfflineSyncViewProps) {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [localRows, setLocalRows] = useState<{ id: number; item: string; date: string }[]>([
    { id: 41, item: 'حضور المعلم خالد باوزير - الحصة الرابعة بمدرسة بلقيس', date: '2026-06-14T08:15:00Z' },
    { id: 42, item: 'مخالفة تأخير المعلم أحمد الشامي - ديوان التحرير صباحي', date: '2026-06-14T08:30:00Z' }
  ]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Toggle mode
  const handleOfflineToggle = () => {
    setIsOffline(prev => {
      const next = !prev;
      onAddAuditLog(
        'SYNC_OFFLINE',
        'AttendanceLogs',
        0,
        undefined,
        JSON.stringify({ message: "Network environment toggled", offline_mode: next })
      );
      return next;
    });
  };

  // Add temporary client action simulation
  const addMockLocalAction = () => {
    const newId = Math.floor(Math.random() * 9500) + 1000;
    const actions = [
      'الموافقة على إجازة اضطرارية للأستاذة فاطمة القباطي - مدرسة الثورة',
      'بصمة وجه ناجحة للمعلم أحمد الشامي - وزارة التربية',
      'رفع مستند قرار تعيين رقم 011003442 للأرشيف المحلي'
    ];
    const itemSelected = actions[Math.floor(Math.random() * actions.length)];

    setLocalRows(prev => [...prev, {
      id: newId,
      item: itemSelected,
      date: new Date().toISOString()
    }]);

    if (!isOffline) {
      setNotification('تم حفظ الإجراء محلياً وإرساله مباشرة للسيرفر السحابي لكونك متصلاً بالشبكة.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Run sync routine
  const handleSyncNow = () => {
    if (localRows.length === 0) return;
    setSyncing(true);
    setNotification(null);

    setTimeout(() => {
      setSyncing(false);
      const totalSynced = localRows.length;
      setLocalRows([]);
      setNotification(`تمت مزامنة (${totalSynced}) عمليات مخزنة محلياً بنجاح مع البيانات السحابية المركزية لوزارة التربية.`);
      
      onAddAuditLog(
        'SYNC_OFFLINE',
        'AuditLogs',
        currentUser ? currentUser.userId : 0,
        undefined,
        JSON.stringify({
          action: 'BULK_OFFLINE_SYNC_SUCCESS',
          totalSyncedRows: totalSynced,
          storageEngine: 'IndexedDB/LocalStorage'
        })
      );
    }, 2000);
  };

  return (
    <div id="offline-sync-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Network Environment Toggle Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 lg:col-span-1 shadow-sm text-xs">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Wifi className="h-5 w-5 text-emerald-700" />
          <span>محاكاة بيئة الشبكة للمديريات والمدارس</span>
        </h3>

        <div className="border border-slate-100 rounded-xl p-4 space-y-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">حالة الإنترنت في المدرسة/المديرية:</span>
            <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
              isOffline ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOffline ? 'وضع غير متصل بالإنترنت' : 'متصل بالإنترنت'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-250">
            <p className="text-[10px] text-slate-500 font-semibold max-w-[150px]">
              انقر لقطع التيار واختبار المزامنة التلقائية والمحلية عبر IndexedDB.
            </p>
            
            <button
              id="offline-toggle-btn"
              onClick={handleOfflineToggle}
              className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${
                isOffline 
                  ? 'bg-emerald-650 text-emerald-800 border border-emerald-500/10' 
                  : 'bg-red-500/10 text-red-800 hover:bg-red-500/20'
              }`}
            >
              {isOffline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span>{isOffline ? 'اتصال الآن بالوزارة' : 'انقطاع الاتصال بالوزارة'}</span>
            </button>
          </div>
        </div>

        {/* Generate Local Actions */}
        <button
          id="mock-local-action-btn"
          onClick={addMockLocalAction}
          className="w-full bg-slate-900 text-white hover:bg-slate-850 py-3 rounded-xl font-bold font-sans tracking-wide shadow-sm"
        >
          محاكاة إجراء (بصمة / إجازة / قرار) في المدرسة
        </button>

        {notification && (
          <div className="bg-emerald-500/5 text-emerald-950 p-3.5 rounded-xl border border-emerald-500/20 flex items-start gap-2.5 leading-relaxed">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-semibold text-[11px]">{notification}</p>
          </div>
        )}
      </div>

      {/* Local Buffer Queue & Cloud Replicator */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Database className="h-5 w-5 text-indigo-700" id="offline-db-icon" />
              <span>قائمة الانتظار في الذاكرة المحلية (Client Queue IndexedDB)</span>
            </h2>
            <span className="bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded">
              {localRows.length} إجراءات معلقة للرفع
            </span>
          </div>

          <p className="text-slate-500 font-semibold leading-relaxed">
            عندما يفقد مدخلو المدارس والربط في المديريات الإنترنت، تحفظ كافة بصمات الموظفين وتعديلات الأرشيف في متصفح العميل تلقائياً بمرونة وأمان عالي، ثم تفكك وترسل فوراً فور إعادة الربط.
          </p>

          <div className="space-y-2 pt-1 font-semibold">
            {localRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-slate-100 border-dashed rounded-xl font-bold">
                الذاكرة المحلية للعميل فارغة تماماً ومزامنة مع السحابة المركزية للوزارة بنسبة 100%.
              </div>
            ) : (
              localRows.map(row => (
                <div key={row.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5 text-right">
                    <span className="font-bold text-slate-800 block">{row.item}</span>
                    <span className="text-[10px] text-slate-400 font-mono">طابع زمني للحدوث: {new Date(row.date).toLocaleString('ar-YE', {hour: '2-digit', minute: '2-digit', hour12: true})}</span>
                  </div>
                  
                  <span className="bg-amber-100/10 text-amber-950 border border-amber-500/10 text-[9px] px-2 py-0.5 rounded font-black font-mono select-none">
                    INDEXED_DB_LOCAL
                  </span>
                </div>
              ))
            )}
          </div>

          {localRows.length > 0 && (
            <div className="pt-2 flex justify-end gap-2">
              <button
                id="clear-queue-btn"
                onClick={() => setLocalRows([])}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-xl transition-all"
              >
                مسح طابور المستندات المحلية
              </button>
              
              <button
                id="sync-now-btn"
                onClick={handleSyncNow}
                disabled={syncing || isOffline}
                className={`text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  isOffline 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/10'
                }`}
              >
                {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CloudLightning className="h-4 w-4" />}
                <span>{syncing ? 'جاري نقل وتعميد البيانات...' : 'ابدا المزامنة مع السيرفر السحابي للوزارة'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
