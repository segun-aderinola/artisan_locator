import { autoInjectable } from 'tsyringe';
import ServiceCategoryModel from '../models/service-category';
import { Request } from 'express';
import { IServiceCategory } from '../interfaces/service-category';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';

@autoInjectable()
export class CategoryService {

  async createCategory(req: Request) {
    try {
        const userData: IServiceCategory = req.body;
        await this.checkCategoryExist(userData.name);
        const category = await ServiceCategoryModel.create(userData);
        return category.toJSON();
    } catch (error: any) {
        if(error instanceof AppError){
          throw error;
        }
        throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? 'An error occurred while creating category');
    }
  }

  async fetchCategory(req: Request) {
    try {
        const id = req.params.id;
        const category = await this.getCategoryById(id);
        return category.toJSON();
    } catch (error: any) {
      if(error instanceof AppError){
        throw error;
      }
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? 'An error occurred while fetching category');
    }
  }

  async updateCategory(req: Request) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const category = await this.getCategoryById(id);
        await category.update(updateData);
        return category.toJSON();
    } catch (error: any) {
      if(error instanceof AppError){
        throw error;
      }
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? 'An error occurred while fetching category');
    }
}

  
  async checkCategoryExist(name: string) {
    const category = await ServiceCategoryModel.findOne({where: {name}});
    if(category){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Category already exists');
    }
    return true;
  }
  async getCategoryById(uuid: string) {
    const category = await ServiceCategoryModel.findOne({where: {uuid}});
    if(!category){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Category not found');
    }
    return category;
  }

  async getAllCategories(req: Request) {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = Number(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const { count, rows } = await ServiceCategoryModel.findAndCountAll({
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
    });
    return {
        categories: rows,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: page,
            pageSize: pageSize,
        },
    };
}
}
