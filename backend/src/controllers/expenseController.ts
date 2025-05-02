import { Request, Response } from 'express';
import { ExpensesService } from '../services/expenseService';
import { createExpenseSchema, updateExpenseSchema } from '../middlewares/expenseValidators';

export const ExpensesController = {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createExpenseSchema.parse(req.body);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      const expense = await ExpensesService.create(validatedData, userId);

      res.status(201).json({
        success: true,
        message: 'Despesa criada com sucesso',
        data: expense
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar despesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      const expense = await ExpensesService.getById(id, userId);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Despesa recuperada com sucesso',
        data: expense
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar despesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getByMonth(req: Request, res: Response) {
    try {
      const monthId = parseInt(req.params.monthId);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      const expenses = await ExpensesService.getByMonth(monthId, userId);

      res.status(200).json({
        success: true,
        message: expenses.length > 0 
          ? 'Despesas do mês recuperadas com sucesso' 
          : 'Nenhuma despesa encontrada para este mês',
        count: expenses.length,
        data: expenses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar despesas do mês',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateExpenseSchema.parse(req.body);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      const expense = await ExpensesService.update(id, validatedData, userId);

      res.status(200).json({
        success: true,
        message: 'Despesa atualizada com sucesso',
        data: expense
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar despesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      await ExpensesService.delete(id, userId);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir despesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getTotalByMonth(req: Request, res: Response) {
    try {
      const monthId = parseInt(req.params.monthId);
      const userId = parseInt(req.body.user_uuid); // Obtém user_uuid do body
      
      const total = await ExpensesService.getTotalByMonth(monthId, userId);

      res.status(200).json({
        success: true,
        message: 'Total de despesas do mês calculado',
        data: { total }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao calcular total de despesas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};