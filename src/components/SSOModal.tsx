/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, Key, Sparkles, Building, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { mockUsers } from '../data/seedData';
import { motion, AnimatePresence } from 'motion/react';

interface SSOModalProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onAddAuditLog: (action: string, table: string, id: number, valOld?: string, valNew?: string) => void;
}

export default function SSOModal({ currentUser, onLogin, onLogout, onAddAuditLog }: SSOModalProps) {
  const [selectedUsername, setSelectedUsername] = useState('admin@edu.gov');
  const [password, setPassword] = useState('•••••••••');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const matchedUser = mockUsers.find((u) => u.username === selectedUsername);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (!matchedUser) {
        setError('حساب المستخدم غير موجود ضمن قائمة تسجيل الدخول الموحد.');
        return;
      }

      if (matchedUser.mfaEnabled) {
        setShowMFA(true);
        onAddAuditLog(
          'LOGIN',
          'Users',
          matchedUser.userId,
          undefined,
          JSON.stringify({ step: 'MFA_CHALLENGE_STAGED', username: matchedUser.username })
        );
      } else {
        // Direct login
        onLogin({ ...matchedUser, isLoggedIn: true });
        onAddAuditLog(
          'LOGIN',
          'Users',
          matchedUser.userId,
          undefined,
          JSON.stringify({ step: 'SSO_DIRECT_SUCCESS', username: matchedUser.username, mfa: false })
        );
      }
    }, 600);
  };

  const handleMFASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mfaCode === '123456' || mfaCode === '654321') {
      if (matchedUser) {
        onLogin({ ...matchedUser, isLoggedIn: true });
        setShowMFA(false);
        setMfaCode('');
        onAddAuditLog(
          'LOGIN',
          'Users',
          matchedUser.userId,
          undefined,
          JSON.stringify({ step: 'SSO_MFA_SUCCESS', username: matchedUser.username, mfa: true })
        );
      }
    } else {
      setError('رمز التحقق الثنائي (OTP) غير صحيح. يرجى محاولة التوليد مجدداً (جرّب الرمز التجريبي المعتمد: 123456).');
      onAddAuditLog(
        'LOGIN',
        'Users',
        matchedUser ? matchedUser.userId : 0,
        undefined,
        JSON.stringify({ step: 'MFA_FAILURE', enteredCode: mfaCode })
      );
    }
  };

  const triggerImmediateSessionRevoke = () => {
    if (currentUser) {
      onAddAuditLog(
        'SYNC_OFFLINE',
        'AuditLogs',
        currentUser.userId,
        undefined,
        JSON.stringify({ action: 'IMMEDIATE_SESSION_REVOCATION', user: currentUser.username })
      );
      onLogout();
    }
  };

  return (
    <div id="sso-sso-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="h-6 w-6" id="sso-shield-icon" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg leading-tight" id="sso-title">بوابة الدخول الموحد (SSO)</h2>
            <p className="text-xs text-slate-400 font-mono" id="sso-subtitle">Yemen MoE OpenID Connect Identity Service</p>
          </div>
        </div>
        {currentUser && (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-sans">
            منفذ مصادق آمن
          </span>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!currentUser ? (
            <motion.div
              key="login-form-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              id="sso-logged-out-box"
            >
              {!showMFA ? (
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                  <div className="bg-amber-500/5 border border-amber-500/20 text-amber-900 rounded-xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" id="sso-alert-icon" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">بيئة فحص وتكامل الأنومة الصارمة</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        اختر الحساب المناسب للمستوى المطلوب المحاكاة فيه. الحسابات ذات الصلاحيات العليا (وزارة / مالية) تتطلب تحقق ثنائي مشروط (2FA OTP).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="sso-username-select">
                      البريد الإلكتروني الموحد للموظف الدولي (OpenID)
                    </label>
                    <div className="relative">
                      <select
                        id="sso-username-select"
                        value={selectedUsername}
                        onChange={(e) => setSelectedUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 transition-all font-mono"
                      >
                        {mockUsers.map((user) => (
                          <option key={user.userId} value={user.username}>
                            {user.username} ({user.fullName} - {user.mfaEnabled ? 'طلب 2FA' : 'مباشر'})
                          </option>
                        ))}
                      </select>
                      <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="sso-password-input">
                      كلمة المرور المشفرة (BCrypt)
                    </label>
                    <div className="relative">
                      <input
                        id="sso-password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 transition-all font-mono"
                        required
                      />
                      <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/5 border border-red-500/20 text-red-800 rounded-xl p-3 text-xs leading-relaxed">
                      {error}
                    </div>
                  )}

                  <button
                    id="sso-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 text-sm font-medium transition-all shadow-sm shadow-emerald-700/10 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Building className="h-4 w-4" />
                        <span>طلب التوثيق والمصادقة الموحدة</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMFASubmit} className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-950 rounded-xl p-4 text-center space-y-2">
                    <Sparkles className="h-6 w-6 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-bold text-emerald-800">مطلوب التحقق الثنائي الموثوق (2FA)</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      لقد قمت بطلب تسجيل الدخول على حساب ذو صلاحيات حساسة. يرجى إدخال رمز التحقق (OTP) من تطبيق المصادقة المولد.
                    </p>
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-mono">
                      رمز تجريبي للفحص: 123456
                    </span>
                  </div>

                  <div className="space-y-1.5 text-center">
                    <label className="text-xs font-bold text-slate-600 block" htmlFor="sso-otp-input">
                      يرجى إدخال الرمز المكون من 6 أرقام
                    </label>
                    <input
                      id="sso-otp-input"
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="******"
                      className="w-36 bg-slate-50 border-2 border-slate-200 text-center rounded-xl py-3.5 text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 transition-all"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/5 border border-red-500/20 text-red-800 rounded-xl p-3 text-xs leading-relaxed text-center">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      id="sso-mfa-back-btn"
                      type="button"
                      onClick={() => {
                        setShowMFA(false);
                        setError('');
                      }}
                      className="w-1/3 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-xs font-medium hover:bg-slate-50 transition-all"
                    >
                      عودة للخلف
                    </button>
                    <button
                      id="sso-mfa-submit-btn"
                      type="submit"
                      className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>تأكيد الرمز الآمن</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="logged-in-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 text-center py-2"
              id="sso-logged-in-box"
            >
              <div className="h-14 w-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{currentUser.fullName}</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">{currentUser.username}</p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  <span className="bg-emerald-600/10 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                    {mockUsers.find((u) => u.userId === currentUser.userId)?.roleId === 1
                      ? 'رئيس قطاع / مدير وزارة (الكل)'
                      : mockUsers.find((u) => u.userId === currentUser.userId)?.roleId === 5
                      ? 'مدير العمليات المالية والرواتب'
                      : mockUsers.find((u) => u.userId === currentUser.userId)?.roleId === 2
                      ? 'مسؤول أمانة المحافظة'
                      : 'مستخدم بنطاق محدود'}
                  </span>
                  {currentUser.govId && (
                    <span className="bg-amber-600/10 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">
                      محافظة ID: {currentUser.govId}
                    </span>
                  )}
                  {currentUser.districtId && (
                    <span className="bg-indigo-600/10 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                      مديرية ID: {currentUser.districtId}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-emerald-500/5 rounded-xl p-3 text-xs text-emerald-900 border border-emerald-500/20 text-right leading-relaxed space-y-1">
                <strong className="block text-emerald-800 mb-0.5">تفاصيل جلسة الموظف السحابية:</strong>
                <p>• التشفير المعتمد: AES-256 للبيانات الحساسة كالحافز الوطني.</p>
                <p>• التحكم بالجلسات: معزز بخاصية الإلغاء الفوري (Immediate Revocation).</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  id="sso-revoke-btn"
                  onClick={triggerImmediateSessionRevoke}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-sm shadow-red-600/10 flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>إلغاء فوري للجلسة (Revoke Session)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
