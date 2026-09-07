import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, ShieldCheck, Database, ArrowRight, Loader2, CheckCircle2, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loginWithRedirectMode, loginAsGuest, authError, clearError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const handleLogin = async () => {
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

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'money-db-iota.vercel.app';

  const copyHostToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/80 via-sky-50 to-blue-50/60 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-sky-50 border-2 border-sky-400/50 shadow-xl shadow-sky-400/20 flex items-center justify-center p-1 overflow-hidden">
          <img
            src="/college_logo_circle.png"
            alt="วิทยาลัยอาชีวศึกษาแพร่"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          MoneyDB
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          ระบบจัดการรายรับรายจ่าย พร้อมสรุปผลและกราฟวิเคราะห์รายเดือน
        </p>

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
          <Database className="w-3.5 h-3.5" />
          Firebase Database: moneydb
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-sky-50/90 py-8 px-6 sm:px-10 shadow-xl shadow-sky-200/50 rounded-3xl border border-sky-200/80 space-y-6">
          {/* Key Feature Highlights */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">บันทึกรายรับรายจ่ายสะดวกรวดเร็ว</p>
                <p className="text-[11px] text-slate-500">แยกหมวดหมู่อาหาร เดินทาง ช้อปปิ้ง เงินเดือน ฯลฯ</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <PieChart className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">สรุปผลรายเดือน & กราฟวิเคราะห์ลึก</p>
                <p className="text-[11px] text-slate-500">กราฟวงกลมสัดส่วน, กราฟแท่งรายวัน, แนวโน้มเงินออม</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">ซิงค์อัตโนมัติบน Cloud Firebase</p>
                <p className="text-[11px] text-slate-500">เข้าถึงข้อมูลได้ทุกอุปกรณ์ ปลอดภัยตามบัญชีของคุณ</p>
              </div>
            </div>
          </div>

          <div className="border-t border-sky-200/60 pt-6 space-y-4">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold flex items-center gap-1.5 text-rose-900">
                    <span>⚠️</span> ไม่สามารถเข้าสู่ระบบด้วย Google ได้
                  </p>
                  <button
                    onClick={clearError}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
                <p className="leading-relaxed text-rose-700">{authError}</p>

                {/* Instant Guest Bypass Button inside error */}
                <button
                  onClick={loginAsGuest}
                  className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>กดเข้าใช้งานทันทีด้วยโหมดทดลองใช้ (ไม่ต้องรอตั้งค่า)</span>
                </button>

                {authError.includes('Authorized domains') && (
                  <div className="pt-2 border-t border-rose-200/80 text-[11px] space-y-1.5 text-slate-700">
                    <p className="font-semibold text-rose-900">ขั้นตอนการตั้งค่าใน Firebase Console:</p>
                    <div className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-rose-200 text-slate-800">
                      <code className="font-mono text-xs font-semibold">{currentHost}</code>
                      <button
                        onClick={copyHostToClipboard}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 text-[10px] font-semibold cursor-pointer"
                      >
                        {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedDomain ? 'คัดลอกแล้ว' : 'คัดลอกโดเมน'}
                      </button>
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                      <li>เปิด <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-700 underline font-medium inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a></li>
                      <li>เลือกโปรเจกต์ <strong>mythic-meridian-7pthm</strong></li>
                      <li>ไปที่ <strong>Build &gt; Authentication &gt; Settings &gt; Authorized domains</strong></li>
                      <li>กด <strong>Add domain</strong> วางโดเมนข้างต้น แล้วกด Save</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Main Option 1: Guest Mode / Direct Access */}
            <div>
              <button
                onClick={loginAsGuest}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl shadow-md shadow-sky-600/20 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 cursor-pointer hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>เข้าใช้งานทันที (โหมดทดลองใช้ / ออฟไลน์)</span>
                <ArrowRight className="w-4 h-4 ml-auto text-sky-200" />
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-1.5">
                ⚡ ไม่ต้องล็อกอิน ใช้งานได้ทันที บันทึกรายรับรายจ่ายและดูกราฟได้ครบทุกฟังก์ชัน
              </p>
            </div>

            <div className="relative my-2 flex items-center justify-center">
              <div className="border-t border-sky-200 w-full" />
              <span className="bg-sky-50/90 px-3 text-[11px] text-slate-400 font-medium">หรือเข้าสู่ระบบเพื่อซิงค์ข้อมูล</span>
              <div className="border-t border-sky-200 w-full" />
            </div>

            {/* Option 2: Google Sign-in Button */}
            <div className="space-y-2">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-sky-300 rounded-2xl shadow-xs bg-white text-sm font-semibold text-slate-800 hover:bg-sky-100/70 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    <span>กำลังเชื่อมต่อบัญชี Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google SVG Logo */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>เข้าสู่ระบบด้วย Gmail (Google)</span>
                  </>
                )}
              </button>

              {/* Fallback for mobile / popup-blocked */}
              <button
                onClick={handleRedirectLogin}
                disabled={isLoggingIn}
                className="w-full text-center text-[11px] text-sky-700 hover:text-sky-900 underline font-medium cursor-pointer py-1"
              >
                กรณีเบราว์เซอร์บล็อกป๊อปอัป: กดเข้าสู่ระบบแบบ Redirect ที่นี่
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            ฐานข้อมูล Firebase จัดการภายใต้โปรเจกต์และคอลเลกชัน <span className="font-mono text-sky-700 font-semibold">MoneyDB</span>
          </p>
        </div>
      </div>
    </div>
  );
};
