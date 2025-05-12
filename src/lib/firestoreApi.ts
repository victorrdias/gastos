import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  isPaid: boolean;
  recurrenceType?: "monthly" | "parceled" | "none";
  totalParcels?: number;
  endDate?: string;
  currentParcel?: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
}

export async function addExpense(expense: Omit<Expense, "id">) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await addDoc(collection(db, "users", user.uid, "expenses"), expense);
}

export async function addIncome(income: Omit<Income, "id">) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await addDoc(collection(db, "users", user.uid, "incomes"), income);
}

export async function fetchExpenses(): Promise<Expense[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const querySnapshot = await getDocs(
    collection(db, "users", user.uid, "expenses")
  );
  return querySnapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Expense)
  );
}

export async function fetchIncomes(): Promise<Income[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const querySnapshot = await getDocs(
    collection(db, "users", user.uid, "incomes")
  );
  return querySnapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Income)
  );
}

export async function updateExpense(
  expenseId: string,
  update: Partial<Expense>
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const expenseRef = doc(db, "users", user.uid, "expenses", expenseId);
  await updateDoc(expenseRef, update);
}

export async function deleteExpense(expenseId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const expenseRef = doc(db, "users", user.uid, "expenses", expenseId);
  await deleteDoc(expenseRef);
}

export async function updateIncome(incomeId: string, update: Partial<Income>) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const incomeRef = doc(db, "users", user.uid, "incomes", incomeId);
  await updateDoc(incomeRef, update);
}

export async function deleteIncome(incomeId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const incomeRef = doc(db, "users", user.uid, "incomes", incomeId);
  await deleteDoc(incomeRef);
}
