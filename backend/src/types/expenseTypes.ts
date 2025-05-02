import { Expense, FixedExpense, Category, Month } from '@prisma/client';

export type ExpenseCreateData = {
  title: string;
  amount: number;
  date: Date;
  notes?: string;
  monthId?: number;
  categoryId?: number;
  category?: { 
    name: string;
    color?: string; 
  };
  fixedExpense?: {
    is_fixed: boolean;
    installments?: number;
    end_date?: Date;
  };
};

export type ExpenseUpdateData = Partial<ExpenseCreateData>;

export type ExpenseResponse = Expense & {
  category: Pick<Category, 'id' | 'name' | 'color'>;
  month: Pick<Month, 'id' | 'month' | 'year'>;
  fixedExpense?: FixedExpense | null;
};