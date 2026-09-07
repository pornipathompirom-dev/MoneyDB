import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { ChartsSection } from './components/ChartsSection';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import {
  subscribeToUserTransactions,
  createTransaction,
  editTransaction,
  removeTransaction,
  fetchUserProfile,
  saveUserProfile,
  NewTransactionInput,
} from './services/transactionService';
import { Transaction, UserProfile, TransactionType } from './types';
import { generateSampleTransactions } from './utils/demoData';
import { Loader2, Plus, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // Helper for current month YYYY-MM
  const getInitialMonth = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getInitialMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to real-time transactions when user is authenticated
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setUserProfile(null);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    // 1. Fetch user profile / budget
    fetchUserProfile(user.uid)
      .then((profile) => {
        if (profile) {
          setUserProfile(profile);
        } else {
          // Initialize profile
          const initialProfile: Partial<UserProfile> = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            monthlyBudget: 20000,
            currency: 'THB',
          };
          saveUserProfile(user.uid, initialProfile).catch(console.error);
          setUserProfile(initialProfile as UserProfile);
        }
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
      });

    // 2. Real-time Firestore transaction listener
    const unsubscribe = subscribeToUserTransactions(
      user.uid,
      (items) => {
        setTransactions(items);
        setDataLoading(false);
      },
      (error) => {
        console.error('Transactions subscription error:', error);
        setDataLoading(false);
        showToast('ไม่สามารถโหลดข้อมูลจาก Firebase ได้ โปรดตรวจสอบการเชื่อมต่อ', 'error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter transactions for currentMonth
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txMonth = tx.month || tx.date.substring(0, 7);
      return txMonth === currentMonth;
    });
  }, [transactions, currentMonth]);

  // Aggregate monthly totals
  const { totalIncome, totalExpense, incomeCount, expenseCount } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
        incCount += 1;
      } else {
        expense += tx.amount;
        expCount += 1;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      incomeCount: incCount,
      expenseCount: expCount,
    };
  }, [monthTransactions]);

  // Transaction CRUD handlers
  const handleOpenNewTransaction = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSubmitTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    title: string;
    date: string;
  }) => {
    if (!user) return;

    if (editingTx) {
      await editTransaction(user.uid, editingTx.id, data);
      showToast('แก้ไขรายการสำเร็จ');
    } else {
      await createTransaction(user.uid, data);
      showToast('บันทึกรายการสำเร็จ');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await removeTransaction(user.uid, id);
      showToast('ลบรายการสำเร็จ');
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการลบรายการ', 'error');
    }
  };

  const handleSaveBudget = async (budget: number) => {
    if (!user) return;
    await saveUserProfile(user.uid, { monthlyBudget: budget });
    setUserProfile((prev) => (prev ? { ...prev, monthlyBudget: budget } : null));
    showToast('บันทึกงบประมาณประจำเดือนสำเร็จ');
  };

  // Load sample demo data
  const handleLoadDemoData = async () => {
    if (!user) return;
    try {
      setIsGeneratingDemo(true);
      const samples = generateSampleTransactions(currentMonth);
      for (const sample of samples) {
        await createTransaction(user.uid, sample);
      }
      showToast('เพิ่มข้อมูลจำลองตัวอย่างเรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง', 'error');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-sky-50/70 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">กำลังเตรียมระบบและตรวจสอบการเชื่อมต่อ...</p>
      </div>
    );
  }

  // If not logged in, display Google Login screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-sky-50/60 text-slate-900 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-sky-600 text-white border-sky-500 shadow-sky-500/20'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        monthlyBudget={userProfile?.monthlyBudget}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Action Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white p-6 rounded-3xl shadow-md border border-sky-400/30">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              สวัสดีคุณ {user.displayName || user.email?.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              จัดการรายรับรายจ่าย ดูสรุปผล และวิเคราะห์กระแสเงินสดของคุณได้ทันที ข้อมูลถูกจัดเก็บอย่างปลอดภัยบน Firebase MoneyDB
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {transactions.length === 0 && (
              <button
                onClick={handleLoadDemoData}
                disabled={isGeneratingDemo}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 disabled:opacity-50"
              >
                {isGeneratingDemo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>โหลดข้อมูลตัวอย่าง</span>
              </button>
            )}

            <button
              onClick={handleOpenNewTransaction}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-50 text-blue-900 hover:bg-sky-100 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 border border-sky-200"
            >
              <Plus className="w-4 h-4 text-sky-700" />
              <span>บันทึกรายการ</span>
            </button>
          </div>
        </div>

        {/* 1. Monthly Summary Cards */}
        <MonthlySummaryCards
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          monthlyBudget={userProfile?.monthlyBudget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Analytical Graphs and Visualizations */}
        <ChartsSection
          currentMonth={currentMonth}
          monthTransactions={monthTransactions}
          allTransactions={transactions}
        />

        {/* 3. Transactions Record List & Management */}
        <TransactionList
          transactions={monthTransactions}
          onEdit={handleOpenEditTransaction}
          onDelete={handleDeleteTransaction}
          onAddNew={handleOpenNewTransaction}
          onLoadDemoData={handleLoadDemoData}
          isLoading={dataLoading}
        />
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <button
          onClick={handleOpenNewTransaction}
          className="w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center active:scale-95 transition-transform"
          title="เพิ่มรายการใหม่"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Transaction Modal */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleSubmitTransaction}
        editingTransaction={editingTx}
        defaultMonth={currentMonth}
      />

      {/* Monthly Budget Modal */}
      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={userProfile?.monthlyBudget || 0}
        onSaveBudget={handleSaveBudget}
      />
    </div>
  );
}

