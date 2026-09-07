import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, PieChart, ShieldCheck, Database, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, authError, clearError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-emerald-600/20 shadow-xl shadow-emerald-600/15 flex items-center justify-center p-1 overflow-hidden">
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

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Database className="w-3.5 h-3.5" />
          Firebase Database: moneydb
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 space-y-6">
          {/* Key Feature Highlights */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">บันทึกรายรับรายจ่ายสะดวกรวดเร็ว</p>
                <p className="text-[11px] text-slate-500">แยกหมวดหมู่อาหาร เดินทาง ช้อปปิ้ง เงินเดือน ฯลฯ</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                <PieChart className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">สรุปผลรายเดือน & กราฟวิเคราะห์ลึก</p>
                <p className="text-[11px] text-slate-500">กราฟวงกลมสัดส่วน, กราฟแท่งรายวัน, แนวโน้มเงินออม</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">ซิงค์อัตโนมัติบน Cloud Firebase</p>
                <p className="text-[11px] text-slate-500">เข้าถึงข้อมูลได้ทุกอุปกรณ์ ปลอดภัยตามบัญชีของคุณ</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                <p className="font-semibold">ไม่สามารถเข้าสู่ระบบได้</p>
                <p className="mt-0.5">{authError}</p>
                <button
                  onClick={clearError}
                  className="mt-1 text-[11px] font-semibold underline text-rose-800"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-2xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>กำลังเชื่อมต่อบัญชี Google...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              ใช้บัญชี Google เพื่อความปลอดภัย ข้อมูลของคุณจะถูกจัดเก็บแยกส่วนตัว
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            ฐานข้อมูล Firebase จัดการภายใต้โปรเจกต์และคอลเลกชัน <span className="font-mono text-emerald-700">MoneyDB</span>
          </p>
        </div>
      </div>
    </div>
  );
};
