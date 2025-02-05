import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiResponse } from "../utils/api-response";
import { StatusCodes } from "http-status-codes";

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // schema.parse(req.body);
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
                file: req.file,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.log(error);
                const message = error?.errors[0]?.message;
                // if (error?.errors[0].code === "invalid_type" && error?.errors[0].message == "Required") {
                //     message = `${error?.errors[0]?.path} is required`;
                // }
                return ApiResponse.handleError(res, message, StatusCodes.BAD_REQUEST);
            }
            return ApiResponse.handleError(res, "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };
};
