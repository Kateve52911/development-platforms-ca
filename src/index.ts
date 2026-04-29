import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import { pool } from "./db/database"
import {User} from "./types";
const PORT = process.env.PORT || 4000;


const app = express();

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to the server!",
    });
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM users");
        const users = rows as User[];

        res.json(users);
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({
            error: "Failed to fetch users",
        });
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
