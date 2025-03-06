import { UserType } from "../enum";

export interface IJwt {
    userId: string;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    role: UserType;
}