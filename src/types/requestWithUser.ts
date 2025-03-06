import { Request } from "express";
import { UserType } from "../enum";

export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    role: UserType;
  };
}


export const getUser = (req: Request) => {
  const userRequest = req as RequestWithUser;
  return userRequest.user;
};