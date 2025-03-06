import { UserType } from "../enum";

declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      firstname: string;
      lastname: string;
      phone: string;
      email: string;
      role: UserType;
    };
  }
}
