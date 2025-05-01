import { Router, Request, Response } from "express";
import userController from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";


const router = Router();

router.post("/register", (req: Request, res: Response) => {
  userController.registerUser(req, res);
});

router.post("/login", (req: Request, res: Response) => {
  userController.loginUser(req, res);
});

router.get("/:uuid", authMiddleware,(req: Request, res: Response) => {
  userController.getUserByUUID(req, res);
});



export default router;