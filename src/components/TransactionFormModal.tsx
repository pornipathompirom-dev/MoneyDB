import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    title: string;
    date: string;
  }) => Promise<void>;
  editingTransaction?: Transaction | null;
  defaultMonth?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  defaultMonth,
}) => {
  const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDate());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setTitle(editingTransaction.title);
      setDate(editingTransaction.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setTitle('');
      // If defaultMonth is passed, set date to defaultMonth with today's day if matches, or 1st day
      if (defaultMonth) {
        const todayStr = getTodayDate();
        if (todayStr.startsWith(defaultMonth)) {
          setDate(todayStr);
        } else {
          setDate(`${defaultMonth}-01`);
        }
      } else {
        setDate(getTodayDate());
      }
    }
    setErrorMsg('');
  }, [editingTransaction, isOpen, defaultMonth]);

  // When type changes, default to first category of that type if not matching
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('กรุณาระบุรายละเอียดหรือชื่อรายการ');
      return;
    }

    if (!category) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setErrorMsg('กรุณาระบุวันที่ทำรายการ');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        type,
        amount: parsedAmount,
        category,
        title: title.trim(),
        date,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-sky-50 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-200/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
              </h3>
              <p className="text-xs text-slate-500">
                {type === 'expense' ? 'บันทึกรายจ่ายของคุณ' : 'บันทึกรายรับเข้าบัญชี'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-sky-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-sky-100/70 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>รายจ่าย</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-sky-800 hover:text-sky-950'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>รายรับ</span>
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600/60 font-bold text-base">
                ฿
              </span>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-sky-100/50 border border-sky-200 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>
            {/* Quick Amount presets */}
            <div className="flex items-center gap-1.5 mt-2">
              {[50, 100, 300, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(amount) || 0;
                    setAmount(String(cur + val));
                  }}
                  className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 text-[11px] font-medium rounded-lg transition-colors border border-sky-200/60"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อรายการ / บันทึก *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder={type === 'expense' ? 'เช่น ข้าวผัดกะเพรา, ค่าน้ำมัน, ช้อปปิ้ง' : 'เช่น เงินเดือน, งานฟรีแลนซ์, ขายของ'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-sky-100/50 border border-sky-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-sky-200 rounded-xl bg-sky-100/30">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-2 rounded-lg text-left flex flex-col items-center text-center gap-1 transition-all border ${
                      isSelected
                        ? 'border-sky-500 bg-sky-100 text-sky-950 font-medium ring-1 ring-sky-500'
                        : 'border-transparent bg-white/80 hover:bg-sky-100/60 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[11px] leading-tight line-clamp-1">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วันที่ทำรายการ *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-sky-100/50 border border-sky-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-sky-200 text-sky-900 hover:bg-sky-100 rounded-xl text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
