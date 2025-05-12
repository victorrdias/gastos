import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Expense {
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

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onTogglePaid: (expenseId: string) => void;
}

const categoryLabels: Record<string, string> = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  outros: "Outros",
};

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onTogglePaid,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Nenhuma despesa registrada ainda. Clique em "Nova Despesa" para começar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Descrição
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Valor
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Vencimento
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Categoria
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.description}
                    {expense.isRecurring && (
                      <span className="ml-2 text-xs text-blue-600">
                        {expense.recurrenceType === "monthly"
                          ? "(Mensal)"
                          : expense.recurrenceType === "parceled"
                          ? `(Parcela ${expense.currentParcel}/${expense.totalParcels})`
                          : "(Recorrente)"}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  R$ {expense.amount.toFixed(2)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {format(new Date(expense.dueDate), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                  {expense.endDate && (
                    <div className="text-xs text-gray-500">
                      até {format(new Date(expense.endDate), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {categoryLabels[expense.category]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onTogglePaid(expense.id)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                    expense.isPaid
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  }`}
                >
                  {expense.isPaid ? "Pago" : "Pendente"}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(expense)}
                  className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
