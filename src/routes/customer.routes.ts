import { Router } from 'express';
import { container } from 'tsyringe';
import { CustomerController } from '../controllers/customer.controller';
import upload from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { phoneNumberSchema } from '../validators/register-phone.schema';
import { verifyPhoneSchema } from '../validators/verify-phone.schema';
import { resendTokenSchema } from '../validators/resend-token.schema';
import { customerInfoSchema } from '../validators/customer-info.schema';
import { verifyEmailSchema } from '../validators/verify-email.schema';
import { createPasswordSchema } from '../validators/create-password.schema';
import { facialCaptureSchema } from '../validators/facial-verification.schema';
import { UserAuthentication } from '../middleware/auth.middleware';
import { changePasswordSchema } from '../validators/change_password.validator.schema';
import { validate } from '../validators/auth-validator.schema';

const router = Router();

const customerController = container.resolve(CustomerController);

// Test Routes

router.get('/register', (req, res) => {
  // Test Routes
  res.status(200).json({ msg: 'user route found' });
});

// Customer registration phone verification
router.post('/register-phone', validateRequest(phoneNumberSchema), customerController.registerPhone);

// Verify phone number with OTP
router.post('/verify-phone', validateRequest(verifyPhoneSchema), customerController.verifyPhone);

router.post('/resend-token', validateRequest(resendTokenSchema), customerController.resendToken);

// Customer information registration (after phone verification)
router.post('/register-user-info', validateRequest(customerInfoSchema), customerController.registerCustomerInfo);

// Email verification with OTP
router.post('/verify-email', validateRequest(verifyEmailSchema), customerController.verifyEmail);

// Set password after email verification
router.post('/create-password', validateRequest(createPasswordSchema), customerController.setPassword);

// User login (email and password)
router.post('/login', customerController.login);

// Forgot password (send reset link)
router.post('/forgot-password', customerController.forgotPassword);

// Reset password with a valid token
router.post('/upload-facial-capture', 
  upload.single("avatar"), 
  validateRequest(facialCaptureSchema), 
  customerController.uploadFacialVerification);

// Reset password with a valid token
router.post('/reset-password', customerController.resetPassword);

// router.post('/resend-code', customerController.resetPassword);
router.get('/dashboard/profile', UserAuthentication, customerController.getProfile);

router.post('/dashboard/change-password', [UserAuthentication, validate(changePasswordSchema)], customerController.changePassword);

export default router;