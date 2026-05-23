import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "../schemas/user/user-validation";

/*export const validateRequiredUserData = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: result.error.issues.map((issue) => issue.message),
        });
    }
    next();
}*/

export const validateBody = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: result.error.issues.map((issue) => issue.message),
        });
    }
    next();
}}

