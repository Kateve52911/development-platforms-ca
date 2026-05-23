import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "fallback-secret-for-development";

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
        return null;
    }
};