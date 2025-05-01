import { Request, Response } from 'express';
import { IncomesService } from '../services/incomeService';
import { createIncomeSchema, updateIncomeSchema } from '../middlewares/incomeValidators';

export const IncomesController = {
    async create(req: Request, res: Response) {
        try {
          const validatedData = createIncomeSchema.parse(req.body);
          const userId = parseInt(req.body.user_uuid); 
      
          const income = await IncomesService.create(validatedData, userId);
      
          res.status(201).json({
            success: true,
            message: 'Renda criada com sucesso',
            data: income
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Erro ao criar renda',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      },

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const income = await IncomesService.getById(id);
      
      if (!income) {
        return res.status(404).json({
          success: false,
          message: 'Renda não encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Renda recuperada com sucesso',
        data: income
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar renda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getByMonth(req: Request, res: Response) {
    try {
      const monthId = parseInt(req.params.monthId);
      const incomes = await IncomesService.getByMonth(monthId);
      
      res.status(200).json({
        success: true,
        message: incomes.length > 0 
          ? 'Rendas do mês recuperadas com sucesso' 
          : 'Nenhuma renda encontrada para este mês',
        count: incomes.length,
        data: incomes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar rendas do mês',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateIncomeSchema.parse(req.body);
      const income = await IncomesService.update(id, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Renda atualizada com sucesso',
        data: income
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar renda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await IncomesService.delete(id);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir renda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getTotalByMonth(req: Request, res: Response) {
    try {
      const monthId = parseInt(req.params.monthId);
      const total = await IncomesService.getTotalByMonth(monthId);
      
      res.status(200).json({
        success: true,
        message: 'Total de rendas do mês calculado',
        data: { total }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao calcular total de rendas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};