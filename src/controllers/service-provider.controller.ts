import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import moment from 'moment';
import { inject, injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/api-response';
import Utility from '../utils';
import { ServiceProviderOnboardingStep, TokenStatus, TokenType, UserType } from '../enum';
import TokenModel from '../models/token';
import ServiceProviderModel from '../models/service-provider';
import S3Service from '../service/s3-service';
import TemporaryUserModel from '../models/temporary-user';
import logger from '../utils/logger';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';

@injectable()
export class ServiceProviderController {
    constructor(@inject(S3Service) private readonly s3Service: S3Service) {}

    public registerPhone = async (req: Request, res: Response): Promise<void> => {
        try {
            const { phone } = req.body;

            const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

            const existingServiceProvider = await ServiceProviderModel.findOne({
                where: { phone: formattedPhoneNumber },
            });
            if (existingServiceProvider) {
                return ApiResponse.handleError(res, 'Phone number is already registered.', StatusCodes.BAD_REQUEST);
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
                expired_at: moment().add(5, 'minutes').toDate(),
            });

            // delete user.password;
            const safeUser: Partial<typeof tempUser> = tempUser;
            delete safeUser.password;

            return ApiResponse.handleSuccess(
                res,
                'Verification code sent successfully',
                { user: safeUser, token: token.code },
                StatusCodes.CREATED
            );
        } catch (error) {
            console.error(error);
            logger.log({ level: 'error', message: JSON.stringify(error) });
            return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    public verifyPhone = async (req: Request, res: Response): Promise<void> => {
        const t: Transaction = await sequelize.transaction();
        try {
            const { user_id, phone, code } = req.body;

            const existingServiceProvider = await ServiceProviderModel.findOne({ where: { uuid: user_id } });
            if (existingServiceProvider) {
                return ApiResponse.handleError(res, 'You are already registered.', StatusCodes.BAD_REQUEST);
            }

            const formattedPhoneNumber = Utility.formatPhoneNumber(phone);

            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id },
                transaction: t,
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
            }

            if (tempServiceProvider.phone_number !== formattedPhoneNumber) {
                return ApiResponse.handleError(res, 'Invalid phone number.', StatusCodes.BAD_REQUEST);
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
                return ApiResponse.handleError(res, 'Invalid or expired verification code.', StatusCodes.BAD_REQUEST);
            }

            if (moment(token.expired_at).isBefore(moment())) {
                await token.update({ status: TokenStatus.EXPIRED }, { transaction: t });
                return ApiResponse.handleError(res, 'Verification code has expired.', StatusCodes.BAD_REQUEST);
            }

            await token.update({ status: TokenStatus.USED }, { transaction: t });

            // Update tempServiceProvider using the transaction
            await tempServiceProvider.update(
                {
                    onboarding_step: ServiceProviderOnboardingStep.VERIFY_PHONE,
                    phone_verified_at: moment().toDate(),
                },
                { transaction: t }
            );

            await t.commit();
            return ApiResponse.handleSuccess(res, 'Phone number successfully verified!', {}, StatusCodes.OK);
        } catch (error) {
            await t.rollback();
            console.error(error);
            return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    public resendToken = async (req: Request, res: Response): Promise<void> => {
        const t: Transaction = await sequelize.transaction();
        try {
            const { user_id, phone, email, type } = req.body;
            let key = '';
            let existingServiceProvider = null;

            if (type === TokenType.EMAIL_VERIFICATION) {
                // Handle email verification logic
                key = email;

                existingServiceProvider = await ServiceProviderModel.findOne({ where: { email, uuid: user_id } });
                if (!existingServiceProvider) {
                    existingServiceProvider = await TemporaryUserModel.findOne({ where: { email, uuid: user_id } });
                    if (!existingServiceProvider) {
                        return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
                    }
                }

                await TokenModel.update(
                    { status: TokenStatus.EXPIRED },
                    {
                        where: {
                            user_id,
                            key,
                            type,
                            status: TokenStatus.NOT_USED,
                        },
                        transaction: t,
                    }
                );
            } else if (type === TokenType.PHONE_VERIFICATION) {
                // Handle phone verification logic
                const formattedPhoneNumber = Utility.formatPhoneNumber(phone);
                key = formattedPhoneNumber;

                existingServiceProvider = await ServiceProviderModel.findOne({
                    where: { phone: formattedPhoneNumber, uuid: user_id },
                });
                if (!existingServiceProvider) {
                    existingServiceProvider = await TemporaryUserModel.findOne({
                        where: { phone: formattedPhoneNumber, uuid: user_id },
                    });
                    if (!existingServiceProvider) {
                        return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
                    }
                }

                await TokenModel.update(
                    { status: TokenStatus.EXPIRED },
                    {
                        where: {
                            user_id,
                            key,
                            type,
                            status: TokenStatus.NOT_USED,
                        },
                        transaction: t,
                    }
                );
            }

            const verificationCode = Utility.generateNumericCode(4);

            const token = await TokenModel.create(
                {
                    uuid: uuidv4(),
                    user_id: user_id,
                    key,
                    code: verificationCode,
                    type,
                    status: TokenStatus.NOT_USED,
                    expired_at: moment().add(5, 'minutes').toDate(),
                },
                { transaction: t }
            );

            await t.commit();
            return ApiResponse.handleSuccess(res, 'Verification code sent successfully', { token }, StatusCodes.OK);
        } catch (error) {
            await t.rollback();
            console.error(error);
            return ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    public registerServiceProviderInfo = async (req: Request, res: Response): Promise<void> => {
        let transaction: Transaction | null = null;
        try {
            const { user_id, firstname, lastname, email, business_name, gender, location } = req.body;

            // Start a transaction
            transaction = await sequelize.transaction();

            // Check if the service provider already exists
            const serviceProvider = await ServiceProviderModel.findOne({
                where: {
                    [Op.or]: [
                        { uuid: user_id }, // Match by uuid
                        { email }, // Match by email
                    ],
                },
                transaction, // Pass the transaction to the query
            });

            if (serviceProvider) {
                return ApiResponse.handleError(res, 'This account has already registered', StatusCodes.BAD_REQUEST);
            }

            // Find the temporary service provider
            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id },
                transaction, // Pass the transaction to the query
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
            }

            const updatedServiceProvider = await tempServiceProvider.update({
                first_name: firstname,
                last_name: lastname,
                email,
                business_name,
                gender,
                address: location,
                onboarding_step: ServiceProviderOnboardingStep.REGISTER_SERVICE_PROVIDER_INFO,
            });

            const existingToken = await TokenModel.findOne({
                where: {
                    user_id,
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

            // Create a new email verification token
            const token = await TokenModel.create(
                {
                    uuid: uuidv4(),
                    user_id,
                    key: email,
                    code: verificationCode,
                    type: TokenType.EMAIL_VERIFICATION,
                    status: TokenStatus.NOT_USED,
                    expired_at: moment().add(5, 'minutes').toDate(),
                },
                { transaction } // Pass the transaction to the create
            );

            // Commit the transaction
            await transaction.commit();

            // Send a success response
            ApiResponse.handleSuccess(
                res,
                'Service provider information updated successfully. Verification code sent to email.',
                { token },
                StatusCodes.OK
            );
        } catch (error) {
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

            // Check if the service provider is already registered
            const existingServiceProvider = await ServiceProviderModel.findOne({
                where: {
                    [Op.or]: [
                        { uuid: user_id }, // Match by uuid
                        { email }, // Match by email
                    ],
                },
                transaction,
            });

            if (existingServiceProvider) {
                return ApiResponse.handleError(res, 'You are already registered.', StatusCodes.BAD_REQUEST);
            }

            // Find the temporary service provider
            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id, email },
                transaction,
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
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
                return ApiResponse.handleError(res, 'Invalid or expired verification code.', StatusCodes.BAD_REQUEST);
            }

            // Check if the token has expired
            if (moment(token.expired_at).isBefore(moment())) {
                await token.update({ status: TokenStatus.EXPIRED }, { transaction });
                return ApiResponse.handleError(res, 'Verification code has expired.', StatusCodes.BAD_REQUEST);
            }

            // Mark the token as used
            await token.update({ status: TokenStatus.USED }, { transaction });

            // Update the temporary service provider's onboarding step and verification timestamp
            tempServiceProvider.onboarding_step = ServiceProviderOnboardingStep.VERIFY_EMAIL;
            tempServiceProvider.email_verified_at = moment().toDate();
            await tempServiceProvider.save({ transaction });

            // Commit the transaction
            await transaction.commit();

            // Return success response
            return ApiResponse.handleSuccess(res, 'Email verified successfully.', {}, StatusCodes.OK);
        } catch (error) {
            // Rollback the transaction in case of an error
            if (transaction) await transaction.rollback();

            // Log the error for debugging
            console.error('Error verifying email:', error);

            // Return a generic error response
            return ApiResponse.handleError(
                res,
                'An error occurred while verifying your email.',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    };

    public registerBusinessInfo = async (req: any, res: Response): Promise<void> => {
        let transaction: Transaction | null = null;

        try {
            const { user_id, category_of_service, bio, brief_introduction } = req.body;

            // Start a transaction
            transaction = await sequelize.transaction();

            // Check if the service provider is already registered
            const serviceProvider = await ServiceProviderModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (serviceProvider) {
                return ApiResponse.handleError(res, 'This account has already registered.', StatusCodes.BAD_REQUEST);
            }

            // Find the temporary service provider
            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
            }

            // Check if a file is provided
            if (!req.file) {
                return ApiResponse.handleError(res, 'Business logo file is required.', StatusCodes.BAD_REQUEST);
            }

            // Upload the file to S3
            let fileUrl: string;
            try {
                fileUrl = await this.s3Service.uploadFile(req.file, user_id);
            } catch (error) {
                console.error('Error uploading file to S3:', error);
                return ApiResponse.handleError(
                    res,
                    'Failed to upload business logo.',
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }

            // Update the temporary service provider's business information
            const updatedBusiness = await tempServiceProvider.update(
                {
                    category_of_service,
                    bio,
                    brief_introduction,
                    business_logo: fileUrl,
                    onboarding_step: ServiceProviderOnboardingStep.REGISTER_BUSINESS_INFO, // Update onboarding step
                },
                { transaction }
            );

            // Commit the transaction
            await transaction.commit();

            // Return success response with the updated business information
            ApiResponse.handleSuccess(
                res,
                'Business info created successfully.',
                {},
                // { business: updatedBusiness },
                StatusCodes.CREATED
            );
        } catch (error) {
            // Rollback the transaction in case of an error
            if (transaction) await transaction.rollback();

            console.error('Error creating business info:', error);
            ApiResponse.handleError(
                res,
                'An error occurred while creating the business info.',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    };

    public uploadVerificationDocuments = async (req: any, res: Response): Promise<void> => {
        let transaction: Transaction | null = null;

        try {
            const { user_id, means_of_verification } = req.body;

            // Start a transaction
            transaction = await sequelize.transaction();

            // Check if the service provider is already registered
            const serviceProvider = await ServiceProviderModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (serviceProvider) {
                return ApiResponse.handleError(res, 'This account has already registered.', StatusCodes.BAD_REQUEST);
            }

            // Find the temporary service provider
            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
            }

            // Check if files are provided
            if (!req.files || !req.files.means_of_verification_file || !req.files.certificate_of_expertise_file) {
                return ApiResponse.handleError(
                    res,
                    'Both verification documents are required.',
                    StatusCodes.BAD_REQUEST
                );
            }

            // Extract files from req.files
            const meansOfVerificationFile = req.files.means_of_verification_file[0];
            const certificateOfExpertiseFile = req.files.certificate_of_expertise_file[0];

            // Upload both files to S3 at the same time
            let fileUrls: string[];
            try {
                fileUrls = await this.s3Service.uploadMultipleFiles(
                    [meansOfVerificationFile, certificateOfExpertiseFile],
                    user_id
                );
            } catch (error) {
                console.error('Error uploading files to S3:', error);
                return ApiResponse.handleError(
                    res,
                    'Failed to upload verification documents.',
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }

            // Destructure the returned URLs
            const [meansOfVerificationUrl, certificateOfExpertiseUrl] = fileUrls;
            // Update the temporary service provider's verification documents
            const updatedServiceProvider = await tempServiceProvider.update(
                {
                    identification_type: means_of_verification,
                    identification_doc_url: meansOfVerificationUrl, // URL of the means of verification file
                    certificate_of_expertise_url: certificateOfExpertiseUrl, // URL of the certificate of expertise file
                    onboarding_step: ServiceProviderOnboardingStep.UPLOAD_VERIFICATION_DOCUMENTS, // Update onboarding step
                },
                { transaction }
            );

            // Commit the transaction
            await transaction.commit();

            // Return success response with the updated service provider information
            ApiResponse.handleSuccess(
                res,
                'Verification documents uploaded successfully.',
                { serviceProvider: updatedServiceProvider },
                StatusCodes.CREATED
            );
        } catch (error) {
            console.error('Error processing request:', error);
            ApiResponse.handleError(res, (error as Error).message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    public setPassword = async (req: Request, res: Response): Promise<void> => {
        let transaction: Transaction | null = null;

        try {
            const { user_id, password, confirmPassword } = req.body;

            // Start a transaction
            transaction = await sequelize.transaction();

            // Check if passwords match
            if (password !== confirmPassword) {
                return ApiResponse.handleError(res, 'Passwords do not match.', StatusCodes.BAD_REQUEST);
            }

            // Check if the service provider is already registered
            const existingServiceProvider = await ServiceProviderModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (existingServiceProvider) {
                return ApiResponse.handleError(res, 'You are already registered.', StatusCodes.BAD_REQUEST);
            }

            // Find the temporary service provider
            const tempServiceProvider = await TemporaryUserModel.findOne({
                where: { uuid: user_id },
                transaction,
            });

            if (!tempServiceProvider) {
                return ApiResponse.handleError(res, 'Service provider not found.', StatusCodes.NOT_FOUND);
            }

            // Hash the password
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Update the temporary service provider's password and onboarding step
            await tempServiceProvider.update(
                {
                    password: hashedPassword,
                    onboarding_step: ServiceProviderOnboardingStep.SET_PASSWORD,
                },
                { transaction }
            );

            // Commit the transaction
            await transaction.commit();

            // Return success response
            return ApiResponse.handleSuccess(res, 'Password created successfully.', {}, StatusCodes.OK);
        } catch (error) {
            // Rollback the transaction in case of an error
            if (transaction) await transaction.rollback();

            // Log the error for debugging
            console.error('Error setting password:', error);

            // Return a generic error response
            return ApiResponse.handleError(
                res,
                'An error occurred while setting your password.',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Find the service provider by email
            const serviceProvider = await ServiceProviderModel.findOne({
                where: { email },
            });

            if (!serviceProvider) {
                return ApiResponse.handleError(res, 'Invalid login details.', StatusCodes.NOT_FOUND);
            }

            // Verify the password
            const isPasswordValid = bcrypt.compareSync(password, serviceProvider.password);

            if (!isPasswordValid) {
                return ApiResponse.handleError(res, 'Invalid login details.', StatusCodes.UNAUTHORIZED);
            }

            if (serviceProvider.flagged) {
                // if (serviceProvider.status === 'INACTIVE') {
                return ApiResponse.handleError(
                    res,
                    'Your account is inactive. Please contact support.',
                    StatusCodes.UNAUTHORIZED
                );
            }

            // Generate a JWT token
            const token = JWT.sign(
                {
                    userId: serviceProvider.uuid,
                    firstname: serviceProvider.firstname,
                    lastname: serviceProvider.lastname,
                    phone: serviceProvider.phone,
                    email: serviceProvider.email,
                    role: UserType.SERVICE_PROVIDER, // Use a role specific to service providers
                },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            // Remove sensitive data before sending the response
            const safeServiceProvider: Partial<typeof serviceProvider> = serviceProvider.toJSON();
            delete safeServiceProvider.password;

            // Return success response with token and user data
            ApiResponse.handleSuccess(res, 'Login successful', { token, user: safeServiceProvider }, StatusCodes.OK);
        } catch (error) {
            console.error('Error during login:', error);
            ApiResponse.handleError(res, 'An error occurred during login.', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    public forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            const customer = await ServiceProviderModel.findOne({ where: { email } });
            if (!customer) {
                return ApiResponse.handleError(res, 'User not found', StatusCodes.NOT_FOUND);
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
            const emailSubject = 'Password Reset Request';
            const emailMessage = `To reset your password, click the link below:\n\n${resetLink}`;

            ApiResponse.handleSuccess(res, 'Password reset link sent', {}, 200);
        } catch (error) {
            console.error(error);
            ApiResponse.handleError(res, (error as Error).message, 500);
        }
    };

    public resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, new_password } = req.body;

            const resetToken = await TokenModel.findOne({
                where: { code: token, type: TokenType.PASSWORD_RESET, status: TokenStatus.NOT_USED },
            });

            if (!resetToken) {
                return ApiResponse.handleError(res, 'Invalid or expired token', 400);
            }

            if (moment(resetToken.expired_at).isBefore(moment())) {
                await resetToken.update({ status: TokenStatus.EXPIRED });
                return ApiResponse.handleError(res, 'Token has expired', 400);
            }

            const customer = await ServiceProviderModel.findOne({ where: { uuid: resetToken.user_id } });

            if (!customer) {
                return ApiResponse.handleError(res, 'User not found', 404);
            }

            const hashedPassword = bcrypt.hashSync(new_password, 10);

            await customer.update({ password: hashedPassword });

            await resetToken.update({ status: TokenStatus.USED });

            ApiResponse.handleSuccess(res, 'Password successfully reset', {}, 200);
        } catch (error) {
            console.error(error);
            ApiResponse.handleError(res, (error as Error).message, 500);
        }
    };

    public getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;

            const serviceProvider = await ServiceProviderModel.findOne({ where: { uuid: userId } });

            if (!serviceProvider) {
                return ApiResponse.handleError(res, 'User not found', 404);
            }

            // TODO::REFACTOR THIS TO USE STATUS ENUM
            if (serviceProvider.flagged) {
                return ApiResponse.handleError(res, 'Your account is inactive. Please contact support.', 401);
            }

            const safeServiceProvider: Partial<typeof serviceProvider> = serviceProvider;
            delete safeServiceProvider.password;

            ApiResponse.handleSuccess(res, 'User found', { user: safeServiceProvider }, 200);
        } catch (error) {
            console.error(error);
            ApiResponse.handleError(res, (error as Error).message, 500);
        }
    };
}
