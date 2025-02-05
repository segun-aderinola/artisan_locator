import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from 'src/utils/api-response';
import { Schema, ValidationError } from 'yup';

export const validator = (schema: Schema<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validate(req.body, { abortEarly: false });
            next();
        } catch (err) {
            if (err instanceof ValidationError) {
                // If validation fails, return the errors as a response
                //   return res.status(400).json({ errors: err.errors });
                return ApiResponse.handleError(res, err.errors[0], StatusCodes.BAD_REQUEST);
            }
            // Handle unexpected errors
            next(err);
        }
    };
};
