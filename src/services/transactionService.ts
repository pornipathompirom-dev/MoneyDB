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

// Multi-Account & Offline Local Storage Helpers
function getLocalTxKey(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `moneydb_tx_${safeId}`;
}

function getLocalProfileKey(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `moneydb_profile_${safeId}`;
}

function getLocalStoredTransactions(userId: string): Transaction[] {
  try {
    const key = getLocalTxKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Check legacy guest storage
      const legacyGuest = localStorage.getItem('moneydb_guest_transactions');
      if (legacyGuest && (userId === 'guest_user' || userId.startsWith('guest_'))) {
        return JSON.parse(legacyGuest);
      }
      const nowMonth = new Date().toISOString().substring(0, 7);
      const samples = generateSampleTransactions(nowMonth);
      const initialItems: Transaction[] = samples.map((s, idx) => ({
        id: `tx_${Date.now()}_${idx}`,
        userId,
        type: s.type,
        amount: s.amount,
        category: s.category,
        title: s.title,
        date: s.date,
        month: s.date.substring(0, 7),
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem(key, JSON.stringify(initialItems));
      return initialItems;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local transactions:', e);
    return [];
  }
}

function saveLocalStoredTransactions(userId: string, items: Transaction[]) {
  try {
    const key = getLocalTxKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('moneydb_local_sync', { detail: { userId } }));
  } catch (e) {
    console.error('Error saving local transactions:', e);
  }
}

export function subscribeToUserTransactions(
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
) {
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    const emit = () => {
      const items = getLocalStoredTransactions(userId);
      items.sort((a, b) => b.date.localeCompare(a.date));
      onSuccess([...items]);
    };
    emit();
    const handleSync = (e: any) => {
      if (!e?.detail?.userId || e.detail.userId === userId) {
        emit();
      }
    };
    window.addEventListener('moneydb_local_sync', handleSync);
    window.addEventListener('storage', emit);
    return () => {
      window.removeEventListener('moneydb_local_sync', handleSync);
      window.removeEventListener('storage', emit);
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
      console.warn('Firestore snapshot warning, serving local fallback:', error);
      const fallback = getLocalStoredTransactions(userId);
      fallback.sort((a, b) => b.date.localeCompare(a.date));
      onSuccess([...fallback]);
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
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    const items = getLocalStoredTransactions(userId);
    const newId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
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
    saveLocalStoredTransactions(userId, items);
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
    console.warn('Cloud write failed, saving locally:', error);
    const items = getLocalStoredTransactions(userId);
    const newId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    items.unshift({ id: newId, ...payload });
    saveLocalStoredTransactions(userId, items);
    return newId;
  }
}

export async function editTransaction(
  userId: string,
  transactionId: string,
  input: Partial<NewTransactionInput>
): Promise<void> {
  const now = new Date().toISOString();
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    const items = getLocalStoredTransactions(userId);
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
      saveLocalStoredTransactions(userId, items);
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
    console.warn('Cloud update failed, updating locally:', error);
    const items = getLocalStoredTransactions(userId);
    const idx = items.findIndex((t) => t.id === transactionId);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updateData };
      saveLocalStoredTransactions(userId, items);
    }
  }
}

export async function removeTransaction(userId: string, transactionId: string): Promise<void> {
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    const items = getLocalStoredTransactions(userId).filter((t) => t.id !== transactionId);
    saveLocalStoredTransactions(userId, items);
    return;
  }

  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Cloud delete failed, removing locally:', error);
    const items = getLocalStoredTransactions(userId).filter((t) => t.id !== transactionId);
    saveLocalStoredTransactions(userId, items);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    try {
      const raw = localStorage.getItem(getLocalProfileKey(userId));
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading local profile:', e);
    }
    return {
      userId,
      email: 'user@moneydb.local',
      displayName: 'ผู้ใช้งาน',
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
    console.warn('Cloud profile fetch error, returning fallback:', error);
    return {
      userId,
      email: 'user@moneydb.local',
      displayName: 'ผู้ใช้งาน',
      monthlyBudget: 15000,
      currency: 'THB',
    };
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const now = new Date().toISOString();
  const isLocalUser = userId === 'guest_user' || userId.startsWith('guest_') || userId.startsWith('user_') || userId.startsWith('local_');

  if (isLocalUser) {
    try {
      const current = await fetchUserProfile(userId) || {
        userId,
        email: 'user@moneydb.local',
        displayName: 'ผู้ใช้งาน',
        monthlyBudget: 15000,
      };
      const updated = { ...current, ...profile, userId, updatedAt: now };
      localStorage.setItem(getLocalProfileKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving local profile:', e);
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
    console.warn('Cloud profile save failed, saving locally:', error);
    try {
      const updated = { ...profile, userId, updatedAt: now };
      localStorage.setItem(getLocalProfileKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving local profile fallback:', e);
    }
  }
}
