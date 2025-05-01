import { PrismaClient, User } from "@prisma/client";
import { RegisterUser } from "../types/userTypes";

const prisma = new PrismaClient();

const userService = {
  getUserByUUID: async (uuid: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: {
        uuid: uuid,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  },


  registerUser: async (user: RegisterUser): Promise<User> => {
    const newUser = await prisma.user.create({
      data: {
        ...user,
      },
    });

    if (!newUser) {
      throw new Error("Erro ao registrar usuário");
    }

    return newUser;
  },


  
  
};

export default userService;