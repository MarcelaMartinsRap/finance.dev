import { Income } from '@prisma/client';

export type IncomeCreateData = {
  title: string;
  amount: number;
  date: Date;
  monthId?: number;
};

export type IncomeUpdateData = Partial<IncomeCreateData>;

export type IncomeResponse = Income & {
  month: {
    month: number;
    year: number;
    user: {
      id: number;
      name: string;
    };
  };
};