import { z } from 'zod';

export const createIncomeSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100),
  amount: z.number().positive("Valor deve ser positivo").max(1000000),
  date: z.coerce.date(),
  monthId: z.number().int().positive("ID do mês inválido").optional()
});

export const updateIncomeSchema = createIncomeSchema.partial();