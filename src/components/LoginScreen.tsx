import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PieChart,
  ShieldCheck,
  Database,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loginWithRedirectMode, loginAsGuest, authError, clearError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithRedirectMode();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const copyHostToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/90 via-sky-50 to-blue-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* College Logo Badge */}
        <div className="mx-auto w-24 h-24 rounded-full bg-white border-2 border-sky-400/60 shadow-xl shadow-sky-400/20 flex items-center justify-center p-1 overflow-hidden transition-transform hover:scale-105">
          <img
            src="/college_logo_circle.png"
            alt="วิทยาลัยอาชีวศึกษาแพร่"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          MoneyDB
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          ระบบจัดการรายรับ-รายจ่าย วิทยาลัยอาชีวศึกษาแพร่
        </p>

        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100/90 text-sky-800 border border-sky-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-sky-700" />
          <span>Firebase Database: moneydb</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-xl shadow-sky-200/50 rounded-3xl border border-sky-200/80 space-y-6">
          
          {/* Key Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-sky-100 text-center">
            <div className="flex flex-col items-center p-2.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <CheckCircle2 className="w-5 h-5 text-sky-600 mb-1" />
              <p className="text-xs font-bold text-slate-800">บันทึกง่าย</p>
              <p className="text-[10px] text-slate-500">แยกหมวดหมู่ชัดเจน</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <PieChart className="w-5 h-5 text-sky-600 mb-1" />
              <p className="text-xs font-bold text-slate-800">กราฟวิเคราะห์</p>
              <p className="text-[10px] text-slate-500">สรุปผลประจำเดือน</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <ShieldCheck className="w-5 h-5 text-sky-600 mb-1" />
              <p className="text-xs font-bold text-slate-800">คลาวด์ปลอดภัย</p>
              <p className="text-[10px] text-slate-500">ซิงก์เรียลไทม์</p>
            </div>
          </div>

          {/* If inside preview iframe notice */}
          {isInIframe && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-950">คำแนะนำสำหรับหน้าจอพรีวิว (iFrame)</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  หากเบราว์เซอร์บล็อกป๊อปอัปเข้าสู่ระบบ สามารถกดเปิดในแท็บใหม่เพื่อเข้าสู่ระบบได้อย่างราบรื่น
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-900 hover:underline pt-0.5 cursor-pointer"
                >
                  <span>เปิดแอปในแท็บใหม่ (Open in New Tab)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-rose-900 text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>เข้าสู่ระบบไม่สำเร็จ</span>
                </p>
                <button
                  onClick={clearError}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  ปิดแจ้งเตือน
                </button>
              </div>
              <p className="leading-relaxed text-rose-700">{authError}</p>

              {authError.includes('Authorized domains') && (
                <div className="pt-2 border-t border-rose-200/80 text-[11px] space-y-2 text-slate-700">
                  <p className="font-bold text-rose-900">ขั้นตอนการเพิ่มโดเมนใน Firebase Console:</p>
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-rose-200 text-slate-800">
                    <code className="font-mono text-xs font-semibold">{currentHost}</code>
                    <button
                      type="button"
                      onClick={copyHostToClipboard}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedDomain ? 'คัดลอกแล้ว' : 'คัดลอกโดเมน'}
                    </button>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li>เปิด <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-700 underline font-semibold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a></li>
                    <li>เลือกโปรเจกต์ <strong>mythic-meridian-7pthm</strong></li>
                    <li>ไปที่เมนู <strong>Build &gt; Authentication &gt; Settings &gt; Authorized domains</strong></li>
                    <li>กด <strong>Add domain</strong> วางโดเมนข้างต้น แล้วกดบันทึก (Save)</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Primary Action: Official Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              id="btnGoogleSignIn"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-sky-300 rounded-2xl shadow-sm bg-white hover:bg-sky-50/80 hover:border-sky-400 text-slate-800 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 cursor-pointer group"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                  <span>กำลังเชื่อมต่อบัญชี Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วยบัญชี Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-sky-600 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Secondary Option: Redirect Sign-in */}
            <div className="pt-2 text-center space-y-2">
              <button
                type="button"
                id="btnRedirectSignIn"
                onClick={handleRedirectLogin}
                disabled={isLoggingIn}
                className="text-xs text-sky-700 hover:text-sky-900 underline font-medium cursor-pointer"
              >
                กรณีเบราว์เซอร์บล็อกป๊อปอัป: กดเข้าสู่ระบบแบบ Redirect (เปลี่ยนหน้าเว็บ)
              </button>

              <div className="pt-2 border-t border-sky-100">
                <button
                  type="button"
                  id="btnGuestSignIn"
                  onClick={loginAsGuest}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  หรือเข้าทดลองใช้งานเบื้องต้น (Guest Mode)
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-slate-500">
            ระบบความปลอดภัยยืนยันตัวตนผ่าน <span className="font-semibold text-sky-800">Firebase Authentication</span>
          </p>
          <p className="text-[11px] text-slate-400">
            วิทยาลัยอาชีวศึกษาแพร่ &bull; MoneyDB
          </p>
        </div>
      </div>
    </div>
  );
};
