import { z } from 'zod';
import { validateEmail, validateUserId } from './common-rules';

// Define the schema for the request body
const verifyEmailBodySchema = z.object({
    user_id: validateUserId,

    email: validateEmail,

    code: z
        .string({
            required_error: "Code is required", // Custom message for missing field
        }).nonempty("Code is required")
        .min(4, { message: "Verification code must have at least 4 characters" }) // Assuming code is 4 characters minimum
        .max(4, { message: "Verification code must not exceed 4 characters" }) // Assuming code length is 6 max
        .regex(/^\d+$/, {
        message: "Verification code must be a numeric string.",
        }),
});

const verifyEmailSchema = z.object({
    body: verifyEmailBodySchema,
});


export { verifyEmailSchema, verifyEmailBodySchema };
