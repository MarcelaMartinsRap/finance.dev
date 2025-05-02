import { z } from 'zod';

const fixedExpenseSchema = z.object({
  is_fixed: z.boolean(),
  installments: z.number().int().positive().optional(),
  end_date: z.coerce.date().optional()
}).optional();

const baseExpenseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.coerce.date(),
  notes: z.string().optional(),
  monthId: z.number().int().positive("ID do mês inválido").optional(),
  categoryId: z.number().int().positive("ID da categoria inválido").optional(),
  categoryName: z.string().min(1, "Nome da categoria é obrigatório se categoryId não for fornecido").optional(),
  fixedExpense: fixedExpenseSchema
});
const categorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal (#RRGGBB)").optional()
}).optional();

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.coerce.date(),
  notes: z.string().optional(),
  monthId: z.number().int().positive("ID do mês inválido").optional(),
  categoryId: z.number().int().positive("ID da categoria inválido").optional(),
  category: categorySchema, // Novo schema para categoria
  fixedExpense: fixedExpenseSchema
}).refine(data => data.categoryId || data.category, {
  message: "Deve fornecer categoryId ou objeto category",
  path: ["category"]
});

export const updateExpenseSchema = baseExpenseSchema.partial();