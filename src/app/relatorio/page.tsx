"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  fetchExpenses,
  fetchIncomes,
  Expense,
  Income,
} from "@/lib/firestoreApi";

const categoryLabels: Record<string, string> = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  outros: "Outros",
};

export default function RelatorioPage() {
  const now = new Date();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [expensesData, incomesData] = await Promise.all([
        fetchExpenses(),
        fetchIncomes(),
      ]);
      setExpenses(expensesData);
      setIncomes(incomesData);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncomes - totalExpenses;

  // Totals by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Carregando relatório...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Relatório de {format(now, "MMMM yyyy")}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Resumo</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Entradas</span>
              <span className="font-semibold text-green-700">
                R$ {totalIncomes.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Despesas</span>
              <span className="font-semibold text-red-700">
                R$ {totalExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-bold text-gray-900">Saldo</span>
              <span
                className={`font-bold text-xl ${
                  netBalance >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                R$ {netBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Totais por Categoria
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(categoryTotals).length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-gray-500 py-4">
                    Nenhuma despesa registrada.
                  </td>
                </tr>
              )}
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <tr key={cat}>
                  <td className="px-4 py-2 text-gray-900">
                    {categoryLabels[cat] || cat}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    R$ {total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Entradas</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-gray-500 py-4">
                    Nenhuma entrada registrada.
                  </td>
                </tr>
              )}
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td className="px-4 py-2 text-gray-900">
                    {income.description}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    R$ {income.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Despesas</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Pago?
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    Nenhuma despesa registrada.
                  </td>
                </tr>
              )}
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-4 py-2 text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {categoryLabels[expense.category] || expense.category}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    R$ {expense.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {expense.isPaid ? (
                      <span className="text-green-700 font-semibold">Sim</span>
                    ) : (
                      <span className="text-red-700 font-semibold">Não</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
