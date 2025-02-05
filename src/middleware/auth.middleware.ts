import { Schema } from 'yup';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response'; // Assuming this is your custom ApiResponse
import { StatusCodes } from 'http-status-codes';
import JWT from "jsonwebtoken";
import { AuthenticatedRequest, UserPayload } from '../interfaces/general';

// export const validator = <T>(schema: Schema<T>) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Validate request body using the provided schema
//       await schema.validate(req.body, { abortEarly: false });
//       next(); // Continue to the next middleware or route handler
//     } catch (error: any) {
//       // If validation fails, send an error response
//       return ApiResponse.handleError(res, error.errors[0], StatusCodes.BAD_REQUEST);
//     }
//   };
// };

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

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the token from the authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if no token is provided
    if (!token) {
      return ApiResponse.handleError(res, "Authentication failed. Token is required.", StatusCodes.UNAUTHORIZED);
    }

    // 3. Verify the token
    let decoded: UserPayload;
    try {
      decoded = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as UserPayload;
      // Optionally, validate required fields in the payload
      // if (!decoded.id || !decoded.email || !decoded.user_type) {
      //   return ApiResponse.handleError(res, "Authentication failed. Invalid token payload.", StatusCodes.UNAUTHORIZED);
      // }
    } catch (err) {
      return ApiResponse.handleError(res, "Authentication failed. Invalid or expired token.", StatusCodes.UNAUTHORIZED);
    }

    // 4. Attach user information to the request object
    req.user = {
      id: decoded.uuid,
      email: decoded.email,
      user_type: decoded.user_type,
    };
    // req.user = decoded;

    // Road clear! Proceed to the next middleware or route handler
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

