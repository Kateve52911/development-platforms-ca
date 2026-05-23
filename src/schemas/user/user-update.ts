import { z } from "zod";

export const userUpdateSchema = z.object({
    email: z.email("Email must be a valid email"),
})