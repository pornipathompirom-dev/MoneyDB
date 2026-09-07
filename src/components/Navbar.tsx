import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, Sliders, Database, UserCheck } from 'lucide-react';

interface NavbarProps {
  onOpenBudgetModal: () => void;
  monthlyBudget?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBudgetModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-sky-50/90 backdrop-blur-md border-b border-sky-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-sky-300 bg-white shadow-xs flex items-center justify-center">
              <img
                src="/college_logo_circle.png"
                alt="วิทยาลัยอาชีวศึกษาแพร่"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">MoneyDB</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-300">
                  <Database className="w-3 h-3" />
                  moneydb
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ระบบจัดการรายรับรายจ่าย & สรุปผล</p>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <button
                  onClick={onOpenBudgetModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-sky-900 hover:text-sky-950 bg-sky-100 hover:bg-sky-200/80 border border-sky-200/80 rounded-lg transition-colors"
                  title="ตั้งค่างบประมาณประจำเดือน"
                >
                  <Sliders className="w-4 h-4 text-sky-700" />
                  <span className="hidden sm:inline">ตั้งค่างบประมาณ</span>
                </button>

                <div className="h-6 w-px bg-sky-200" />

                <div className="flex items-center gap-2.5 pl-1">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-sky-300 object-cover ring-2 ring-sky-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-800 text-xs font-semibold">
                      {user.email ? user.email.charAt(0).toUpperCase() : <UserCheck className="w-4 h-4" />}
                    </div>
                  )}

                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[150px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{user.email}</p>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
