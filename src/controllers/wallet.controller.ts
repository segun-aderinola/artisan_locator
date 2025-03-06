import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import AppError from '../utils/error-log.utils';
import { WalletService } from '../service/wallet.service';

@injectable()
export class WalletController {
    constructor(
        @inject(WalletService) private readonly walletService: WalletService
    ) {}

    public createWallet = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.walletService.createWallet(req.body);
            return ApiResponse.handleSuccess(res, 'Rate is successful', response, StatusCodes.CREATED);
        } catch (error) {
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }

    public transactions = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.walletService.transactionHistories(req);
            return ApiResponse.handleSuccess(res, 'Transaction is successful', response, StatusCodes.OK);
        } catch (error){
            const statusCode = error instanceof AppError ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
            return ApiResponse.handleError(res, (error as Error).message, statusCode);
        }
    }
}
