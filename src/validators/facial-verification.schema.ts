import { z } from "zod";
import { validateUserId } from "./common-rules";

const facialCaptureBodySchema = z.object({
    user_id: validateUserId,
    // file: z.object({
    //   mimetype: z.string().refine((mime) => mime.startsWith("image/"), {
    //     message: "File must be an image",
    //   }),
    // }),
  });


const facialCaptureSchema = z.object({
    body: facialCaptureBodySchema,
    file: z.object({
        mimetype: z.string().refine((mime) => mime.startsWith("image/"), {
            message: "File must be an image",
        }),
    }),
});

export { facialCaptureSchema };