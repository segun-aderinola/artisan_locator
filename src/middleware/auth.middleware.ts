import { Schema } from 'yup';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response'; // Assuming this is your custom ApiResponse
import { StatusCodes } from 'http-status-codes';
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, UserPayload } from '../interfaces/general';
import { getUser, RequestWithUser } from '../types/requestWithUser';


export const validator = (schema: Schema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      ApiResponse.handleError(res, error.errors[0], StatusCodes.BAD_REQUEST);
    }
  };
};

export const authenticateUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.handleError(res, "Authentication failed. Token is required.", StatusCodes.UNAUTHORIZED);
    }

    let decoded: UserPayload;
    try {
      console.log(process.env.JWT_SECRET_KEY)
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as UserPayload;

    } catch (err) {
      return ApiResponse.handleError(res, "Authentication failed. Invalid or expired token.", StatusCodes.UNAUTHORIZED);
    }

    const user = await getUser(req);
    console.log(user)
    req.user = user
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return ApiResponse.handleError(res, "An error occurred during authentication.", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};


export const authorizeUserType = (...allowedTypes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Ensure the user has the correct role
      if (!allowedTypes.includes(req.user.user_type)) {
        return ApiResponse.handleError(res, "Access denied. You do not have permission to access this resource.", StatusCodes.FORBIDDEN);
      }

      // Role is authorized; proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return ApiResponse.handleError(res, "An error occurred during authorization.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
};

export const UserAuthentication = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      res.status(400).json(ApiResponse.handleError(res, "Unauthorized access"));
      return;
    }

    const secret_key: string = process.env.JWT_SECRET_KEY || "";

    jwt.verify(token, secret_key, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json(ApiResponse.handleError(res, "Session expired, kindly login again"));
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    res.status(403).json(ApiResponse.handleError(res, "Invalid token"));
    return;
  }
};