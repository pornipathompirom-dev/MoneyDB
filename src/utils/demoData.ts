import { NewTransactionInput } from '../services/transactionService';

export function generateSampleTransactions(currentMonth: string): NewTransactionInput[] {
  const [year, month] = currentMonth.split('-').map(Number);

  // Helper to format date in month
  const makeDate = (m: number, d: number) => {
    const padM = String(m).padStart(2, '0');
    const padD = String(d).padStart(2, '0');
    return `${year}-${padM}-${padD}`;
  };

  const currentMonthTransactions: NewTransactionInput[] = [
    {
      type: 'income',
      amount: 48000,
      category: 'เงินเดือน / ค่าจ้าง',
      title: 'เงินเดือนประจำเดือน',
      date: makeDate(month, 1),
    },
    {
      type: 'income',
      amount: 8500,
      category: 'ธุรกิจส่วนตัว / ค้าขาย',
      title: 'รายได้โปรเจกต์พิเศษฟรีแลนซ์',
      date: makeDate(month, 5),
    },
    {
      type: 'expense',
      amount: 11000,
      category: 'ที่อยู่อาศัยและค่าน้ำไฟ',
      title: 'ค่าเช่าห้องและค่าน้ำไฟประจำเดือน',
      date: makeDate(month, 2),
    },
    {
      type: 'expense',
      amount: 1650,
      category: 'การเดินทางและน้ำมัน',
      title: 'เติมน้ำมันรถยนต์',
      date: makeDate(month, 3),
    },
    {
      type: 'expense',
      amount: 1450,
      category: 'อาหารและเครื่องดื่ม',
      title: 'ทานอาหารบุฟเฟต์กับครอบครัว',
      date: makeDate(month, 4),
    },
    {
      type: 'expense',
      amount: 2890,
      category: 'ช้อปปิ้งและของใช้',
      title: 'ซื้อของใช้เข้าบ้านและซูเปอร์มาร์เก็ต',
      date: makeDate(month, 5),
    },
    {
      type: 'expense',
      amount: 650,
      category: 'ท่องเที่ยวและบันเทิง',
      title: 'ดูภาพยนตร์วันหยุด',
      date: makeDate(month, 6),
    },
    {
      type: 'expense',
      amount: 950,
      category: 'สุขภาพและการแพทย์',
      title: 'ตรวจสุขภาพและซื้อวิตามินบำรุง',
      date: makeDate(month, 7),
    },
    {
      type: 'expense',
      amount: 1200,
      category: 'การศึกษาและพัฒนาตนเอง',
      title: 'ซื้อหนังสือและคอร์สทักษะเสริม',
      date: makeDate(month, 7),
    },
    {
      type: 'expense',
      amount: 320,
      category: 'อาหารและเครื่องดื่ม',
      title: 'กาแฟและเบเกอรี่',
      date: makeDate(month, 7),
    },
  ];

  // Also include a few in previous month for trend comparison
  const prevMonth = month > 1 ? month - 1 : 12;
  const prevYear = month > 1 ? year : year - 1;
  const makePrevDate = (d: number) => {
    const padM = String(prevMonth).padStart(2, '0');
    const padD = String(d).padStart(2, '0');
    return `${prevYear}-${padM}-${padD}`;
  };

  const prevMonthTransactions: NewTransactionInput[] = [
    {
      type: 'income',
      amount: 48000,
      category: 'เงินเดือน / ค่าจ้าง',
      title: 'เงินเดือนประจำเดือนก่อนหน้า',
      date: makePrevDate(1),
    },
    {
      type: 'expense',
      amount: 11000,
      category: 'ที่อยู่อาศัยและค่าน้ำไฟ',
      title: 'ค่าเช่าห้องเดือนก่อน',
      date: makePrevDate(2),
    },
    {
      type: 'expense',
      amount: 15400,
      category: 'ช้อปปิ้งและของใช้',
      title: 'ค่าใช้จ่ายทั่วไป',
      date: makePrevDate(15),
    },
  ];

  return [...currentMonthTransactions, ...prevMonthTransactions];
}
