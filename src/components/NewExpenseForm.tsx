import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";

const expenseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  isRecurring: z.boolean(),
  recurrenceType: z.enum(["none", "monthly", "parceled"]).optional(),
  totalParcels: z.number().optional(),
  endDate: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface NewExpenseFormProps {
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseFormData;
}

export default function NewExpenseForm({
  onClose,
  onSubmit,
  initialData,
}: NewExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      isRecurring: false,
      recurrenceType: "none",
    },
  });

  const recurrenceType = watch("recurrenceType");

  const handleFormSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.02]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Despesa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900"
            >
              Descrição
            </label>
            <input
              type="text"
              id="description"
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-700"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-900"
            >
              Valor
            </label>
            <input
              type="text"
              id="amount"
              {...register("amount")}
              placeholder="0,00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-700"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-900"
            >
              Data de Vencimento
            </label>
            <input
              type="date"
              id="dueDate"
              {...register("dueDate")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-700"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-900"
            >
              Categoria
            </label>
            <select
              id="category"
              {...register("category")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900"
            >
              <option value="">Selecione uma categoria</option>
              <option value="moradia">Moradia</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="lazer">Lazer</option>
              <option value="outros">Outros</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              {...register("isRecurring")}
              onChange={(e) => setShowRecurrenceOptions(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
            />
            <label
              htmlFor="isRecurring"
              className="ml-2 block text-sm text-gray-700"
            >
              Despesa Recorrente
            </label>
          </div>

          {showRecurrenceOptions && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200">
              <div>
                <label
                  htmlFor="recurrenceType"
                  className="block text-sm font-medium text-gray-900"
                >
                  Tipo de Recorrência
                </label>
                <select
                  id="recurrenceType"
                  {...register("recurrenceType")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900"
                >
                  <option value="monthly">Mensal</option>
                  <option value="parceled">Parcelado</option>
                </select>
              </div>

              {recurrenceType === "parceled" && (
                <div>
                  <label
                    htmlFor="totalParcels"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    id="totalParcels"
                    {...register("totalParcels", { valueAsNumber: true })}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-700"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-900"
                >
                  Data Final
                </label>
                <input
                  type="date"
                  id="endDate"
                  {...register("endDate")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-700"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
