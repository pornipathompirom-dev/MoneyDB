import React, { useState, useMemo } from 'react';
import {
  Transaction,
  TransactionType,
} from '../types';
import { formatCurrency, formatThaiDate, getCategoryDetails } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  Plus,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onLoadDemoData: () => void;
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onLoadDemoData,
  isLoading,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesCat = tx.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        return 0;
      });
  }, [transactions, filterType, searchQuery, sortBy]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายการ', 'จำนวนเงิน(บาท)'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.date}"`,
      `"${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
      `"${tx.category}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.amount,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moneydb_transactions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-sky-50/80 rounded-2xl border border-sky-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-sky-200/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-700" />
              รายการบันทึกทั้งหมด
              <span className="text-xs font-medium px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                {filteredTransactions.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-500">ประวัติการรับจ่ายเงินและจัดการรายการ</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {transactions.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-900 hover:text-sky-950 bg-sky-100 hover:bg-sky-200/80 border border-sky-200 rounded-xl transition-colors"
                title="ส่งออกเป็นไฟล์ CSV (Excel)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออก CSV</span>
              </button>
            )}

            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-xs ml-auto sm:ml-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
          {/* Search input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-sky-600/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรายการหรือหมวดหมู่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-sky-100/50 border border-sky-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sky-950"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="sm:col-span-4 flex items-center p-0.5 bg-sky-100/70 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white text-sky-950 shadow-xs font-semibold'
                  : 'text-sky-800 hover:text-sky-950'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
                filterType === 'income'
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'text-sky-800 hover:text-sky-950'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-sky-100/50 border border-sky-200 rounded-xl text-sky-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="date-desc">วันที่ (ล่าสุดก่อน)</option>
              <option value="date-asc">วันที่ (เก่าสุดก่อน)</option>
              <option value="amount-desc">จำนวนเงิน (มากไปน้อย)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="divide-y divide-sky-100/80">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">กำลังโหลดข้อมูลจาก Firebase...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่พบรายการบันทึก</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {transactions.length === 0
                ? 'เริ่มต้นบันทึกรายรับรายจ่ายรายการแรก หรือโหลดข้อมูลตัวอย่างเพื่อดูตัวอย่างกราฟและสถิติ'
                : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
            </p>

            {transactions.length === 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={onAddNew}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-xs"
                >
                  + เพิ่มรายการแรก
                </button>
                <button
                  onClick={onLoadDemoData}
                  className="px-3.5 py-2 text-xs font-semibold text-sky-800 bg-sky-100 hover:bg-sky-200/80 border border-sky-300 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  โหลดข้อมูลจำลองตัวอย่าง
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const cat = getCategoryDetails(tx.category);
            const isExpense = tx.type === 'expense';
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-sky-100/40 transition-colors flex items-center justify-between gap-3 group"
              >
                {/* Left: Icon + Title & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    <CategoryIcon iconName={cat.iconName} className="w-5 h-5" color={cat.color} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{tx.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      >
                        {tx.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatThaiDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isExpense ? 'text-rose-600' : 'text-sky-700'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isExpense ? 'รายจ่าย' : 'รายรับ'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-sky-800 hover:bg-sky-100 rounded-lg transition-colors"
                      title="แก้ไขรายการ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(tx.id, e)}
                      disabled={isDeleting}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
