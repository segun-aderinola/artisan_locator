import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import AuthValidationSchema, { validate } from '../validators/auth-validator.schema';
import { validator } from '../middleware/auth.middleware';
import { ServiceProviderController } from '../controllers/service-provider.controller';
import upload from '../middleware/upload.middleware';

const router = Router();

const serviceProviderController = container.resolve(ServiceProviderController);


  router.get('/register', async (req: Request, res: Response) => {
    // Test Routes
    res.status(200).json({ msg: 'user route found' });
  });

  
  // router.post('/register', validator(AuthValidationSchema.registerSchema), async (req: Request, res: Response) => {
  //   // After validation, call the controller function
  //   await authController.registerPhone(req, res);
  // });

  // router.post('/login', validator(AuthValidationSchema.loginSchema), async (req: Request, res: Response) => {
  //   // After validation, call the controller function
  //   await authController.login(req, res);
  // });

  // router.post('/forgot-password', validator(AuthValidationSchema.forgotPasswordSchema), async (req: Request, res: Response) => {
  //   // After validation, call the controller function
  //   await authController.forgotPassword(req, res);
  // });

  // router.post('/reset-password', validator(AuthValidationSchema.resetPasswordSchema), async (req: Request, res: Response) => {
  //   // After validation, call the controller function
  //   await authController.resetPassword(req, res);
  // });


// const upload = multer(); // Use multer for file uploads

// router.post(
//   "/business",
//   upload.single("logo"), // Handle single file upload with the field name 'logo'
//   BusinessController.createBusiness
// );


// Customer registration phone verification
router.post('/register-phone', serviceProviderController.registerPhone);

// Verify phone number with OTP
router.post('/verify-phone', serviceProviderController.verifyPhone);

// Customer information registration (after phone verification)
router.post('/register-user-info', serviceProviderController.registerServiceProviderInfo);

router.post('/register-business-info', upload.single("logo_or_passport"), serviceProviderController.registerBusinessInfo);

router.post('/upload-verification-docs', upload.single("file"), serviceProviderController.uploadVerificationDocuments);

// Email verification with OTP
router.post('/verify-email', serviceProviderController.verifyEmail);

// Set password after email verification
router.post('/set-password', serviceProviderController.setPassword);

// User login (email and password)
router.post('/login', serviceProviderController.login);

// Forgot password (send reset link)
router.post('/forgot-password', serviceProviderController.forgotPassword);

// Reset password with a valid token
router.post('/reset-password', serviceProviderController.resetPassword);

export default router;