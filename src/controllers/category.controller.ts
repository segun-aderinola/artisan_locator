import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import { CategoryService } from '../service/category.service';
import AppError from '../utils/error-log.utils';

@injectable()
export class CategoryController {
    constructor(
        @inject(CategoryService) private readonly categoryService: CategoryService
    ) {}

    public createCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.categoryService.createCategory(req);
            return ApiResponse.handleSuccess(res, 'Category created successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.categoryService.fetchCategory(req);
            return ApiResponse.handleSuccess(res, 'Category fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public fetchAllCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.categoryService.getAllCategories(req);
            return ApiResponse.handleSuccess(res, 'Categories fetched successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }
   
    public updateCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.categoryService.updateCategory(req);
            return ApiResponse.handleSuccess(res, 'Category updated successfully', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }
}
