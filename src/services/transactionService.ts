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

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
}

export function subscribeToUserTransactions(
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
) {
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
  const collectionPath = `users/${userId}/transactions`;
  const now = new Date().toISOString();
  const month = input.date.substring(0, 7);

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
  const docPath = `users/${userId}/transactions/${transactionId}`;
  const now = new Date().toISOString();

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
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
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
  const docPath = `users/${userId}`;
  const now = new Date().toISOString();
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
