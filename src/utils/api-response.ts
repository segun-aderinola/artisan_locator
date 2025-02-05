import { Response } from 'express';
import logger from '../utils/logger';

export class ApiResponse {
    // Static method for handling errors
    static handleError = (res: Response, message: string, statusCode: number = 400) => {
        logger.log({ level: 'error', message });
        res.status(statusCode).json({ status: false, message, data: {} });
        // return res.status(statusCode).json({ status: false, message });
    };

    // Static method for handling success responses
    static handleSuccess = (res: Response, message: string, data = {}, statusCode: number = 200) => {
        res.status(statusCode).json({ status: true, message, data: { ...data } });
        // return res.status(statusCode).json({ status: true, message, data: { ...data } });
    };
}
