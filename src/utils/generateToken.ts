import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "fallback-secret-for-development";

export const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
};


