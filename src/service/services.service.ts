import { autoInjectable } from 'tsyringe';
import { Request } from 'express';
import ServiceModel from '../models/services';
import { getUser } from '../types/requestWithUser';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';
import ServiceProviderModel from '../models/service-provider';
import sequelize from '../database';
import { Op, WhereOptions } from "sequelize";

// Function to calculate distance between two coordinates using the Haversine formula
const haversineDistanceQuery = (customerLat: number, customerLng: number) => {
  return sequelize.literal(`
    (6371 * acos(
      cos(radians(${customerLat})) * cos(radians("provider"."latitude"::FLOAT))
      * cos(radians("provider"."longitude"::FLOAT) - radians(${customerLng}))
      + sin(radians(${customerLat})) * sin(radians("provider"."latitude"::FLOAT))
    )) 
  `);
};

@autoInjectable()
export class ServicesService {

  async createService(req: Request) {
    try {
        const userData = req.body;
        const user = getUser(req);
        userData.provider_id = user?.userId;
        await this.checkServiceExist(userData.name, user?.userId);
        const service = await ServiceModel.create(userData);
        return service.toJSON();
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating service');
    }
  }

  async fetchService(req: Request) {
    try {
        const id = req.params.id;
        const service = await this.getServiceById(id);
        const service_provider = await ServiceProviderModel.findOne({ where: { uuid: service.provider_id } })
        return {
          ...service.toJSON(),
          provider: {
            name: service_provider?.firstname+ " "+service_provider?.lastname,
            image: service_provider?.business_logo ?? ""
          } 
        };
    } catch (error) {
        
    }
  }

  async checkServiceExist(name: string, provider_id?: string){
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
    const servicesWithProviders = await Promise.all(rows.map(async (service) => {
      const service_provider = await ServiceProviderModel.findOne({ 
          where: { uuid: service.provider_id } 
      });

      return {
          ...service.toJSON(),
          provider: {
            name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
            image: service_provider?.business_logo ?? ""
          }
      };
    }));
    return {
        services: servicesWithProviders,
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
      const servicesWithProviders = await Promise.all(rows.map(async (service) => {
      const service_provider = await ServiceProviderModel.findOne({ 
          where: { uuid: service.provider_id } 
      });

      return {
          ...service.toJSON(),
          provider: {
            name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
            image: service_provider?.business_logo ?? ""
          }
      };
    }));

  return {
      services: servicesWithProviders,
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

    const servicesWithProviders = await Promise.all(rows.map(async (service) => {
      const service_provider = await ServiceProviderModel.findOne({ 
          where: { uuid: service.provider_id } 
      });

      return {
          ...service.toJSON(),
          provider: {
            name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
            image: service_provider?.business_logo ?? ""
          }
      };
    }));
    return {
        services: servicesWithProviders,
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
        return service.toJSON();
    } catch (error) {
      if(error instanceof AppError) throw error;
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating service');
    }
  }  
  async searchServices(req: Request) {
    try {
      const { query, category, lat, lng, page = 1, pageSize = 10, starting_price } = req.query;
  
      // if (!lat || !lng) {
      //   throw new AppError(StatusCodes.BAD_REQUEST, "Latitude and longitude are required");
      // }
  
      const customerLat = parseFloat(lat as string);
      const customerLng = parseFloat(lng as string);
      const offset = (Number(page) - 1) * Number(pageSize);
  
      // Define search filters
      const searchFilters: WhereOptions<any> = { status: "active" };
  
      if (query) {
        searchFilters[Op.or as keyof WhereOptions] = [
          { name: { [Op.iLike]: `%${query}%` } },
          { "$provider.category_of_service$": { [Op.iLike]: `%${query}%` } },
        ];
      }
  
      if (category) {
        searchFilters.category_id = category;
      }
  
      if (starting_price) {
        searchFilters.starting_price = { [Op.gte]: parseFloat(starting_price as string) };
      }

      let distanceFilter: any = null;
      console.log(lat, lng)
      if (lat && lng) {
        const customerLat = parseFloat(lat as string);
        const customerLng = parseFloat(lng as string);

        if (!isNaN(customerLat) && !isNaN(customerLng)) {
          distanceFilter = sequelize.where(
            sequelize.literal(`
              (6371 * acos(
                cos(radians(${customerLat})) * cos(radians("provider"."latitude"::FLOAT))
                * cos(radians("provider"."longitude"::FLOAT) - radians(${customerLng}))
                + sin(radians(${customerLat})) * sin(radians("provider"."latitude"::FLOAT))
              ))
            `),
            { [Op.lte]: 1.0 } // Only filter by distance if lat/lng are present
          );
        }
      }

      const includeClause: any = {
        model: ServiceProviderModel,
        as: "provider",
        attributes: ["firstname", "lastname", "business_logo", "latitude", "longitude"],
      };
  
      if (distanceFilter) {
        includeClause.where = distanceFilter;
      }


      const { count, rows } = await ServiceModel.findAndCountAll({
        where: searchFilters,
        include: [includeClause],
        limit: Number(pageSize),
        offset,
        order: [["created_at", "DESC"]],
      });
  
      // Format response with provider details
      const servicesWithProviders = await Promise.all(
        rows.map(async (service) => {
          const provider = await ServiceProviderModel.findOne({ where: { uuid: service.provider_id } })  
          return {
          ...service.toJSON(),
            provider: {
              name: provider ? `${provider.firstname} ${provider.lastname}` : "Unknown Provider",
              image: provider?.business_logo ?? "",
            },
        }}));
      
      
      
      
      return {
        services: servicesWithProviders,
        pagination: {
          totalRecords: count,
          totalPages: Math.ceil(count / Number(pageSize)),
          currentPage: Number(page),
          pageSize: Number(pageSize),
        },
      };
    } catch (error) {
      console.error("Error in searchServices:", error);
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, "An error occurred while searching for services.");
    }
  }
  

}
