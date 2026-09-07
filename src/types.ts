export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  monthlyBudget?: number;
  currency?: string;
  updatedAt?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
  bgColor: string;
}

export interface MonthlyAnalytics {
  month: string; // e.g. "2026-09"
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    type: TransactionType;
    color: string;
  }[];
  dailyTrend: {
    day: string; // e.g. "01", "02"
    dateStr: string;
    income: number;
    expense: number;
    net: number;
  }[];
}

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', iconName: 'Utensils', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'transport', name: 'การเดินทางและน้ำมัน', type: 'expense', iconName: 'Car', color: '#F97316', bgColor: '#FFEDD5' },
  { id: 'housing', name: 'ที่อยู่อาศัยและค่าน้ำไฟ', type: 'expense', iconName: 'Home', color: '#EAB308', bgColor: '#FEF9C3' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', iconName: 'ShoppingBag', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'entertainment', name: 'ท่องเที่ยวและบันเทิง', type: 'expense', iconName: 'Film', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: 'health', name: 'สุขภาพและการแพทย์', type: 'expense', iconName: 'HeartPulse', color: '#06B6D4', bgColor: '#CFFAFE' },
  { id: 'education', name: 'การศึกษาและพัฒนาตนเอง', type: 'expense', iconName: 'GraduationCap', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', iconName: 'MoreHorizontal', color: '#64748B', bgColor: '#F1F5F9' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', iconName: 'Briefcase', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', iconName: 'Store', color: '#059669', bgColor: '#A7F3D0' },
  { id: 'bonus', name: 'โบนัส / ค่าคอมมิชชั่น', type: 'income', iconName: 'Award', color: '#14B8A6', bgColor: '#CCFBF1' },
  { id: 'investment', name: 'เงินปันผล / ดอกเบี้ย', type: 'income', iconName: 'TrendingUp', color: '#0EA5E9', bgColor: '#E0F2FE' },
  { id: 'gift', name: 'ของขวัญ / ได้รับมา', type: 'income', iconName: 'Gift', color: '#6366F1', bgColor: '#E0E7FF' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', iconName: 'PlusCircle', color: '#84CC16', bgColor: '#ECFCCB' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
