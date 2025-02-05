import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserType } from "../enum";

export interface UserPayload extends JwtPayload {
    id: string;
    email: string;
    user_type: UserType;
}

// export interface UserPayload extends JwtPayload, User {}

export interface AuthenticatedRequest extends Request {
    user: UserPayload;
}

export interface IUser {
    id: number;
    uuid: string;
    phone: string;
    email: string;
    firstname: string;
    lastname: string;
    gender: string;
    location?: string;
    password: string;
    email_verified_at?: Date;
    phone_verified_at?: Date;
    flagged?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Timestamps {
    created_at: Date;
    updated_at: Date;
}