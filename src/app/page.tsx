"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import NewExpenseForm from "@/components/NewExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import { format } from "date-fns";
import {
  addExpense,
  addIncome,
  fetchExpenses,
  fetchIncomes,
  updateExpense,
  deleteExpense,
  Expense,
  Income,
} from "@/lib/firestoreApi";
import { auth } from "@/lib/firebase";

interface ExpenseFormData {
  description: string;
  amount: string;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  recurrenceType?: "monthly" | "parceled" | "none";
  totalParcels?: number;
  endDate?: string;
}

export default function Home() {
  const now = new Date();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [incomeDescription, setIncomeDescription] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] =
    useState<ExpenseFormData | null>(null);

  // Fetch data from Firestore on mount and when user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        const [expensesData, incomesData] = await Promise.all([
          fetchExpenses(),
          fetchIncomes(),
        ]);
        setExpenses(expensesData);
        setIncomes(incomesData);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddExpense = async (data: ExpenseFormData) => {
    const newExpense: Omit<Expense, "id"> = {
      ...data,
      isPaid: false,
      amount: parseFloat(data.amount),
      ...(data.recurrenceType === "parceled" ? { currentParcel: 1 } : {}),
    };
    await addExpense(newExpense);
    setExpenses(await fetchExpenses());
  };

  const handleTogglePaid = async (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;
    const update: Partial<Expense> = { isPaid: !expense.isPaid };
    if (
      !expense.isPaid &&
      expense.recurrenceType === "parceled" &&
      typeof expense.currentParcel === "number"
    ) {
      update.currentParcel = expense.currentParcel + 1;
    }
    await updateExpense(expenseId, update);
    setExpenses(await fetchExpenses());
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeDescription || !incomeAmount) return;
    const newIncome: Omit<Income, "id"> = {
      description: incomeDescription,
      amount: parseFloat(incomeAmount.replace(",", ".")),
    };
    await addIncome(newIncome);
    setIncomes(await fetchIncomes());
    setIncomeDescription("");
    setIncomeAmount("");
  };

  const handleEditExpense = async (data: ExpenseFormData) => {
    if (!editExpenseId) return;
    const update: Partial<Expense> = {
      ...data,
      amount: parseFloat(data.amount),
    };
    await updateExpense(editExpenseId, update);
    setExpenses(await fetchExpenses());
    setEditExpenseId(null);
    setEditInitialData(null);
    setIsFormOpen(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    setExpenses(await fetchExpenses());
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const paidExpenses = expenses
    .filter((expense) => expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = totalExpenses - paidExpenses;
  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
  const netBalance = totalIncomes - totalExpenses;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 transform transition-all duration-300 hover:scale-[1.02]">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Contas</h1>
        <p className="text-gray-600">
          Controle suas despesas mensais de forma simples e eficiente
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumo do Mês
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Entradas</span>
              <span className="text-xl font-semibold text-green-700">
                R$ {totalIncomes.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Despesas</span>
              <span className="text-2xl font-bold text-gray-900">
                R$ {totalExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas Pagas</span>
              <span className="text-xl font-semibold text-green-600">
                R$ {paidExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas Pendentes</span>
              <span className="text-xl font-semibold text-red-600">
                R$ {pendingExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <span className="text-gray-800 font-bold">Saldo do Mês</span>
              <span
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                R$ {netBalance.toFixed(2)}
              </span>
            </div>
          </div>
          {/* Formulário de entrada de renda */}
          <form onSubmit={handleAddIncome} className="mt-6 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Descrição (ex: Salário)"
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors px-2 py-1"
              />
              <input
                type="number"
                placeholder="Valor"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors px-2 py-1"
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                +
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Despesas */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Despesas de {format(now, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova Despesa
            </button>
          </div>

          <ExpenseList
            expenses={expenses}
            onEdit={(expense) => {
              setEditExpenseId(expense.id);
              setEditInitialData({
                description: expense.description,
                amount: expense.amount.toString(),
                dueDate: expense.dueDate,
                category: expense.category,
                isRecurring: expense.isRecurring,
                recurrenceType: expense.recurrenceType,
                totalParcels: expense.totalParcels,
                endDate: expense.endDate,
              });
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteExpense}
            onTogglePaid={handleTogglePaid}
          />
        </div>
      </div>

      {isFormOpen && (
        <NewExpenseForm
          onClose={() => {
            setIsFormOpen(false);
            setEditExpenseId(null);
            setEditInitialData(null);
          }}
          onSubmit={editExpenseId ? handleEditExpense : handleAddExpense}
          initialData={editInitialData || undefined}
        />
      )}
    </div>
  );
}
