import { z } from "zod";
import { validateEmail } from "./common-rules";
import { Gender } from "../enum";


const genderValues = Object.values(Gender) as [string, ...string[]];

// Define the schema for the request body
const customerInfoBodySchema = z.object({
    user_id: z.string({
        required_error: "User Id is required",
    }).uuid({
        message: "Invalid id format",
    }),

    firstname: z.string({
        required_error: "First name is required",
    }).min(1, {
        message: "First name cannot be empty",
    }).max(50, {
        message: "First name cannot exceed 50 characters",
    }),

    lastname: z.string({
        required_error: "Last name is required",
    }).min(1, {
        message: "Last name cannot be empty",
    }).max(50, {
        message: "Last name cannot exceed 50 characters",
    }),

    email: validateEmail,

    gender: z.enum(genderValues, {
        required_error: "Gender is required",
        invalid_type_error: `Gender must be one of: ${genderValues.join(", ")}`,
    }),

    location: z.string({
        required_error: "Location is required",
    }).min(1, {
        message: "Location cannot be empty",
    }).max(100, {
        message: "Location cannot exceed 100 characters",
    }),
});

const customerInfoSchema = z.object({
    body: customerInfoBodySchema,
});

export { customerInfoSchema };