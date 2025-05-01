import { Router, Request, Response } from "express";
import { IncomesController } from "../controllers/incomeController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();


router.post("/", (req: Request, res: Response) => {
  IncomesController.create(req, res);
});

router.get("/:id", authMiddleware, (req: Request, res: Response) => {
  IncomesController.getById(req, res);
});


router.put("/:id", authMiddleware, (req: Request, res: Response) => {
  IncomesController.update(req, res);
});

router.delete("/:id", authMiddleware, (req: Request, res: Response) => {
  IncomesController.delete(req, res);
});

router.get("/month/:monthId/total", authMiddleware, (req: Request, res: Response) => {
  IncomesController.getByMonth(req, res);
});

export default router;