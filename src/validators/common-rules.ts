import { z } from 'zod';
import { messages } from '../config/messages';

export const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
});

export type FileSchema = z.infer<typeof fileSchema>;

export const validateEmail = z
  .string({
    required_error: messages.emailIsRequired,
  })
  .min(1, { message: messages.emailIsRequired })
  .email({ message: messages.invalidEmail });

export const validatePassword = z
  .string()
  .min(1, { message: messages.passwordRequired })
  .min(6, { message: messages.passwordLengthMin })
  .regex(new RegExp('.*[A-Z].*'), {
    message: messages.passwordOneUppercase,
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: messages.passwordOneLowercase,
  })
  .regex(new RegExp('.*\\d.*'), { message: messages.passwordOneNumeric });

export const validateNewPassword = z
  .string()
  .min(1, { message: messages.passwordRequired })
  .min(6, { message: messages.passwordLengthMin })
  .regex(new RegExp('.*[A-Z].*'), {
    message: messages.passwordOneUppercase,
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: messages.passwordOneLowercase,
  })
  .regex(new RegExp('.*\\d.*'), { message: messages.passwordOneNumeric });

export const validateConfirmPassword = z
  .string()
  .min(1, { message: messages.confirmPasswordRequired })
  .min(6, { message: messages.passwordLengthMin })
  .regex(new RegExp('.*[A-Z].*'), {
    message: messages.passwordOneUppercase,
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: messages.passwordOneLowercase,
  })
  .regex(new RegExp('.*\\d.*'), { message: messages.passwordOneNumeric });

export const validatePhoneNumber = z
      .string({
        required_error: "Phone number is required", // Custom message for missing field
      })
      .nonempty("Phone number is required")
      .min(11, "Phone number should have at least 11 characters")
      // .min(1, { message: "phoneNumber is required" })
      .max(15, "Phone number should not exceed 15 characters")
      // Regex allows local numbers starting with 0 or international numbers starting with + followed by the country code
      .regex(/^(0\d{10}|\+\d{3}\d{10})$/, {
        message: "Invalid phone number format",  // Custom message for invalid format
      });

export const validateUserId = z.string({
        required_error: "User Id is required",
    }).uuid({
        message: "Invalid id format",
    });