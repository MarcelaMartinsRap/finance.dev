import { Router, Request, Response } from "express";
import { ExpensesController } from "../controllers/expenseController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();


router.post("/", (req: Request, res: Response) => {
    ExpensesController.create(req, res);
});

router.get("/:id",  (req: Request, res: Response) => {
    ExpensesController.getById(req, res);
});


router.put("/:id",  (req: Request, res: Response) => {
    ExpensesController.update(req, res);
});

router.delete("/:id",  (req: Request, res: Response) => {
    ExpensesController.delete(req, res);
});

router.get("/month/:monthId/total",  (req: Request, res: Response) => {
    ExpensesController.getByMonth(req, res);
});

export default router;