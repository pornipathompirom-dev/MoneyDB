import { ALL_CATEGORIES } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTH_NAMES_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function formatThaiDate(dateStr: string, full: boolean = false): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const thaiYear = year + 543;
  const monthName = full ? THAI_MONTH_NAMES_FULL[monthIdx] : THAI_MONTH_NAMES_SHORT[monthIdx];
  return `${day} ${monthName} ${thaiYear}`;
}

export function formatMonthThai(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const thaiYear = year + 543;
  return `${THAI_MONTH_NAMES_FULL[monthIdx]} ${thaiYear}`;
}

export function getCategoryDetails(categoryName: string) {
  const match = ALL_CATEGORIES.find((c) => c.name === categoryName);
  if (match) return match;
  return {
    id: 'unknown',
    name: categoryName,
    type: 'expense' as const,
    iconName: 'HelpCircle',
    color: '#64748B',
    bgColor: '#F1F5F9',
  };
}
