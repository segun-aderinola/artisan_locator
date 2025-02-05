import { z } from "zod";
import { TokenType } from "../enum";
import { validateEmail, validatePhoneNumber, validateUserId } from "./common-rules";


const resendTokenBodySchema = z.discriminatedUnion("type", [
    z.object({
      type: z.literal(TokenType.EMAIL_VERIFICATION), // Check if type is EMAIL_VERIFICATION
      user_id: validateUserId, // User ID is part of the object
      email: validateEmail, // email is required for email verification
    }),
    z.object({
      type: z.literal(TokenType.PHONE_VERIFICATION), // Check if type is PHONE_VERIFICATION
      user_id: validateUserId, // User ID is part of the object
      phone: validatePhoneNumber, // phone is required for phone verification
    })
]);

const resendTokenSchema = z.object({
    body: resendTokenBodySchema,
});

export { resendTokenSchema };
