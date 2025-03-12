import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import { CategoryService } from '../service/category.service';
import AppError from '../utils/error-log.utils';
import { RequestService } from '../service/requests.service';

@injectable()
export class RequestController {
    constructor(
        @inject(RequestService) private readonly requestService: RequestService
    ) {}

    public createRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.request(req);
            return ApiResponse.handleSuccess(res, 'Request for this service has been sent.', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public acceptRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.acceptRequest(req);
            return ApiResponse.handleSuccess(res, 'Request for this service has been accepted.', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public declineRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.declineRequest(req);
            return ApiResponse.handleSuccess(res, 'Request for this service has been declined.', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchRequestDetail = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchRequestDetail(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchOngoingRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllOngoingRequestsByProvider(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchPendingRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllPendingRequestsByProvider(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchCompletedRequest = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllCompletedRequestsByProvider(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchOngoingRequestCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllOngoingRequestsByCustomer(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchCompletedRequestCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllCompletedRequestsByCustomer(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchPendingRequestCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.requestService.fetchAllPendingRequestsByCustomer(req);
            return ApiResponse.handleSuccess(res, 'Request fetched successfully', response, StatusCodes.OK);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }
}
