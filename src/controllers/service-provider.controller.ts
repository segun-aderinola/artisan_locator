import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import moment from "moment";
import { inject, injectable } from "tsyringe";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import Utility from "../utils";
import { ServiceProviderOnboardingStep, TokenStatus, TokenType, UserType } from "../enum";
import TokenModel from "../models/token";
import ServiceProviderModel from "../models/service-provider";
import S3Service from "../service/s3-service";
import TemporaryUserModel from "../models/temporary-user";
import logger from "../utils/logger";

@injectable()
export class ServiceProviderController {

  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
  ) {}

  public registerPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;

      const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

      const existingServiceProvider = await ServiceProviderModel.findOne({ where: { phone: formattedPhoneNumber } });
      if (existingServiceProvider) {
        return ApiResponse.handleError(res, "Phone number is already registered.", StatusCodes.BAD_REQUEST);
      }

      const userId = uuidv4();

      const tempUser = await TemporaryUserModel.create({
        phone_number: formattedPhoneNumber,
        uuid: userId,
        user_type: UserType.SERVICE_PROVIDER,
        onboarding_step: ServiceProviderOnboardingStep.REGISTER_PHONE,
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

      return ApiResponse.handleSuccess(res, "Verification code sent successfully", { user: safeUser, token: token.code }, StatusCodes.CREATED);
    } catch (error) {
      console.error(error);
      logger.log({ level: 'error', message: JSON.stringify(error) });
      return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public verifyPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, code } = req.body;

      const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

      const serviceProvider = await ServiceProviderModel.findOne({ where: { phone: formattedPhoneNumber } });
      
      if (!serviceProvider) {
        return ApiResponse.handleError(res, 'User does not exist with this email.', StatusCodes.BAD_REQUEST);
      }

      const token = await TokenModel.findOne({
        where: {
          code,
          key: formattedPhoneNumber,
          type: TokenType.PHONE_VERIFICATION,
          status: TokenStatus.NOT_USED,
        },
      });

      if (!token) {
        return ApiResponse.handleError(res, 'Invalid or expired verification code.', StatusCodes.BAD_REQUEST);
      }

      if (moment(token.expired_at).isBefore(moment())) {
        await token.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, 'Verification code has expired.', StatusCodes.BAD_REQUEST);
      }

      await token.update({ status: TokenStatus.USED });

      serviceProvider.phone_verified_at = moment().toDate() as any;
      await serviceProvider.save();

      ApiResponse.handleSuccess(res, 'Phone number successfully verified!', {}, StatusCodes.OK);

    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public registerServiceProviderInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { uuid, firstname, lastname, email, business_name, gender, location } = req.body;

      const serviceProvider = await ServiceProviderModel.findOne({ where: { uuid } });

      if (!serviceProvider) {
        return ApiResponse.handleError(res, 'User not found.', StatusCodes.NOT_FOUND);
      }

      const updatedCustomer = await serviceProvider.update({
        firstname,
        lastname,
        business_name,
        email,
        gender,
        location,
      });

      const existingToken = await TokenModel.findOne({
        where: {
          user_id: uuid,
          type: TokenType.EMAIL_VERIFICATION,
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

      await TokenModel.create({
        uuid: uuidv4(),
        user_id: uuid,
        key: email,
        code: verificationCode,
        type: TokenType.EMAIL_VERIFICATION,
        status: TokenStatus.NOT_USED,
        expired_at: moment().add(10, 'minutes').toDate(),
      });

      ApiResponse.handleSuccess(
        res,
        'Customer information updated successfully. Verification code sent to email.',
        { customer: updatedCustomer },
        StatusCodes.OK,
      );

    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;

      const serviceProvider = await ServiceProviderModel.findOne({ where: { email } });
  
      if (!serviceProvider) {
        return ApiResponse.handleError(res, 'User does not exist with this email.', StatusCodes.BAD_REQUEST);
      }
  
      const token = await TokenModel.findOne({
        where: {
          code,
          key: email,
          type: TokenType.EMAIL_VERIFICATION,
          status: TokenStatus.NOT_USED,
        },
      });
  
      if (!token) {
        return ApiResponse.handleError(res, 'Invalid or expired verification token.', StatusCodes.BAD_REQUEST);
      }
  
      if (moment(token.expired_at).isBefore(moment())) {
        await token.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, 'Verification code has expired.', StatusCodes.BAD_REQUEST);
      }
  
      await token.update({ status: TokenStatus.USED });
  
      serviceProvider.email_verified_at = moment().toDate() as any;
      await serviceProvider.save();
      
  
      ApiResponse.handleSuccess(res, 'Email verified successfully.', {}, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public registerBusinessInfo = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, category_of_service, bio, brief_introduction } = req.body;

      if (!userId || !category_of_service) {
        return ApiResponse.handleError(res, 'User ID and category are required.', StatusCodes.BAD_REQUEST);
      }

      const serviceProvider = await ServiceProviderModel.findOne({ where: { uuid: userId } });
      
      if (!serviceProvider) {
        return ApiResponse.handleError(res, 'User does not exist with this email.', StatusCodes.BAD_REQUEST);
      }

      let logoUrl = null;

      try {
        if (req.file) {
          // TODO::REFACTOR THIS TO USE A SINGLE FILE UPLOAD
          logoUrl = await this.s3Service.uploadFile(req.file, "logos");
        }

        const business = await serviceProvider.update({
          uuid: userId,
          category_of_service,
          bio,
          brief_introduction,
          business_logo: logoUrl!,
        });

        ApiResponse.handleSuccess(res, "Business info created successfully", {}, StatusCodes.CREATED);

      } catch (error) {
        console.error("Error creating business:", error);
        return ApiResponse.handleError(res, 'An error occurred while creating the business info.', StatusCodes.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error("Error creating business:", error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public uploadVerificationDocuments = async (req: any, res: Response): Promise<void> => {
    try {
      const { userId, means_of_verification } = req.body;

      if (!userId || !means_of_verification) {
        ApiResponse.handleError(res, "User ID and means of verification are required.", StatusCodes.BAD_REQUEST);

      }

      const serviceProvider = await ServiceProviderModel.findOne({ where: { uuid: userId } });

      if (!serviceProvider) {
        return ApiResponse.handleError(res, "User does not exist.", StatusCodes.BAD_REQUEST);
      }

      let verificationFileUrl = null;
      let certificateFileUrl = null;

      try {
        if (req.files && Array.isArray(req.files)) {
          // const verificationFile = req.files.find((file) => file.fieldname === "means_of_verification_file");
          // const certificateFile = req.files.find((file) => file.fieldname === "certificate_of_expertise_file");

          // if (verificationFile) {
          //   verificationFileUrl = await s3Service.uploadFile(
          //     verificationFile,
          //     "verification"
          //   );
          // }

          // if (certificateFile) {
          //   certificateFileUrl = await s3Service.uploadFile(
          //     certificateFile,
          //     "certificates"
          //   );
          // }
        }

        // TODO::REFACTOR THIS TO USE A SINGLE FILE UPLOAD
        // if (verificationFileUrl && certificateFileUrl) {
        //   return ApiResponse.handleError(res, "Verification documents are required.", StatusCodes.BAD_REQUEST);
          
        // }

        // await serviceProvider.update({
        //   identification_type: means_of_verification,
        //   identification_doc_url: verificationFileUrl!,
        //   certificate_of_expertise_url: certificateFileUrl!,
        // });
        ApiResponse.handleSuccess(res, 'Verification documents uploaded successfully.', {}, StatusCodes.CREATED);

      } catch (error) {
        console.error("Error uploading files:", error);
        ApiResponse.handleError(res, "An error occurred while uploading files.", StatusCodes.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public setPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return ApiResponse.handleError(res, 'Passwords do not match.', StatusCodes.BAD_REQUEST);
      }
  
      const customer = await ServiceProviderModel.findOne({ where: { uuid: userId } });
  
      if (!customer) {
        return ApiResponse.handleError(res, 'Customer not found.', StatusCodes.NOT_FOUND);
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      await customer.update({ password: hashedPassword });
  
      ApiResponse.handleSuccess(res, 'Password set successfully.', {}, StatusCodes.OK);
      
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await ServiceProviderModel.findOne({ where: { email } });
  
      if (!user) {
        return ApiResponse.handleError(res, 'Invalid login detail.', StatusCodes.NOT_FOUND);
      }
  
      const isPasswordValid = bcrypt.compareSync(password, user.password!);
  
      if (!isPasswordValid) {
        return ApiResponse.handleError(res, 'Invalid login detail.', StatusCodes.UNAUTHORIZED);
      }
  
      const token = JWT.sign(
        {
          userId: user.uuid,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '1h' }
      );
  
      ApiResponse.handleSuccess(res, 'Login successful', { token }, StatusCodes.OK);
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
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
      const tokenExpiry = moment().add(1, 'hour').toDate();
  
      await TokenModel.create({
        uuid: uuidv4(),
        user_id: customer.uuid,
        key: customer.email!,
        code: resetToken,
        type: TokenType.PASSWORD_RESET,
        status: TokenStatus.NOT_USED,
        expired_at: tokenExpiry,
      });
  
      const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
      const emailSubject = "Password Reset Request";
      const emailMessage = `To reset your password, click the link below:\n\n${resetLink}`;
  
      ApiResponse.handleSuccess(res, "Password reset link sent", {}, 200);
  
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, 500);
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, new_password } = req.body;
  
      const resetToken = await TokenModel.findOne({ where: { code: token, type: TokenType.PASSWORD_RESET, status: TokenStatus.NOT_USED } });
  
      if (!resetToken) {
        return ApiResponse.handleError(res, "Invalid or expired token", 400);
      }
  
      if (moment(resetToken.expired_at).isBefore(moment())) {
        await resetToken.update({ status: TokenStatus.EXPIRED });
        return ApiResponse.handleError(res, "Token has expired", 400);
      }
  
      const customer = await ServiceProviderModel.findOne({ where: { uuid: resetToken.user_id } });
  
      if (!customer) {
        return ApiResponse.handleError(res, "User not found", 404);
      }
  
      const hashedPassword = bcrypt.hashSync(new_password, 10);
  
      await customer.update({ password: hashedPassword });
  
      await resetToken.update({ status: TokenStatus.USED });
  
      ApiResponse.handleSuccess(res, "Password successfully reset", {}, 200);
  
    } catch (error) {
      console.error(error);
      ApiResponse.handleError(res, (error as Error).message, 500);
    }
  };
}
