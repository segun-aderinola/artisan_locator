import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { validateUserId } from "./common-rules";

// Define the schema
const createPasswordBodySchema = z.object({
  user_id: validateUserId,
  password: z
    .string({
        required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
  confirmPassword: z.string({
    required_error: "Confirm password is required",
}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

const createPasswordSchema = z.object({
    body: createPasswordBodySchema,
});

export { createPasswordSchema };
