import { autoInjectable } from 'tsyringe';
import { Request } from 'express';
import ServiceModel from '../models/services';
import { getUser } from '../types/requestWithUser';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';

@autoInjectable()
export class ServicesService {

  async createService(req: Request) {
    try {
        const userData = req.body;
        const user = getUser(req);
        userData.provider_id = user?.userId;
        await this.checkServiceExist(userData.name, user?.userId);
        const service = await ServiceModel.create(userData);
        return service.dataValues;
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating service');
    }
  }

  async fetchService(req: Request) {
    try {
        const id = req.params.id;
        const service = await this.getServiceById(id);
        return service.dataValues;
    } catch (error) {
        
    }
  }

  async checkServiceExist(name: string, provider_id?: string) {
    const service = await ServiceModel.findOne({ where: { name: name, provider_id: provider_id }});
    if(service){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Service already exists');
    }
    return true;
  }

  async getServiceById(uuid: string) {
    const service = await ServiceModel.findOne({ where: {uuid} });
    if(!service){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Service not found');
    }
    return service;
  }

  async getAllServicesByProvider(req: Request) {
    const page: number = Number(req.query.page) || 1; 
    const pageSize: number = Number(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;
    const user = getUser(req);
    const { count, rows } = await ServiceModel.findAndCountAll({
      where: {
        provider_id: user?.userId,
        status: 'active'
      },
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
    });
    return {
        services: rows,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: page,
            pageSize: pageSize,
        },
    };
  }

  async getAllServicesByCategory(req: Request) {
    const page: number = Number(req.query.page) || 1; 
    const pageSize: number = Number(req.query.pageSize) || 10;
    const category_id = req.params.category_id;
    const offset = (page - 1) * pageSize;
    const { count, rows } = await ServiceModel.findAndCountAll({
      where: {
        status: 'active',
        category_id: category_id
      },
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
    });
    return {
        services: rows,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: page,
            pageSize: pageSize,
        },
    };
  }

  async getAllServices(req: Request) {
    const page: number = Number(req.query.page) || 1; 
    const pageSize: number = Number(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await ServiceModel.findAndCountAll({
      where: {
        status: 'active'
      },
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
    });
    return {
        services: rows,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: page,
            pageSize: pageSize,
        },
    };
  }

  async updateService(req: Request) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = getUser(req)
        updateData.provider_id = user?.userId;

        const service = await this.getServiceById(id);
        await service.update(updateData);
        return service.dataValues;
    } catch (error) {
      if(error instanceof AppError) throw error;
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating service');
    }
  }
}
