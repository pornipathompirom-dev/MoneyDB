import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatMonthThai } from '../utils/formatters';

interface MonthlySummaryCardsProps {
  currentMonth: string; // "YYYY-MM"
  onMonthChange: (newMonth: string) => void;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  monthlyBudget?: number;
  onOpenBudgetModal: () => void;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  currentMonth,
  onMonthChange,
  totalIncome,
  totalExpense,
  incomeCount,
  expenseCount,
  monthlyBudget = 0,
  onOpenBudgetModal,
}) => {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const padMonth = String(newMonth).padStart(2, '0');
    onMonthChange(`${newYear}-${padMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const padMonth = String(newMonth).padStart(2, '0');
    onMonthChange(`${newYear}-${padMonth}`);
  };

  const handleCurrentMonthReset = () => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = String(today.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${curYear}-${curMonth}`);
  };

  // Budget calculations
  const budgetUsagePercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;

  return (
    <div className="space-y-4">
      {/* Month Selection Bar */}
      <div className="bg-sky-50/90 p-4 rounded-2xl border border-sky-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              สรุปผลประจำเดือน: <span className="text-sky-800">{formatMonthThai(currentMonth)}</span>
            </h2>
            <p className="text-xs text-slate-500">เลือกเดือนที่ต้องการดูรายงานและวิเคราะห์ตัวเลข</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-sky-200 bg-white/70 hover:bg-sky-100 text-sky-900 transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="month"
            value={currentMonth}
            onChange={(e) => e.target.value && onMonthChange(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium text-sky-950 border border-sky-200 rounded-xl bg-sky-100/60 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          />

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-sky-200 bg-white/70 hover:bg-sky-100 text-sky-900 transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCurrentMonthReset}
            className="px-2.5 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100 border border-sky-300 bg-sky-50 rounded-xl transition-colors ml-1"
          >
            เดือนนี้
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800/80 uppercase tracking-wider">รายรับทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-sky-700 tracking-tight">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{incomeCount} รายการ</span>
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">รายจ่ายทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-600 tracking-tight">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{expenseCount} รายการ</span>
              {totalIncome > 0 && (
                <span className="ml-auto text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                  {Math.round((totalExpense / totalIncome) * 100)}% ของรายรับ
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800/80 uppercase tracking-wider">คงเหลือสุทธิ</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                balance >= 0 ? 'bg-sky-100 text-sky-700' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-2xl font-bold tracking-tight ${
                balance >= 0 ? 'text-slate-900' : 'text-amber-600'
              }`}
            >
              {formatCurrency(balance)}
            </p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">อัตราการออม</span>
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                  savingsRate > 0
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : savingsRate === 0
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Budget Card */}
        <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800/80 uppercase tracking-wider">งบประมาณรายเดือน</span>
            <button
              onClick={onOpenBudgetModal}
              className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold hover:underline"
            >
              {monthlyBudget > 0 ? 'แก้ไข' : '+ ตั้งค่า'}
            </button>
          </div>

          {monthlyBudget > 0 ? (
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-800">{formatCurrency(totalExpense)}</span>
                <span className="text-xs text-slate-500">/ {formatCurrency(monthlyBudget)}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-sky-100/70 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalExpense > monthlyBudget
                      ? 'bg-rose-500'
                      : budgetUsagePercent > 80
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>

              <p className="text-[11px] mt-1.5 flex items-center justify-between">
                {remainingBudget >= 0 ? (
                  <span className="text-sky-700 flex items-center gap-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> เหลืองบ {formatCurrency(remainingBudget)}
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-0.5 font-medium">
                    <AlertCircle className="w-3 h-3" /> เกินงบ {formatCurrency(Math.abs(remainingBudget))}
                  </span>
                )}
                <span className="text-slate-400">{budgetUsagePercent}%</span>
              </p>
            </div>
          ) : (
            <div className="mt-3 text-center py-1">
              <p className="text-xs text-slate-500">ยังไม่ได้ตั้งเป้างบประมาณ</p>
              <button
                onClick={onOpenBudgetModal}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                <PiggyBank className="w-3.5 h-3.5" /> ตั้งค่างบรายจ่าย
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
