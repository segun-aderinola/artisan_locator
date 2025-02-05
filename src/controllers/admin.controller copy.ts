import { Request, RequestHandler, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
// import { AccountStatus, EmailStatus, UserRoles } from "../interfaces/enum/user-enum";
// import { IUserCreationBody } from "../interfaces/user-interface";
// import UserService from "../services/user-service";
// import { ResponseCode } from "../interfaces/enum/code-enum";
// import TokenService from "../services/token-service";
// import { IToken } from "../interfaces/token-interface";
// import EmailService from "../services/email-service"
import moment from "moment";
import { autoInjectable } from "tsyringe";
// import Permissions from "../permission";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import Utility from "../utils";
import { TokenStatus, TokenType } from "../enum";
import TokenModel from "../models/token";
import ServiceProviderModel from "../models/service-provider";
import CustomerModel from "../models/customer";

// @autoInjectable()
// class AuthController {
export const AdminController = {
  // private customerService: CustomerService;
  // private tokenService: TokenService;

  // constructor(_customerService: CustomerService, _tokenService: TokenService) {
  //   this.customerService = _customerService;
  //   this.tokenService = _tokenService;
  // }


  login: async(req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Step 2: Find user by phone or email
      const user = await ServiceProviderModel.findOne({
        where: {
          email: email, // If email is provided, search by email
        },
      });
  
      if (!user) {
        return ApiResponse.handleError(res, 'Invalid login detail.', StatusCodes.NOT_FOUND);
      }
  
      // Step 3: Compare provided password with stored hashed password
      const isPasswordValid = bcrypt.compareSync(password, user.password!);
  
      if (!isPasswordValid) {
        ApiResponse.handleError(res, 'Invalid login detail.', StatusCodes.UNAUTHORIZED);
      }
  
      // Step 4: Generate JWT token
      const token = JWT.sign(
        {
          userId: user.uuid,
          role: "ADMIN", // Assuming the user is an admin
          email: user.email,
        },
        process.env.JWT_SECRET_KEY as string, // Secret key to sign the JWT token
        { expiresIn: '1h' } // Token expiration time
      );
  
      // Step 5: Send response with JWT token
      ApiResponse.handleSuccess(res, 'Login successful', { token }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  forgotPassword: async(req: Request, res: Response) => {
    try {
      const { email } = req.body;
  
      // 1. Check if the user exists in the database
      const customer = await ServiceProviderModel.findOne({ where: { email } });
      if (!customer) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }
  
      // 2. Check for existing unused password reset tokens and invalidate them
      const existingToken = await TokenModel.findOne({
        where: {
          user_id: customer.uuid,
          type: TokenType.PASSWORD_RESET,
          status: TokenStatus.NOT_USED,
        },
      });
  
      if (existingToken) {
        // If the token has expired, mark it as expired
        if (moment(existingToken.expired_at).isBefore(moment())) {
          await existingToken.update({
            status: TokenStatus.EXPIRED,
          });
        } else {
          // If the token is still valid, mark it as used
          await existingToken.update({
            status: TokenStatus.USED,
          });
        }
      }
  
      // 3. Generate a new password reset token
      const resetToken = Utility.generateHexToken();
      const tokenExpiry = moment().add(1, 'hour').toDate(); // Token expires in 1 hour
  
      // 4. Store the new reset token in the database (with expiration)
      await TokenModel.create({
        uuid: uuidv4(),
        user_id: customer.uuid,  // assuming uuid is the unique identifier
        key: customer.email!, // Assuming customer.email is non-null
        code: resetToken, // This could be the code to be sent or used, adjust accordingly
        type: TokenType.PASSWORD_RESET,
        status: TokenStatus.NOT_USED,
        expired_at: tokenExpiry,
      });
  
      // 5. Send the reset token to the user's email (or phone)
      const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
      const emailSubject = "Password Reset Request";
      const emailMessage = `To reset your password, click the link below:\n\n${resetLink}`;
      
      // Send email (uncomment when you have the actual email service implemented)
      // await sendEmail(customer.email, emailSubject, emailMessage);
      // const token = (await this.tokenService.createForgotPasswordToken(params.email)) as IToken;
      // await EmailService.sendForgotPasswordMail(params.email , token.code);
  
      // 6. Respond with success
      ApiResponse.handleSuccess(res, "Password reset link sent", {}, 200);
  
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, 500);
    }
  },

  resetPassword: async(req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
  
      // 1. Check if the token exists in the database
      const resetToken = await TokenModel.findOne({ where: { code: token, type: TokenType.PASSWORD_RESET, status: TokenStatus.NOT_USED } });
  
      if (!resetToken) {
        return ApiResponse.handleError(res, "Invalid or expired token", 400);
      }
  
      // 2. Check if the token has expired
      if (moment(resetToken.expired_at).isBefore(moment())) {
        // Mark token as expired
        await resetToken.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, "Token has expired", 400);
      }
  
      // 3. Find the user associated with the token
      const customer = await ServiceProviderModel.findOne({ where: { uuid: resetToken.user_id } });
  
      if (!customer) {
        return ApiResponse.handleError(res, "User not found", 404);
      }
  
      // 4. Hash the new password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
      // 5. Update the customer's password
      await customer.update({ password: hashedPassword });
  
      // 6. Mark the token as used
      await resetToken.update({ status: TokenStatus.USED });
  
      // 7. Respond with success
      return ApiResponse.handleSuccess(res, "Password successfully reset", {}, 200);
  
    } catch (error) {
      console.error(error);
      return ApiResponse.handleError(res, (error as Error).message, 500);
    }
  },

  // 1. Get all customers
  getAllCustomers: async(req: Request, res: Response) => {
    try {
      const customers = await CustomerModel.findAll();
      res.status(StatusCodes.OK).json({
        status: true,
        message: "Customers fetched successfully",
        data: customers,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "An error occurred while fetching customers",
      });
    }
  },

  // 2. Get a single customer details
  getCustomerDetails: async(req: Request, res: Response) => {
    try {
      const { id } = req.params; // Expect customer ID
      const customer = await CustomerModel.findOne({ where: { id } });

      if (!customer) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      res.status(StatusCodes.OK).json({
        status: true,
        message: "Customer details fetched successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "An error occurred while fetching customer details",
      });
    }
  },

  // 3. Get all service providers
  getAllServiceProviders: async(req: Request, res: Response) => {
    try {
      const serviceProviders = await ServiceProviderModel.findAll();
      res.status(StatusCodes.OK).json({
        status: true,
        message: "Service providers fetched successfully",
        data: serviceProviders,
      });
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "An error occurred while fetching service providers",
      });
    }
  },

  // 4. Get a single service provider details
  getServiceProviderDetails: async(req: Request, res: Response) => {
    try {
      const { id } = req.params; // Expect service provider ID
      const serviceProvider = await ServiceProviderModel.findOne({ where: { id } });

      if (!serviceProvider) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "Service provider not found",
        });
      }

      res.status(StatusCodes.OK).json({
        status: true,
        message: "Service provider details fetched successfully",
        data: serviceProvider,
      });
    } catch (error) {
      console.error("Error fetching service provider details:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "An error occurred while fetching service provider details",
      });
    }
  },

  // 5. Flag a service provider or customer
  flagUser: async(req: Request, res: Response) => {
    try {
      const { id, type } = req.body; // Expect ID and type ('customer' or 'service_provider')

      if (!id || !type) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "ID and type (customer or service_provider) are required",
        });
      }

      let user;
      if (type === "customer") {
        user = await CustomerModel.findOne({ where: { id } });
      } else if (type === "service_provider") {
        user = await ServiceProviderModel.findOne({ where: { id } });
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Invalid user type",
        });
      }

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      // await user.update({ flagged: true });

      res.status(StatusCodes.OK).json({
        status: true,
        message: `${type === "customer" ? "Customer" : "Service provider"} flagged successfully`,
      });
    } catch (error) {
      console.error("Error flagging user:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "An error occurred while flagging the user",
      });
    }
  }


}

// export default AuthController;
