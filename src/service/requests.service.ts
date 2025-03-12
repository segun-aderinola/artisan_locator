import { autoInjectable, inject } from 'tsyringe';
import { RequestWithUser } from '../types/requestWithUser';
import RequestModel from '../models/request';
import { IRequest } from '../interfaces/requests';
import { ServicesService } from './services.service';
import AppError from '../utils/error-log.utils';
import { StatusCodes } from 'http-status-codes';
import { RatingService } from './rating.service';
import MailService from './email.service';
import CustomerModel from '../models/customer';
import ServiceProviderModel from '../models/service-provider';

@autoInjectable()
export class RequestService {
    constructor(
        @inject(ServicesService) private readonly servicesService: ServicesService,
        @inject(RatingService) private readonly ratingService: RatingService,
        @inject(MailService) private readonly mailService: MailService,
    ) {}
    async request(req: RequestWithUser) {
        try {
            const user_id = String(req.user?.userId);
            const service_id = req.params.id;
            if(!service_id) throw new AppError(StatusCodes.BAD_REQUEST, 'Params Service ID is required')
            const requestBody: IRequest = req.body;
            const service = await this.servicesService.getServiceById(service_id);

            const request = await RequestModel.create({
                provider_id: service.provider_id,
                customer_id: user_id,
                service_id: service_id,
                location: requestBody.location,
                latitude: requestBody.latitude,
                longitude: requestBody.longitude,
                deadline: requestBody.deadline,
                message: requestBody.message,
            });
            const provider = await ServiceProviderModel.findOne({ where: { uuid: request.provider_id } })
            const customer = await ServiceProviderModel.findOne({ where: { uuid: request.provider_id } })
            await this.mailService.requestCreationMail({
              name: provider?.firstname+ " "+provider?.lastname,
              email: provider?.email,
              subject: `New Request ${request.uuid} Received 😍!`,
              message: `A new request has been received from ${customer?.firstname} ${customer?.lastname} for your service ${service.name}. Kindly login to your account for more details`
            })

            return request.toJSON();
        } catch (error: any) {
          console.log(error)
            if (error instanceof AppError) throw error;
            throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, 'Error occured'+ error.message);
        }
    }

    async fetchRequestDetail(req: RequestWithUser) {
        const request = await RequestModel.findOne({
            where: {
              uuid: req.params.id,
            },
        });
        if (!request) throw new AppError(StatusCodes.BAD_REQUEST, 'Request not found');
        return request.toJSON();
    }

    async acceptRequest(req: RequestWithUser) {
      try {
          const provider_id = String(req.user?.userId);
          const request_id = req.params.id;

          const request = await RequestModel.findOne({
            where: { uuid: request_id },
          });

          if (!request) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Request not found');
          }

          if (request.provider_id !== provider_id) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to accept this request');
          }

          if (request.status === 'ongoing') {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Request has already been accepted');
          }

          const customer = await CustomerModel.findOne({ where: { uuid: request.customer_id } })
          const service = await this.servicesService.getServiceById(request.service_id)
          request.status = 'accepted';
          await request.save();

          // send mail
          await this.mailService.acceptedRequestMail({
            name: customer?.firstname+ " "+customer?.lastname,
            email: customer?.email,
            subject: `Request ${request.uuid} Accepted 😁✅!`,
            message: `Your request for this service ${service.name} has been accepted by the provider. Kindly login to your account for more details`
          })
          return request.toJSON();
      } catch (error) {
          console.log(error)
          if (error instanceof AppError) throw error;
          throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, 'Error occurred while accepting the request');
      }
    }

    async declineRequest(req: RequestWithUser) {
      try {
          const provider_id = String(req.user?.userId);
          const request_id = req.params.id;

          const request = await RequestModel.findOne({
            where: { uuid: request_id },
          });

          if (!request) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Request not found');
          }

          if (request.provider_id !== provider_id) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to decline this request');
          }

          if (request.status === 'accepted') {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Request has already been accepted and cannot be declined');
          }
          if (request.status === 'declined') {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Request has already been declined');
          }
          request.status = 'declined';
          await request.save();

          const customer = await CustomerModel.findOne({ where: { uuid: request.customer_id } })
          const service = await this.servicesService.getServiceById(request.service_id)

          await this.mailService.rejectedRequestMail({
            name: customer?.firstname+ " "+customer?.lastname,
            email: customer?.email,
            subject: `Request ${request.uuid} Declined 😔❌!`,
            message: `Your request for this service ${service.name} has been declined by the provider. Kindly login to your account for more details`
          })
          return request.toJSON();
      } catch (error) {
          if (error instanceof AppError) throw error;
          throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, 'Error occurred while declining the request');
      }
    }

    async fetchAllCompletedRequestsByProvider(req: RequestWithUser) {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = Number(req.query.pageSize) || 10;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await RequestModel.findAndCountAll({
            where: {
                provider_id: req?.user?.userId,
                status: 'completed',
            },
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']],
        });
        const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
          const rating = await this.ratingService.fetchRating(request.uuid);
      
          const customer = await CustomerModel.findOne({ 
              where: { uuid: request.customer_id } 
          });
          return {
              ...request.toJSON(),
              rating: rating ?? '',
              customer: {
                name: customer ? `${customer.firstname} ${customer.lastname}` : "Unknown Customer",
                image: customer?.facial_verification_url ?? "",
                email: customer?.email,
                location: customer?.location
              }
          };
        }))

        return {
            requests: requestsWithCustomers,
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
                pageSize: pageSize,
            },
        };
    }

    async fetchAllOngoingRequestsByProvider(req: RequestWithUser) {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = Number(req.query.pageSize) || 10;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await RequestModel.findAndCountAll({
            where: {
                provider_id: req?.user?.userId,
                status: 'ongoing',
            },
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']],
        });
        const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
     
          const customer = await CustomerModel.findOne({ 
              where: { uuid: request.customer_id } 
          });
          return {
              ...request.toJSON(),
              customer: {
                name: customer ? `${customer.firstname} ${customer.lastname}` : "Unknown Customer",
                image: customer?.facial_verification_url ?? "",
                email: customer?.email,
                location: customer?.location
              }
          };
        }))

        return {
            requests: requestsWithCustomers,
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
                pageSize: pageSize,
            },
        };
    }

    async fetchAllPendingRequestsByProvider(req: RequestWithUser) {
      const page: number = Number(req.query.page) || 1;
      const pageSize: number = Number(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;
      const { count, rows } = await RequestModel.findAndCountAll({
          where: {
              provider_id: req?.user?.userId,
              status: 'pending',
          },
          limit: pageSize,
          offset: offset,
          order: [['created_at', 'DESC']],
      });
      const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
    
        const customer = await CustomerModel.findOne({ 
            where: { uuid: request.customer_id } 
        });
        return {
            ...request.toJSON(),
            customer: {
              name: customer ? `${customer.firstname} ${customer.lastname}` : "Unknown Customer",
              image: customer?.facial_verification_url ?? "",
              email: customer?.email,
              location: customer?.location
            }
        };
      }))

      return {
          requests: requestsWithCustomers,
          pagination: {
              totalRecords: count,
              totalPages: Math.ceil(count / pageSize),
              currentPage: page,
              pageSize: pageSize,
          },
      };
    }

    async countCompletedRequestsByProvider(provider_id: string) {
        try {
            const { count, rows } = await RequestModel.findAndCountAll({ where: { provider_id, status: 'completed' } });
            return count;
        } catch (error) {}
    }

    async fetchAllCompletedRequestsByCustomer(req: RequestWithUser) {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = Number(req.query.pageSize) || 10;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await RequestModel.findAndCountAll({
            where: {
                customer_id: req?.user?.userId,
                status: 'completed',
            },
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']],
        });
        const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
          const rating = await this.ratingService.fetchRating(request.uuid);
          const service_provider = await ServiceProviderModel.findOne({ 
              where: { uuid: request.provider_id } 
          });
          return {
              ...request.toJSON(),
              rating: rating ?? '',
              provider: {
                name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
                image: service_provider?.business_logo ?? "",
                email: service_provider?.email,
                location: service_provider?.location
              }
          };
        }))

        return {
            requests: requestsWithCustomers,
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
                pageSize: pageSize,
            },
        };
    }

    async fetchAllPendingRequestsByCustomer(req: RequestWithUser) {
      const page: number = Number(req.query.page) || 1;
      const pageSize: number = Number(req.query.pageSize) || 10;
      console.log(req.user?.userId)
      const offset = (page - 1) * pageSize;
      const { count, rows } = await RequestModel.findAndCountAll({
          where: {
              customer_id: req?.user?.userId,
              status: 'pending',
          },
          limit: pageSize,
          offset: offset,
          order: [['created_at', 'DESC']],
      });
      const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
        const service_provider = await ServiceProviderModel.findOne({ 
            where: { uuid: request.provider_id } 
        });
        return {
            ...request.toJSON(),
            provider: {
              name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
              image: service_provider?.business_logo ?? "",
              email: service_provider?.email,
              location: service_provider?.location
            }
        };
      }))

      return {
          requests: requestsWithCustomers,
          pagination: {
              totalRecords: count,
              totalPages: Math.ceil(count / pageSize),
              currentPage: page,
              pageSize: pageSize,
          },
      };
    }

    async fetchAllOngoingRequestsByCustomer(req: RequestWithUser) {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = Number(req.query.pageSize) || 10;

        const offset = (page - 1) * pageSize;
        const { count, rows } = await RequestModel.findAndCountAll({
            where: {
                customer_id: req?.user?.userId,
                status: 'ongoing',
            },
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']],
        });

        const requestsWithCustomers = await Promise.all(rows.map(async (request) => {
          const service_provider = await ServiceProviderModel.findOne({ 
              where: { uuid: request.provider_id } 
          });
          return {
              ...request.toJSON(),
              provider: {
                name: service_provider ? `${service_provider.firstname} ${service_provider.lastname}` : "Unknown Provider",
                image: service_provider?.business_logo ?? "",
                email: service_provider?.email,
                location: service_provider?.location
              }
          };
        }))

        return {
            requests: requestsWithCustomers,
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
                pageSize: pageSize,
            },
        };
    }

    async countCompletedRequestsByCustomer(customer_id: string) {
        try {
            const { count, rows } = await RequestModel.findAndCountAll({ where: { customer_id, status: 'completed' } });
            return count;
        } catch (error) {}
    }
}
