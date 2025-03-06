import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

// const registerSchema = yup.object({
//   firstname: yup.string().lowercase().trim().required(),
//   lastname: yup.string().lowercase().trim().required(),
//   email: yup.string().email().lowercase().trim().required(),
//   password: yup.string().min(6).trim().required(),
// });

const loginSchema = yup.object({
  email: yup.string().email().lowercase().trim().required(),
  password: yup.string().min(6).trim().required(),
});

const forgotPasswordSchema = yup.object({
  email: yup.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = yup.object({
  code: yup.string().trim().required(),
  email: yup.string().email().lowercase().trim().required(),
  password: yup.string().min(6).trim().required(),
});

const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

// Define the validator function as a middleware
export const validate = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the request body with the provided schema
      await schema.validate(req.body, { abortEarly: false });
      next(); // If validation passes, call next() to move to the next middleware
    } catch (error: any) {
      // If validation fails, return an error response
      res.status(400).json({
        message: 'Validation failed',
        errors: error, // List of validation errors
      });
    }
  };
};

const AuthValidationSchema = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

export default AuthValidationSchema;
