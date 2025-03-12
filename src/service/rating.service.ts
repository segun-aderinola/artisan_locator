import { autoInjectable } from 'tsyringe';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';
import { RequestWithUser } from '../types/requestWithUser';
import RatingModel from '../models/rating';
import RequestModel from '../models/request';

@autoInjectable()  
  export class RatingService {
    constructor(
      
    ){}

    async customerRateServiceRequest(req: RequestWithUser) {
      try {

        const userId = req.user?.userId        
        if (!userId) {
          throw new AppError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
        }

        const request_id = req.params.id;
        const { rate, message } = req.body;
  
        const service_request = await RequestModel.findOne({ where: { uuid: request_id, status:'completed' } });
        if (!service_request) {
          throw new AppError(StatusCodes.NOT_FOUND, "Service request not found");
        }
    
        const existingRating = await RatingModel.findOne({
          where: { customer_id: userId, request_id: request_id  },
        });
  
        if (existingRating && existingRating.customer_message == null) {
          existingRating.customer_message = message
        }
        else if(existingRating?.customer_message != null){
          throw new AppError(StatusCodes.BAD_REQUEST, "You have already rated this request for this service");
        }

        
        const newRating = await RatingModel.create({
          customer_id: userId,
          provider_id: service_request.provider_id,
          request_id: request_id,
          customer_rating: rate,
          customer_message: message,
        });
  
        return newRating.toJSON();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? "An error occurred while rating the provider");
      }
    }

    async providerRateServiceRequest(req: RequestWithUser) {
      try {

        const userId = req.user?.userId        
        if (!userId) {
          throw new AppError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
        }

        const request_id = req.params.id;
        const { rate, message } = req.body;
  
        const service_request = await RequestModel.findOne({ where: { uuid: request_id, status:'completed' } });
        if (!service_request) {
          throw new AppError(StatusCodes.NOT_FOUND, "Service request not found");
        }
    
        const existingRating = await RatingModel.findOne({
          where: { provider_id: userId, request_id: request_id  },
        });
  
        if (existingRating && existingRating.provider_message == null) {
          existingRating.provider_message = message
        }
        else if(existingRating?.provider_message != null){
          throw new AppError(StatusCodes.BAD_REQUEST, "You have already rated this request for this service");
        }

        
        const newRating = await RatingModel.create({
          customer_id: userId,
          provider_id: service_request.provider_id,
          request_id: request_id,
          provider_rating: rate,
          provider_message: message,
        });
  
        return newRating.toJSON();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error.message ?? "An error occurred while rating the provider");
      }
    }

    async calculateRatingCustomer(userId: string) {
      try {
        const ratings = await RatingModel.findAll({
          where: { provider_id: userId },
          attributes: ["customer_rating"],
        });
  
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.customer_rating, 0);
        const averageRating = sumOfRatings / totalRatings;
        
        const rating = {
          total_rating: totalRatings ?? 0,
          average_rating: parseFloat(averageRating.toFixed(1)) || 0.0,
        }
        return rating;
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          StatusCodes.SERVICE_UNAVAILABLE,
          error.message ?? "An error occurred while calculating ratings"
        );
      }
    }

    async calculateRatingProvider(userId: string) {
      try {
        const ratings = await RatingModel.findAll({
          where: { provider_id: userId },
          attributes: ["provider_rating"],
        });
  
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.provider_rating, 0);
        const averageRating = sumOfRatings / totalRatings;
        
        const rating = {
          total_rating: totalRatings ?? 0,
          average_rating: parseFloat(averageRating.toFixed(1)) || 0.0,
        }
        return rating;
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          StatusCodes.SERVICE_UNAVAILABLE,
          error.message ?? "An error occurred while calculating ratings"
        );
      }
    }

    async fetchRequestCustomerRatings(request_id: string) {
      try {
        const ratings = await RatingModel.findAll({
          where: { request_id: request_id },
          attributes: ["rate"],
        });
  
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.customer_rating, 0);
        const averageRating = sumOfRatings / totalRatings;
        
        const rating = {
          total_rating: totalRatings ?? 0,
          average_rating: parseFloat(averageRating.toFixed(1)) || 0.0,
        }
        return rating;
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          StatusCodes.SERVICE_UNAVAILABLE,
          error.message ?? "An error occurred while calculating ratings"
        );
      }
    }

    async fetchRequestProviderRatings(request_id: string) {
      try {
        const ratings = await RatingModel.findAll({
          where: { request_id: request_id },
          attributes: ["rate"],
        });
  
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.provider_rating, 0);
        const averageRating = sumOfRatings / totalRatings;
        
        const rating = {
          total_rating: totalRatings ?? 0,
          average_rating: parseFloat(averageRating.toFixed(1)) || 0.0,
        }
        return rating;
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          StatusCodes.SERVICE_UNAVAILABLE,
          error.message ?? "An error occurred while calculating ratings"
        );
      }
    }

    async fetchRating(request_id: string) {
      try {
        const ratings = await RatingModel.findOne({
          where: { request_id: request_id },
          attributes: ["rate"],
        });
  
        return ratings?.toJSON();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          StatusCodes.SERVICE_UNAVAILABLE,
          error.message ?? "An error occurred while calculating ratings"
        );
      }
    }
}
