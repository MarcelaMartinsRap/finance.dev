import { PrismaClient } from '@prisma/client';
import { IncomeCreateData, IncomeUpdateData, IncomeResponse } from '../types/incomesTypes';

const prisma = new PrismaClient();

export const IncomesService = {
  async getOrCreateMonthId(date: Date, userId: number): Promise<number> {
    const month = date.getMonth() + 1; // +1 pois getMonth retorna 0-11
    const year = date.getFullYear();

    // Verifica se o mês já existe para o usuário
    const existingMonth = await prisma.month.findFirst({
      where: {
        month,
        year,
        userId
      }
    });

    if (existingMonth) {
      return existingMonth.id;  // Retorna o ID do mês existente
    }

    // Cria um novo mês caso não exista
    const newMonth = await prisma.month.create({
      data: {
        month,
        year,
        userId
      }
    });

    return newMonth.id;
  },

  async create(data: IncomeCreateData, userId: number): Promise<IncomeResponse> {
    // Se monthId não foi fornecido, cria/recupera o mês baseado na data
    const monthId = data.monthId || await this.getOrCreateMonthId(data.date, userId);

    // Garantir que o monthId está correto antes de criar a renda
    const existingMonth = await prisma.month.findUnique({
      where: { id: monthId }
    });

    if (!existingMonth) {
      throw new Error(`Mês com ID ${monthId} não encontrado. Verifique a relação com a tabela de meses.`);
    }

    // Criação da renda
    return await prisma.income.create({
      data: {
        title: data.title,
        amount: data.amount,
        date: data.date,
        monthId
      },
      include: {
        month: {
          select: {
            month: true,
            year: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  },

  async getById(id: number): Promise<IncomeResponse | null> {
    return await prisma.income.findUnique({
      where: { id },
      include: {
        month: {
          select: {
            month: true,
            year: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  },

  async getByMonth(monthId: number): Promise<IncomeResponse[]> {
    return await prisma.income.findMany({
      where: { monthId },
      include: {
        month: {
          select: {
            month: true,
            year: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  },

  async update(id: number, data: IncomeUpdateData): Promise<IncomeResponse> {
    return await prisma.income.update({
      where: { id },
      data,
      include: {
        month: {
          select: {
            month: true,
            year: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.income.delete({
      where: { id }
    });
  },

  async getTotalByMonth(monthId: number): Promise<number> {
    const result = await prisma.income.aggregate({
      where: { monthId },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }
};
