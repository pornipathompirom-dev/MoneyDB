import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Transaction, UserProfile, TransactionType } from '../types';
import { generateSampleTransactions } from '../utils/demoData';

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
}

// Guest Mode Local Storage Helpers
const GUEST_TX_KEY = 'moneydb_guest_transactions';
const GUEST_PROFILE_KEY = 'moneydb_guest_profile';

function getGuestStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(GUEST_TX_KEY);
    if (!raw) {
      const nowMonth = new Date().toISOString().substring(0, 7);
      const samples = generateSampleTransactions(nowMonth);
      const initialItems: Transaction[] = samples.map((s, idx) => ({
        id: `guest_tx_${Date.now()}_${idx}`,
        userId: 'guest_user',
        type: s.type,
        amount: s.amount,
        category: s.category,
        title: s.title,
        date: s.date,
        month: s.date.substring(0, 7),
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem(GUEST_TX_KEY, JSON.stringify(initialItems));
      return initialItems;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading guest transactions:', e);
    return [];
  }
}

function saveGuestStoredTransactions(items: Transaction[]) {
  try {
    localStorage.setItem(GUEST_TX_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('moneydb_guest_sync'));
  } catch (e) {
    console.error('Error saving guest transactions:', e);
  }
}

export function subscribeToUserTransactions(
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
) {
  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    const emit = () => {
      const items = getGuestStoredTransactions();
      items.sort((a, b) => b.date.localeCompare(a.date));
      onSuccess([...items]);
    };
    emit();
    const handleSync = () => emit();
    window.addEventListener('moneydb_guest_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('moneydb_guest_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }

  const collectionPath = `users/${userId}/transactions`;
  const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category || 'อื่นๆ',
          title: data.title || '',
          date: data.date || '',
          month: data.month || (data.date ? data.date.substring(0, 7) : ''),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      onSuccess(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (wrappedError) {
        onError(wrappedError as Error);
      }
    }
  );
}

export async function createTransaction(userId: string, input: NewTransactionInput): Promise<string> {
  const now = new Date().toISOString();
  const month = input.date.substring(0, 7);

  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    const items = getGuestStoredTransactions();
    const newId = `guest_tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTx: Transaction = {
      id: newId,
      userId,
      type: input.type,
      amount: Number(input.amount),
      category: input.category.trim(),
      title: input.title.trim(),
      date: input.date,
      month,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newTx);
    saveGuestStoredTransactions(items);
    return newId;
  }

  const collectionPath = `users/${userId}/transactions`;
  const payload = {
    userId,
    type: input.type,
    amount: Number(input.amount),
    category: input.category.trim(),
    title: input.title.trim(),
    date: input.date,
    month,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function editTransaction(
  userId: string,
  transactionId: string,
  input: Partial<NewTransactionInput>
): Promise<void> {
  const now = new Date().toISOString();

  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    const items = getGuestStoredTransactions();
    const idx = items.findIndex((t) => t.id === transactionId);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.amount !== undefined ? { amount: Number(input.amount) } : {}),
        ...(input.category !== undefined ? { category: input.category.trim() } : {}),
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.date !== undefined ? { date: input.date, month: input.date.substring(0, 7) } : {}),
        updatedAt: now,
      };
      saveGuestStoredTransactions(items);
    }
    return;
  }

  const docPath = `users/${userId}/transactions/${transactionId}`;
  const updateData: Record<string, any> = {
    updatedAt: now,
  };

  if (input.type !== undefined) updateData.type = input.type;
  if (input.amount !== undefined) updateData.amount = Number(input.amount);
  if (input.category !== undefined) updateData.category = input.category.trim();
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.date !== undefined) {
    updateData.date = input.date;
    updateData.month = input.date.substring(0, 7);
  }

  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function removeTransaction(userId: string, transactionId: string): Promise<void> {
  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    const items = getGuestStoredTransactions().filter((t) => t.id !== transactionId);
    saveGuestStoredTransactions(items);
    return;
  }

  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    try {
      const raw = localStorage.getItem(GUEST_PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading guest profile:', e);
    }
    return {
      userId,
      email: 'guest@moneydb.local',
      displayName: 'ผู้ใช้งานทั่วไป (Guest)',
      monthlyBudget: 15000,
      currency: 'THB',
    };
  }

  const docPath = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const now = new Date().toISOString();

  if (userId === 'guest_user' || userId.startsWith('guest_')) {
    try {
      const current = await fetchUserProfile(userId) || {
        userId,
        email: 'guest@moneydb.local',
        displayName: 'ผู้ใช้งานทั่วไป (Guest)',
        monthlyBudget: 15000,
      };
      const updated = { ...current, ...profile, userId, updatedAt: now };
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving guest profile:', e);
    }
    return;
  }

  const docPath = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(
      docRef,
      {
        ...profile,
        userId,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
