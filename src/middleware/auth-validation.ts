import { Request, Response, NextFunction} from "express";
import {verifyToken} from "../utils/verifyToken";


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: "Access token required" });
    }

    if(!authHeader.startsWith("Bearer ")){
        return res.status(401).json({ error: "Token must be in format: Bearer <token>" });
    }

    const token = authHeader.substring(7)

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {id: payload.userId};

    next()
}