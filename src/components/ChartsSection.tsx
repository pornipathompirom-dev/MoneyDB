import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatNumber, getCategoryDetails } from '../utils/formatters';
import { BarChart3, PieChart as PieIcon, LineChart as TrendIcon, Layers } from 'lucide-react';

interface ChartsSectionProps {
  currentMonth: string; // "YYYY-MM"
  monthTransactions: Transaction[];
  allTransactions: Transaction[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  currentMonth,
  monthTransactions,
  allTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'category' | 'trend'>('category');
  const [pieCategoryType, setPieCategoryType] = useState<TransactionType>('expense');

  // 1. Prepare Daily Data for Current Month
  const dailyData = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const daysMap: { [day: number]: { income: number; expense: number } } = {};
    for (let i = 1; i <= daysInMonth; i++) {
      daysMap[i] = { income: 0, expense: 0 };
    }

    monthTransactions.forEach((tx) => {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (daysMap[d]) {
          if (tx.type === 'income') {
            daysMap[d].income += tx.amount;
          } else {
            daysMap[d].expense += tx.amount;
          }
        }
      }
    });

    return Object.entries(daysMap).map(([day, val]) => ({
      day: `${day}`,
      fullDate: `${currentMonth}-${String(day).padStart(2, '0')}`,
      รายรับ: val.income,
      รายจ่าย: val.expense,
      สุทธิ: val.income - val.expense,
    }));
  }, [currentMonth, monthTransactions]);

  // 2. Prepare Category Breakdown
  const categoryData = useMemo(() => {
    const filtered = monthTransactions.filter((tx) => tx.type === pieCategoryType);
    const catMap: { [category: string]: number } = {};

    filtered.forEach((tx) => {
      const cat = tx.category || 'อื่นๆ';
      catMap[cat] = (catMap[cat] || 0) + tx.amount;
    });

    const total = Object.values(catMap).reduce((acc, curr) => acc + curr, 0);

    const result = Object.entries(catMap).map(([name, value]) => {
      const details = getCategoryDetails(name);
      return {
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: details.color,
      };
    });

    // Sort by largest value
    return result.sort((a, b) => b.value - a.value);
  }, [monthTransactions, pieCategoryType]);

  // 3. Prepare 6-Month Historical Trend Data
  const trendData = useMemo(() => {
    const [curYear, curMonth] = currentMonth.split('-').map(Number);
    const monthsList: string[] = [];

    // Last 6 months up to current
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      monthsList.push(`${y}-${m}`);
    }

    const monthTotals: { [m: string]: { income: number; expense: number } } = {};
    monthsList.forEach((m) => {
      monthTotals[m] = { income: 0, expense: 0 };
    });

    allTransactions.forEach((tx) => {
      const m = tx.month || tx.date.substring(0, 7);
      if (monthTotals[m]) {
        if (tx.type === 'income') monthTotals[m].income += tx.amount;
        else monthTotals[m].expense += tx.amount;
      }
    });

    const THAI_MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    return monthsList.map((m) => {
      const parts = m.split('-').map(Number);
      const label = `${THAI_MONTH_SHORT[parts[1] - 1]} ${(parts[0] + 543) % 100}`;
      return {
        monthKey: m,
        monthLabel: label,
        รายรับ: monthTotals[m].income,
        รายจ่าย: monthTotals[m].expense,
        เงินออมสุทธิ: monthTotals[m].income - monthTotals[m].expense,
      };
    });
  }, [currentMonth, allTransactions]);

  const hasData = monthTransactions.length > 0;

  return (
    <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-4">
      {/* Header with View Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-sky-200/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-700" />
            กราฟและบทวิเคราะห์ทางการเงิน
          </h3>
          <p className="text-xs text-slate-500">วิเคราะห์พฤติกรรมการใช้จ่ายและกระแสเงินสด</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-sky-100/70 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white text-sky-950 shadow-xs font-semibold'
                : 'text-sky-800 hover:text-sky-950'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนหมวดหมู่</span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-sky-950 shadow-xs font-semibold'
                : 'text-sky-800 hover:text-sky-950'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>กระแสเงินสดรายวัน</span>
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-white text-sky-950 shadow-xs font-semibold'
                : 'text-sky-800 hover:text-sky-950'
            }`}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            <span>แนวโน้ม 6 เดือน</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Category Breakdown (Pie / Donut) */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">เลือกประเภทที่ต้องการวิเคราะห์:</span>
            <div className="inline-flex rounded-lg bg-sky-100/80 p-0.5">
              <button
                onClick={() => setPieCategoryType('expense')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  pieCategoryType === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายจ่าย
              </button>
              <button
                onClick={() => setPieCategoryType('income')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  pieCategoryType === 'income'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-sky-800 hover:text-sky-950'
                }`}
              >
                รายรับ
              </button>
            </div>
          </div>

          {!hasData || categoryData.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">ยังไม่มีข้อมูล{pieCategoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">เพิ่มรายการเพื่อแสดงกราฟสัดส่วนหมวดหมู่</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Chart */}
              <div className="lg:col-span-6 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'จำนวน']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List with Progress Bar */}
              <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span>{formatCurrency(cat.value)}</span>
                        <span className="text-slate-400 font-normal ml-1.5">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Cashflow (Bar Chart) */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>เปรียบเทียบรายรับและรายจ่ายในแต่ละวันของเดือน</span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  labelFormatter={(label) => `วันที่ ${label} ${currentMonth}`}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Bar dataKey="รายรับ" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="รายจ่าย" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: 6-Month Trend Overview */}
      {activeTab === 'trend' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ภาพรวมการเติบโตและการเก็บออมย้อนหลัง 6 เดือน</span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="monthLabel" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="รายรับ"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284C7' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="รายจ่าย"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F43F5E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="เงินออมสุทธิ"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
