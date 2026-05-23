import { Request, Response, NextFunction } from "express";
import { pool } from "../db/database";
import { Article } from "../types";

export const verifyArticleOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const articleId = Number(req.params.id);

        const [rows] = await pool.execute(
            "SELECT submitted_by FROM articles WHERE id = ?",
            [articleId]
        );
        const articles = rows as Article[];

        if (articles.length === 0) {
            return res.status(404).json({ error: "Article not found" });
        }

        if (articles[0].submitted_by !== req.user?.id) {
            return res.status(403).json({ error: "You can only modify your own articles" });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Failed to verify article ownership" });
    }
}