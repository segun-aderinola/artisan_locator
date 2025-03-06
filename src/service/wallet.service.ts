import { autoInjectable } from 'tsyringe';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';
import { RequestWithUser } from '../types/requestWithUser';
import RatingModel from '../models/rating';
import RequestModel from '../models/request';
import WalletModel from '../models/wallet';
import TransactionModel from '../models/transaction';

@autoInjectable()  
  export class WalletService {
    constructor(
      
    ){}

    async createWallet(payload: { user_id: string, account_number: string, bank_name: string }) {
      try {
        await this.checkWalletExist(payload.user_id); 
        const wallet = await WalletModel.create({...payload});
        return wallet.dataValues;
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? "An error occurred while creating wallet");
      }
    }

    async findWalletByUser(user_id: string){
      const wallet = await WalletModel.findOne({ where: { user_id } })
      return {
        account_number: wallet?.account_number ?? "",
        balance: wallet?.balance ?? 0.00,
        bank_name: wallet?.bank_name ?? ""
      }
    }

    async checkWalletExist(user_id: string){
      const wallet = await WalletModel.findOne({ where: { user_id } })
      if(wallet) throw new AppError(StatusCodes.BAD_REQUEST, "Wallet already exist for this user");
      return true;
    }

    async transactionHistories(req: RequestWithUser) {
      const page: number = Number(req.query.page) || 1; 
      const pageSize: number = Number(req.query.pageSize) || 10;
      const user_id = req.user?.userId;
      const offset = (page - 1) * pageSize;
      const { count, rows } = await TransactionModel.findAndCountAll({
        where: {
          user_id: user_id
        },
          limit: pageSize,
          offset: offset,
          order: [["created_at", "DESC"]],
      });
      return {
          transactions: rows,
          pagination: {
              totalRecords: count,
              totalPages: Math.ceil(count / pageSize),
              currentPage: page,
              pageSize: pageSize,
          },
      };
    }
}
