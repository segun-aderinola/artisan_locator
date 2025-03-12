import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import AppError from '../utils/error-log.utils';
import { RatingService } from '../service/rating.service';

@injectable()
export class RatingController {
    constructor(
        @inject(RatingService) private readonly ratingService: RatingService
    ) {}

    public customerRateServiceRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.ratingService.customerRateServiceRequest(req);
            return ApiResponse.handleSuccess(res, 'Rate is successful', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public providerRateServiceRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.ratingService.providerRateServiceRequest(req);
            return ApiResponse.handleSuccess(res, 'Rate is successful', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }
}
