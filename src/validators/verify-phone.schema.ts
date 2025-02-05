import { z } from 'zod';
import { validateUserId } from './common-rules';

// Define the schema for the request body
const verifyPhoneBodySchema = z.object({
    user_id: validateUserId,

    phone: z
        .string({
            required_error: "Phone number is required", // Custom message for missing field
        }).nonempty("Phone number is required")
        .min(11, { message: "Phone number should have at least 11 characters" })
        .max(15, { message: "Phone number should not exceed 15 characters" })
        .regex(/^(0\d{10}|\+\d{3}\d{10})$/, {
        message: "Invalid phone number format. Must start with 0 or a valid international code.",
        }), // Validates phone number format

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

const verifyPhoneSchema = z.object({
    body: verifyPhoneBodySchema,
});


export { verifyPhoneSchema, verifyPhoneBodySchema };
