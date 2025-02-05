import { z } from 'zod';
import { validatePhoneNumber } from './common-rules';

// Define the validation schema for the phone number
const phoneNumberSchema = z.object({
  body: z.object({
    phone: validatePhoneNumber,
  }),
});

export { phoneNumberSchema };