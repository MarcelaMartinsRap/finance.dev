import userService from "../services/userService";
import { Request, Response } from "express";
import axios from "axios";
import bcrypt from "bcryptjs";
const AUTH_SERVICE_URL = "http://localhost:3002/api/auth";

const userController = {
  registerUser: async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: "Erro ao registrar email",
          message: "Tente outro.",
        });
      }
  
      
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userService.registerUser({
        name,
        email,
        password: hashedPassword,
         
      });
  
      return res
        .status(200)
        .json({ message: "Usuário registrado com sucesso", user: newUser });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Ocorreu um erro",
      });
    }
  },
  

  loginUser: async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          message: "Não encontramos um usuário com esse email.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Senha incorreta",
          message: "A senha fornecida está incorreta.",
        });
      }

      try {
        const authResponse = await axios.post<{
          token: string;
          error?: boolean;
          refreshToken: string;
        }>(`${AUTH_SERVICE_URL}/login`, { email, password });

        if (authResponse.data.error) {
          return res.status(500).json({
            error: "Erro na autenticação",
            message: "Erro ao autenticar. Tente novamente mais tarde.",
          });
        }

        return res.status(200).json({
          message: "Login realizado com sucesso!",
          user: user,
          token: authResponse.data.token,
          refreshToken: authResponse.data.refreshToken,
        });
      } catch (authError) {
        console.error("Erro ao autenticar no serviço externo:", authError);
        return res.status(500).json({
          error: "Erro na autenticação externa",
          message:
            "Erro ao autenticar com o serviço externo. Tente novamente mais tarde.",
        });
      }
    } catch (error) {
      console.error("Erro ao tentar fazer login:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: "Erro ao tentar fazer o login. Tente novamente mais tarde.",
      });
    }
  },
  getUserByUUID: async (req: Request, res: Response): Promise<Response> => {
    const uuid = req.params.uuid;

    try {
      const user = await userService.getUserByUUID(uuid);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Ocorreu um erro",
      });
    }
  },

  
};

export default userController;
