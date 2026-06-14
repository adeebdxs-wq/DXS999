/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SQL_DDL_SCRIPT, SECURITY_MIDDLEWARE_CODE } from '../utils/sqlDdl';
import { Database, ShieldCheck, Cpu, Code2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function SqlExplorer() {
  const [activeTab, setActiveTab] = useState<'ddl' | 'trigger' | 'security'>('ddl');
  const [copied, setCopied] = useState<boolean>(false);

  const getActiveCode = () => {
    if (activeTab === 'ddl') return SQL_DDL_SCRIPT;
    if (activeTab === 'trigger') {
      return `-- زناد منع تعديل أو حذف سجلات التدقيق (AuditLogs Immutability Trigger)
-- =========================================================================

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
EXECUTE FUNCTION pr_block_audit_log_modification();`;
    }
    return SECURITY_MIDDLEWARE_CODE;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="sql-explorer-container" className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Code2 className="h-5 w-5 text-emerald-700" />
              <span>مستكشف البنية التحتية والتعليمات البرمجية والأمن</span>
            </h2>
            <p className="text-slate-500 font-semibold">مراجعة سكريبت قاعدة البيانات المركزي الموحد وطرق التحقق من تشفير البيانات وصلاحيات RBAC</p>
          </div>
          
          <button
            onClick={handleCopy}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 py-2.5 font-bold transition-all flex items-center justify-center gap-1.5 self-start"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-slate-100 gap-2 pb-1.5">
          <button
            onClick={() => setActiveTab('ddl')}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'ddl' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>سكريبت SQL DDL المكامل للمجالات الثمانية</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trigger')}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'trigger' ? 'bg-amber-100 text-amber-950 font-black' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>زناد حماية الـ AuditLogs (الغير قابل للتعديل)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-indigo-50 text-indigo-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>طبقة التحقق الأمني وتدوير الرموز (Express middleware)</span>
          </button>
        </div>

        {/* Code Canvas representation */}
        <div className="bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[480px] border border-slate-900 scrollbar-thin">
          <pre className="text-right whitespace-pre">
            {getActiveCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
