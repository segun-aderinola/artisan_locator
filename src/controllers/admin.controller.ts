import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import Utility from "../utils";
import { TokenStatus, TokenType } from "../enum";
import TokenModel from "../models/token";
import ServiceProviderModel from "../models/service-provider";
import CustomerModel from "../models/customer";
import { injectable } from "tsyringe";


@injectable()
export class AdminController {
  
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await ServiceProviderModel.findOne({ where: { email } });
      if (!user) {
        return ApiResponse.handleError(res, "Invalid login detail.", StatusCodes.NOT_FOUND);
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password!);
      if (!isPasswordValid) {
        return ApiResponse.handleError(res, "Invalid login detail.", StatusCodes.UNAUTHORIZED);
      }

      const token = JWT.sign(
        { userId: user.uuid, role: "ADMIN", email: user.email },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1h" }
      );

      return ApiResponse.handleSuccess(res, 'Login successful', { token }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const customer = await ServiceProviderModel.findOne({ where: { email } });
      if (!customer) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }

      const existingToken = await TokenModel.findOne({
        where: {
          user_id: customer.uuid,
          type: TokenType.PASSWORD_RESET,
          status: TokenStatus.NOT_USED,
        },
      });

      if (existingToken) {
        if (moment(existingToken.expired_at).isBefore(moment())) {
          await existingToken.update({ status: TokenStatus.EXPIRED });
        } else {
          await existingToken.update({ status: TokenStatus.USED });
        }
      }

      const resetToken = Utility.generateHexToken();
      const tokenExpiry = moment().add(1, "hour").toDate();

      await TokenModel.create({
        uuid: uuidv4(),
        user_id: customer.uuid,
        key: customer.email!,
        code: resetToken,
        type: TokenType.PASSWORD_RESET,
        status: TokenStatus.NOT_USED,
        expired_at: tokenExpiry,
      });

      return ApiResponse.handleSuccess(res, "Password reset link sent", {}, 200);
    } catch (error) {
      console.error(error);
      return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const resetToken = await TokenModel.findOne({
        where: { code: token, type: TokenType.PASSWORD_RESET, status: TokenStatus.NOT_USED },
      });

      if (!resetToken) {
        return ApiResponse.handleError(res, "Invalid or expired token", StatusCodes.BAD_REQUEST);
      }

      if (moment(resetToken.expired_at).isBefore(moment())) {
        await resetToken.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, "Token has expired", StatusCodes.BAD_REQUEST);
      }

      const customer = await ServiceProviderModel.findOne({ where: { uuid: resetToken.user_id } });
      if (!customer) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await customer.update({ password: hashedPassword });
      await resetToken.update({ status: TokenStatus.USED });

      return ApiResponse.handleSuccess(res, "Password successfully reset", {}, 200);
    } catch (error) {
      console.error(error);
      return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  getAllCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const customers = await CustomerModel.findAll();
      return ApiResponse.handleSuccess(res, "Customers fetched successfully", customers, StatusCodes.OK);
    } catch (error) {
      console.error("Error fetching customers:", error);
      return ApiResponse.handleError(res, "An error occurred while fetching customers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.findOne({ where: { id } });

      if (!customer) {
        return ApiResponse.handleError(res, "Customer not found", StatusCodes.NOT_FOUND);
      }

      return ApiResponse.handleSuccess(res, "Customer details fetched successfully", customer, StatusCodes.OK);

    } catch (error) {
      console.error("Error fetching customer details:", error);
      return ApiResponse.handleError(res, "An error occurred while fetching customer details", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  getAllServiceProviders = async (_req: Request, res: Response): Promise<void> => {
    try {
      const serviceProviders = await ServiceProviderModel.findAll();
      return ApiResponse.handleSuccess(res, "Service providers fetched successfully", serviceProviders, StatusCodes.OK);

    } catch (error) {
      console.error("Error fetching service providers:", error);
      return ApiResponse.handleError(res, "An error occurred while fetching service providers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  getServiceProviderDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const serviceProvider = await ServiceProviderModel.findOne({ where: { id } });

      if (!serviceProvider) {
        return ApiResponse.handleError(res, "Service provider not found", StatusCodes.NOT_FOUND);
      }

      return ApiResponse.handleSuccess(res, "Service provider details fetched successfully", serviceProvider, StatusCodes.OK);

    } catch (error) {
      console.error("Error fetching service provider details:", error);
      return ApiResponse.handleError(res, "An error occurred while fetching service provider details", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  flagUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, type } = req.body;

      if (!id || !type) {
        return ApiResponse.handleError(res, "ID and type (customer or service_provider) are required", StatusCodes.BAD_REQUEST);
      }

      let user;
      if (type === "customer") {
        user = await CustomerModel.findOne({ where: { id } });
      } else if (type === "service_provider") {
        user = await ServiceProviderModel.findOne({ where: { id } });
      } else {
        return ApiResponse.handleError(res, "Invalid user type", StatusCodes.BAD_REQUEST);
      }

      if (!user) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }

      return ApiResponse.handleSuccess(res, `${type === "customer" ? "Customer" : "Service provider"} flagged successfully`, {}, StatusCodes.OK);

    } catch (error) {
      console.error("Error flagging user:", error);
      return ApiResponse.handleError(res, "An error occurred while flagging the user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
}
