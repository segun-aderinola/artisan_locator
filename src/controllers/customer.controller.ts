import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import moment from "moment";
import { inject, injectable } from "tsyringe";
import { CustomerService } from "../service/customer-service";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import Utility from "../utils";
import CustomerModel from "../models/customer";
import { CustomerOnboardingStep, TokenStatus, TokenType, UserType } from "../enum";
import TokenModel from "../models/token";
import TemporaryUserModel from "../models/temporary-user";
import logger from "../utils/logger";
import S3Service from "../service/s3-service";
import { Op, Transaction } from "sequelize";
import sequelize from "../database";
import { on } from "events";
import { log } from "console";
import { RequestWithUser } from "../types/requestWithUser";
import { RatingService } from "../service/rating.service";

@injectable()
export class CustomerController {

  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
    @inject(RatingService) private readonly ratingService: RatingService,
  ) {}

  public registerPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;

      const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

      const existingCustomer = await CustomerModel.findOne({ where: { phone: formattedPhoneNumber } });
      if (existingCustomer) {
        return ApiResponse.handleError(res, "Phone number is already registered.", StatusCodes.BAD_REQUEST);
      }

      const userId = uuidv4();

      const tempUser = await TemporaryUserModel.create({
        phone_number: formattedPhoneNumber,
        uuid: userId,
        user_type: UserType.CUSTOMER,
        onboarding_step: CustomerOnboardingStep.REGISTER_PHONE,
      });

      const existingToken = await TokenModel.findOne({
        where: {
          user_id: userId,
          type: TokenType.PHONE_VERIFICATION,
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

      const verificationCode = Utility.generateNumericCode(4);

      const token = await TokenModel.create({
        uuid: uuidv4(),
        user_id: userId,
        key: formattedPhoneNumber,
        code: verificationCode,
        type: TokenType.PHONE_VERIFICATION,
        status: TokenStatus.NOT_USED,
        expired_at: moment().add(5, "minutes").toDate(),
      });

      // delete user.password;
      const safeUser: Partial<typeof tempUser> = tempUser;
      delete safeUser.password;

      ApiResponse.handleSuccess(res, "Verification code sent successfully", { user: safeUser, token: token.code }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      logger.log({ level: 'error', message: JSON.stringify(error) });
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public verifyPhone = async (req: Request, res: Response): Promise<void> => {
    const t: Transaction = await sequelize.transaction();
    try {
      const { user_id, phone, code } = req.body;
  
      const existingCustomer = await CustomerModel.findOne({ where: { uuid: user_id } });
      if (existingCustomer) {
        return ApiResponse.handleError(res, "You are already registered.", StatusCodes.BAD_REQUEST);
      }
  
      const formattedPhoneNumber = Utility.formatPhoneNumber(phone);
  
      const tempUser = await TemporaryUserModel.findOne({
        where: { uuid: user_id },
        transaction: t,
      });
  
      if (!tempUser) {
        return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
      }

      if (tempUser.phone_number !== formattedPhoneNumber) {
        return ApiResponse.handleError(res, "Invalid phone number.", StatusCodes.BAD_REQUEST); 
      }
  
      const token = await TokenModel.findOne({
        where: {
          code,
          key: formattedPhoneNumber,
          type: TokenType.PHONE_VERIFICATION,
          status: TokenStatus.NOT_USED,
        },
        transaction: t,
      });
  
      if (!token) {
        return ApiResponse.handleError(res, "Invalid or expired verification code.", StatusCodes.BAD_REQUEST);
      }
  
      if (moment(token.expired_at).isBefore(moment())) {
        await token.update({ status: TokenStatus.EXPIRED }, { transaction: t });
        return ApiResponse.handleError(res, "Verification code has expired.", StatusCodes.BAD_REQUEST);
      }
  
      await token.update({ status: TokenStatus.USED }, { transaction: t });
  
      // Update tempUser using the transaction
      await tempUser.update(
        {
          onboarding_step: CustomerOnboardingStep.VERIFY_PHONE,
          phone_verified_at: moment().toDate(),
        },
        { transaction: t }
      );
  
      await t.commit();
      return ApiResponse.handleSuccess(res, "Phone number successfully verified!", {}, StatusCodes.OK);
    } catch (error) {
      await t.rollback();
      console.error(error);
      return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  // public verifyPhone = async (req: Request, res: Response): Promise<void> => {
  //   const t: Transaction = await sequelize.transaction();
  //   try {
  //     const { user_id, phone, code } = req.body;

  //     const existingCustomer = await CustomerModel.findOne({ where: { uuid: user_id } });
  //     if (existingCustomer) {
  //       return ApiResponse.handleError(res, "You are already registered.", StatusCodes.BAD_REQUEST);
  //     }

  //     const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

  //     const tempUser = await TemporaryUserModel.findOne({
  //       where: { uuid: user_id, phone_number: formattedPhoneNumber },
  //       transaction: t, // Pass transaction object to ensure it uses the transaction
  //     });

  //     if (!tempUser) {
  //       return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
  //     }

  //     const token = await TokenModel.findOne({
  //       where: {
  //         code,
  //         key: formattedPhoneNumber,
  //         type: TokenType.PHONE_VERIFICATION,
  //         status: TokenStatus.NOT_USED,
  //       },
  //       transaction: t,
  //     });

  //     if (!token) {
  //       return ApiResponse.handleError(res, "Invalid or expired verification code.", StatusCodes.BAD_REQUEST);
  //     }

  //     if (moment(token.expired_at).isBefore(moment())) {
  //       await token.update({ status: TokenStatus.EXPIRED }, { transaction: t });
  //       return ApiResponse.handleError(res, "Verification code has expired.", StatusCodes.BAD_REQUEST);
  //     }

  //     await token.update({ status: TokenStatus.USED }, { transaction: t });
  //     tempUser.onboarding_step = CustomerOnboardingStep.VERIFY_PHONE;
  //     tempUser.phone_verified_at = moment().toDate();
  //     tempUser.save({ transaction: t });

  //     await t.commit();
  //     ApiResponse.handleSuccess(res, "Phone number successfully verified!", {}, StatusCodes.OK);
  //   } catch (error) {
  //     await t.rollback();
  //     console.error(error);
  //     ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
  //   }
  // };

  public resendToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, phone, email, type } = req.body;
      let key = "";
      let existingCustomer = null;

      if (type === TokenType.EMAIL_VERIFICATION) {
        // Handle email verification logic
        key = email;

        existingCustomer = await CustomerModel.findOne({ where: { email, uuid: user_id } });
        if (!existingCustomer) {
          existingCustomer = await TemporaryUserModel.findOne({ where: { email, uuid: user_id } });
          if (!existingCustomer) {
            return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
          }
        }

        await TokenModel.update(
          { status: TokenStatus.EXPIRED },
          { where: {
            user_id,
            key,
            type,
            status: TokenStatus.NOT_USED,
          }}
        );
      } else if (type === TokenType.PHONE_VERIFICATION) {
        // Handle phone verification logic
        const formattedPhoneNumber = Utility.formatPhoneNumber(phone);
        key = formattedPhoneNumber;

        existingCustomer = await CustomerModel.findOne({ where: { phone: formattedPhoneNumber, uuid: user_id } });
        if (!existingCustomer) {
          existingCustomer = await TemporaryUserModel.findOne({ where: { phone_number: formattedPhoneNumber, uuid: user_id } });
          if (!existingCustomer) {
            return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
          }
        }

        await TokenModel.update(
          { status: TokenStatus.EXPIRED },
          { where: {
            user_id,
            key,
            type,
            status: TokenStatus.NOT_USED,
          }}
        );
      }

      const verificationCode = Utility.generateNumericCode(4);

      const token = await TokenModel.create({
        uuid: uuidv4(),
        user_id: user_id,
        key,
        code: verificationCode,
        type,
        status: TokenStatus.NOT_USED,
        expired_at: moment().add(5, "minutes").toDate(),
      });

      ApiResponse.handleSuccess(res, "Verification code sent successfully", { token }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public registerCustomerInfo = async (req: Request, res: Response): Promise<void> => {
    let transaction: Transaction | null = null;
  
    try {
      const { user_id, firstname, lastname, email, gender, location } = req.body;
  
      // Start a transaction
      transaction = await sequelize.transaction();
  
      // Check if the customer already exists
      const customer = await CustomerModel.findOne({
        where: {
          [Op.or]: [
            { uuid: user_id }, // Match by uuid
            { email }, // Match by email
          ],
        },
        transaction, // Pass the transaction to the query
      });
  
      if (customer) {
        return ApiResponse.handleError(res, "This account has already registered", StatusCodes.NOT_FOUND);
      }
  
      // Find the temporary user
      const tempUser = await TemporaryUserModel.findOne({
        where: { uuid: user_id },
        transaction, // Pass the transaction to the query
      });
  
      if (!tempUser) {
        return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
      }
  
      // Update the temporary user's information
      const updatedCustomer = await tempUser.update(
        {
          first_name: firstname,
          last_name: lastname,
          email,
          gender,
          address: location,
          onboarding_step: CustomerOnboardingStep.REGISTER_CUSTOMER_INFO,
        },
        { transaction } // Pass the transaction to the update
      );
  
      // Find and update any existing email verification token
      const existingToken = await TokenModel.findOne({
        where: {
          user_id,
          type: TokenType.EMAIL_VERIFICATION,
          status: TokenStatus.NOT_USED,
        },
        transaction, // Pass the transaction to the query
      });
  
      if (existingToken) {
        if (moment(existingToken.expired_at).isBefore(moment())) {
          await existingToken.update({ status: TokenStatus.EXPIRED }, { transaction });
        } else {
          await existingToken.update({ status: TokenStatus.USED }, { transaction });
        }
      }
  
      // Generate a new verification code
      const verificationCode = Utility.generateNumericCode(4);
  
      // Create a new email verification token
      const token = await TokenModel.create(
        {
          uuid: uuidv4(),
          user_id,
          key: email,
          code: verificationCode,
          type: TokenType.EMAIL_VERIFICATION,
          status: TokenStatus.NOT_USED,
          expired_at: moment().add(5, "minutes").toDate(),
        },
        { transaction } // Pass the transaction to the create
      );
  
      // Commit the transaction
      await transaction.commit();
  
      // Send a success response
      ApiResponse.handleSuccess(
        res,
        "Customer information updated successfully. Verification code sent to email.",
        { token },
        StatusCodes.OK
      );
    } catch (error) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();
  
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    let transaction: Transaction | null = null;
  
    try {
      const { user_id, email, code } = req.body;
  
      // Start a transaction
      transaction = await sequelize.transaction();
  
      // Check if the user is already registered
      const existingCustomer = await CustomerModel.findOne({
        where: {
          [Op.or]: [
            { uuid: user_id }, // Match by uuid
            { email }, // Match by email
          ],
        },
        transaction,
      });
  
      if (existingCustomer) {
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "You are already registered.", StatusCodes.BAD_REQUEST);
      }
  
      // Find the temporary user
      const tempUser = await TemporaryUserModel.findOne({
        where: { uuid: user_id, email },
        transaction,
      });
  
      if (!tempUser) {
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
      }
  
      // Find the verification token
      const token = await TokenModel.findOne({
        where: {
          code,
          key: email,
          type: TokenType.EMAIL_VERIFICATION,
          status: TokenStatus.NOT_USED,
        },
        transaction,
      });
  
      if (!token) {
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "Invalid or expired verification code.", StatusCodes.BAD_REQUEST);
      }
  
      // Check if the token has expired
      if (moment(token.expired_at).isBefore(moment())) {
        await token.update({ status: TokenStatus.EXPIRED }, { transaction });
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "Verification code has expired.", StatusCodes.BAD_REQUEST);
      }
  
      // Mark the token as used
      await token.update({ status: TokenStatus.USED }, { transaction });
  
      // Update the temporary user's onboarding step and verification timestamp
      tempUser.onboarding_step = CustomerOnboardingStep.VERIFY_EMAIL;
      tempUser.email_verified_at = moment().toDate();
      await tempUser.save({ transaction });
  
      // Commit the transaction
      await transaction.commit();
  
      // Return success response
      ApiResponse.handleSuccess(res, "Email verified successfully.", {}, StatusCodes.OK);
    } catch (error) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();
  
      // Log the error for debugging
      console.error("Error verifying email:", error);
  
      // Return a generic error response
      ApiResponse.handleError(res, "An error occurred while verifying your email.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public setPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return ApiResponse.handleError(res, "Passwords do not match.", StatusCodes.BAD_REQUEST);
      }

      // Check if the user is already registered
      const existingCustomer = await CustomerModel.findOne({
        where: { uuid: user_id },
      });
  
      if (existingCustomer) {
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "You are already registered.", StatusCodes.BAD_REQUEST);
      }
  
      // Find the temporary user
      const tempUser = await TemporaryUserModel.findOne({
        where: { uuid: user_id },
      });
  
      if (!tempUser) {
        // await transaction.rollback(); // Rollback before returning
        return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      await tempUser.update({
        password: hashedPassword,
        onboarding_step: CustomerOnboardingStep.SET_PASSWORD,
      });

      ApiResponse.handleSuccess(res, "Password created successfully.", {}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public uploadFacialVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.body;

      // Check if the customer already exists
      const customer = await CustomerModel.findOne({
        where: { uuid: user_id },
      });
  
      if (customer) {
        return ApiResponse.handleError(res, "This account has already registered", StatusCodes.NOT_FOUND);
      }
  
      // Find the temporary user
      const tempUser = await TemporaryUserModel.findOne({
        where: { uuid: user_id },
      });
  
      if (!tempUser) {
        return ApiResponse.handleError(res, "User not found.", StatusCodes.NOT_FOUND);
      }

      if (!req.file) {
        return ApiResponse.handleError(res, "File is required.", StatusCodes.BAD_REQUEST);
      }
      const fileUrl = await this.s3Service.uploadFile(req.file, user_id);

      await tempUser.update({
        face_capture_url: fileUrl,
        onboarding_step: CustomerOnboardingStep.FACIAL_VERIFICATION,
      });

      const registeredUser = await CustomerModel.create({
        uuid: tempUser.uuid,
        firstname: tempUser.first_name,
        lastname: tempUser.last_name,
        email: tempUser.email,
        phone: tempUser.phone_number,
        gender: tempUser.gender,
        location: tempUser.address,
        password: tempUser.password,
        facial_verification_url: tempUser.face_capture_url,
        email_verified_at: tempUser.email_verified_at,
        phone_verified_at: tempUser.phone_verified_at,
        flagged: true,
      });

      ApiResponse.handleSuccess(res, "File uploaded successfully", {}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };


  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await CustomerModel.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return ApiResponse.handleError(res, "Invalid login detail.", StatusCodes.NOT_FOUND);
      }
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return ApiResponse.handleError(res, "Invalid login detail.", StatusCodes.UNAUTHORIZED);
      }

      const token = JWT.sign(
        {
          userId: user.uuid,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          email: user.email,
          role: UserType.CUSTOMER,
        },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1h" }
      );

      // delete user.password;
      const safeUser: Partial<typeof user> = user;
      delete safeUser.password;
      const rating = await this.ratingService.calculateRatingCustomer(user.uuid)

      ApiResponse.handleSuccess(res, "Login successful", { token, user: safeUser, rating }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const customer = await CustomerModel.findOne({ where: { email } });
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

      ApiResponse.handleSuccess(res, "Password reset link sent", {}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const resetToken = await TokenModel.findOne({
        where: {
          code: token,
          type: TokenType.PASSWORD_RESET,
          status: TokenStatus.NOT_USED,
        },
      });

      if (!resetToken) {
        return ApiResponse.handleError(res, "Invalid or expired token", StatusCodes.BAD_REQUEST);
      }

      if (moment(resetToken.expired_at).isBefore(moment())) {
        await resetToken.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, "Token has expired", StatusCodes.BAD_REQUEST);
      }

      const customer = await CustomerModel.findOne({ where: { uuid: resetToken.user_id } });

      if (!customer) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await customer.update({
        password: hashedPassword,
      });

      await resetToken.update({ status: TokenStatus.USED });

      ApiResponse.handleSuccess(res, "Password successfully reset", {}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public getProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const user = await CustomerModel.findOne({ where: { uuid: userId } });

      if (!user) {
        return ApiResponse.handleError(res, "User not found", StatusCodes.NOT_FOUND);
      }

      const safeUser: Partial<typeof user> = user;
      delete safeUser.password;
      const rating = await this.ratingService.calculateRatingCustomer(user.uuid)

      ApiResponse.handleSuccess(res, "User profile retrieved", { user: safeUser, rating }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public changePassword = async (req: RequestWithUser, res: Response): Promise<void> => {
      try {
          const { old_password, new_password } = req.body;
          const userId = req.user?.userId
          const customer = await CustomerModel.findOne({ where: { uuid: userId } });

          if (!customer) {
              return ApiResponse.handleError(res, 'User not found', 404);
          }

          const isPasswordValid = bcrypt.compareSync(old_password, customer.password);

          if (!isPasswordValid) {
              return ApiResponse.handleError(res, 'Old Password is incorrect', StatusCodes.BAD_REQUEST);
          }
          const hashedPassword = bcrypt.hashSync(new_password, 10);

          await customer.update({ password: hashedPassword });

          ApiResponse.handleSuccess(res, 'Password changed successfully', {}, 200);
      } catch (error) {
          console.error(error);
          ApiResponse.handleError(res, (error as Error).message, 500);
      }
  };
}
