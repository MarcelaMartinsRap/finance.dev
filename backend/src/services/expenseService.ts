import { PrismaClient } from '@prisma/client';
import { ExpenseCreateData, ExpenseUpdateData, ExpenseResponse } from '../types/expenseTypes';

const prisma = new PrismaClient();

export const ExpensesService = {
  async getOrCreateMonth(date: Date, userId: number) {
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();

    let monthRecord = await prisma.month.findFirst({
      where: {
        month,
        year,
        userId
      }
    });

    
    if (!monthRecord) {
      monthRecord = await prisma.month.create({
        data: {
          month,
          year,
          userId
        }
      });
    }

    return monthRecord.id;
  },

  async getOrCreateCategory(categoryData: { name: string; color?: string }, userId: number) {

    let category = await prisma.category.findFirst({
      where: {
        name: categoryData.name,
        userId
      }
    });
  
   
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryData.name,
          color: categoryData.color || '#FF5733', 
          userId
        }
      });
    }
  
    return category.id;
  },

  async create(data: ExpenseCreateData, userId: number): Promise<ExpenseResponse> {
    return await prisma.$transaction(async (tx) => {
      
      const monthId = data.monthId || await this.getOrCreateMonth(data.date, userId);
  
      
      let categoryId: number;
      if (data.categoryId) {
    
        const categoryExists = await tx.category.findFirst({
          where: { id: data.categoryId, userId }
        });
        if (!categoryExists) throw new Error('Categoria não encontrada ou não pertence ao usuário');
        categoryId = data.categoryId;
      } else if (data.category) {
        categoryId = await this.getOrCreateCategory(data.category, userId);
      } else {
        throw new Error('Nenhuma informação de categoria fornecida');
      }

      const expense = await tx.expense.create({
        data: {
          title: data.title,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
          monthId,
          categoryId
        },
        include: {
          category: { select: { id: true, name: true, color: true } },
          month: { select: { id: true, month: true, year: true } }
        }
      });

 
      if (data.fixedExpense?.is_fixed) {
        await tx.fixedExpense.create({
          data: {
            is_fixed: true,
            installments: data.fixedExpense.installments || 1,
            end_date: data.fixedExpense.end_date || new Date(),
            expenseId: expense.id
          }
        });
      }

      return {
        ...expense,
        fixedExpense: data.fixedExpense?.is_fixed 
          ? await tx.fixedExpense.findUnique({ where: { expenseId: expense.id } })
          : null
      };
    });
  },

  async getById(id: number, userId: number): Promise<ExpenseResponse | null> {
    return await prisma.expense.findFirst({
      where: { 
        id,
        month: { userId } 
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        month: { select: { id: true, month: true, year: true } },
        fixedExpense: true
      }
    });
  },

  async getByMonth(monthId: number, userId: number): Promise<ExpenseResponse[]> {
    return await prisma.expense.findMany({
      where: { 
        monthId,
        month: { userId } 
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        month: { select: { id: true, month: true, year: true } },
        fixedExpense: true
      },
      orderBy: { date: 'desc' }
    });
  },

  async update(id: number, data: ExpenseUpdateData, userId: number): Promise<ExpenseResponse> {
    return await prisma.$transaction(async (tx) => {
      const existingExpense = await tx.expense.findFirst({
        where: { id, month: { userId } },
        include: { fixedExpense: true }
      });
      if (!existingExpense) throw new Error('Despesa não encontrada');

      const expense = await tx.expense.update({
        where: { id },
        data: {
          title: data.title,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
          monthId: data.monthId,
          categoryId: data.categoryId
        },
        include: {
          category: { select: { id: true, name: true, color: true } },
          month: { select: { id: true, month: true, year: true } },
          fixedExpense: true
        }
      });

      if (data.fixedExpense) {
        if (existingExpense.fixedExpense) {
          await tx.fixedExpense.update({
            where: { expenseId: id },
            data: {
              is_fixed: data.fixedExpense.is_fixed,
              installments: data.fixedExpense.installments,
              end_date: data.fixedExpense.end_date
            }
          });
        } else if (data.fixedExpense.is_fixed) {
          await tx.fixedExpense.create({
            data: {
              is_fixed: true,
              installments: data.fixedExpense.installments || 1,
              end_date: data.fixedExpense.end_date || new Date(),
              expenseId: id
            }
          });
        }
      }

      return {
        ...expense,
        fixedExpense: await tx.fixedExpense.findUnique({ where: { expenseId: id } })
      };
    });
  },

  async delete(id: number, userId: number): Promise<void> {
    const expense = await prisma.expense.findFirst({
      where: { id, month: { userId } }
    });
    if (!expense) throw new Error('Despesa não encontrada');

    await prisma.expense.delete({ where: { id } });
  },

  async getTotalByMonth(monthId: number, userId: number): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: { 
        monthId,
        month: { userId } 
      },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }
};