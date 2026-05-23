import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Email must be a valid email"),
    password: z.string()
})

export const registerSchema = z.object({
    email: z.email("Email must be a valid email"),
    password: z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/, "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and a special character")
})

export const userIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID must be a positive number"),
});

