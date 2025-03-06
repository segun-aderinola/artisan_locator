import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import { ServicesService } from '../service/services.service';
import AppError from '../utils/error-log.utils';

@injectable()
export class ServiceController {
    constructor(
        @inject(ServicesService) private readonly servicesService: ServicesService
    ) {}

    public createService = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.createService(req);
            return ApiResponse.handleSuccess(res, 'Service created successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchService = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.fetchService(req);
            return ApiResponse.handleSuccess(res, 'Service fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchAllServices = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.getAllServices(req);
            return ApiResponse.handleSuccess(res, 'Services fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchAllServicesByCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.getAllServicesByCategory(req);
            return ApiResponse.handleSuccess(res, 'Services fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchAllServicesByProvider = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.getAllServicesByProvider(req);
            return ApiResponse.handleSuccess(res, 'Services fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public updateService = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.servicesService.updateService(req);
            return ApiResponse.handleSuccess(res, 'Services fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

}
