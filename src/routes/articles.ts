import { Router } from "express";
import {pool} from "../db/database";
import { ResultSetHeader } from "mysql2";
import {Article, ArticleWithUser, User} from "../types";
import {articleSchema, articleUpdateSchema} from "../schemas/article/article";
import {authenticateToken} from "../middleware/auth-validation";
import {validateBody} from "../middleware/validation";
import {verifyArticleOwnership} from "../middleware/articles";

const router = Router();

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     description: Creates a new article. Requires a valid JWT token.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Failed to create article
 */
router.post("/", authenticateToken, validateBody(articleSchema),  async (req, res) => {
    try {
        const  {title, body, category } = req.body;
        const userId = req.user?.id;

        if(!userId) {
            return res.status(401).json({error: "User not found, please log in or register"});
        }

        const [result]: [ResultSetHeader, any] = await pool.execute(
            "INSERT INTO articles (title, body, category, submitted_by) VALUES (?, ?, ?, ?)", [title, body, category, userId],
        )

        const article: Article = {articles_id: result.insertId, title, body, category, submitted_by: userId}

        res.json(article)

    } catch (error) {
        res.status(500).json({error: "Failed to create article"})

    }
})

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles
 *     description: Returns a list of all articles joined with their submitting user's information, ordered by creation date descending.
 *     tags:
 *       - Articles
 *     responses:
 *       '200':
 *         description: A list of articles with user info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   articles_id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "My First Article"
 *                   body:
 *                     type: string
 *                     example: "This is the body of the article."
 *                   category:
 *                     type: string
 *                     example: "Technology"
 *                   submitted_by:
 *                     type: integer
 *                     example: 42
 *                   id:
 *                     type: integer
 *                     description: The submitting user's ID
 *                     example: 42
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "user@example.com"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to load the articles"
 */

router.get("/", async (req, res) => {
   try {
       const [rows] = await pool.execute("SELECT articles.id AS articles_id, articles.title, articles.body, articles.category, articles.submitted_by, users.id, users.email FROM articles INNER JOIN users ON articles.submitted_by = users.id ORDER BY articles.created_at DESC");

       const articles = rows as ArticleWithUser[]
       res.json(articles)

   } catch (error) {
        res.status(500).json({
            error: "Failed to load the articles",
        })
   }
})

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get an article by ID
 *     description: Returns a single article with its author's information.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     responses:
 *       200:
 *         description: Article found successfully
 *       400:
 *         description: Invalid article ID
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to fetch article
 */
router.get("/:id", async (req, res) => {
    try {
        const article_id: number = Number(req.params.id);

        if(isNaN(article_id)) {
            return res.status(400).json({error: "Invalid article Id!"})
        }

        const [rows] = await pool.execute(
            "SELECT articles.id AS articles_id, articles.title, articles.body, articles.category, articles.submitted_by, users.id, users.email FROM articles INNER JOIN users ON articles.submitted_by = users.id WHERE articles.id = ?",
            [article_id]
        );

        const articles = rows as ArticleWithUser[];

        if(articles.length === 0) {
            return res.status(404).json({error: "Article not found"})
        }

        const article = articles[0];
        res.json(article);
    } catch(error) {
        return res.status(500).json({error: "Failed to fetch article!"})
    }
})


/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Replace an article
 *     description: Replaces all fields of an existing article. Requires a valid JWT token and article ownership.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Article replaced successfully
 *       400:
 *         description: Invalid article ID or validation failed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - you do not own this article
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to update article
 */
router.put("/:id", authenticateToken, verifyArticleOwnership, validateBody(articleSchema), async (req, res) => {
    try {
        const articleId = Number(req.params.id);
        const {title, body, category} = req.body;

        if(isNaN(articleId)) {
            return res.status(400).json({error: "Invalid article id"});
        }


        const [result]: [ResultSetHeader, any] = await pool.execute(
            "UPDATE articles SET title = ?, body = ?, category = ? WHERE id = ?",
            [title, body, category, articleId]
        );

        const [rows] = await pool.execute(
            "SELECT title, body, category FROM articles WHERE id = ?",
            [articleId],
        );
        const articles = rows as Article[];
        const article = articles[0];

        res.json(article);


    } catch (error) {
        res.status(500).json({error: "Failed to update article"})
    }
})


/**
 * @swagger
 * /articles/{id}:
 *   patch:
 *     summary: Partially update an article
 *     description: Updates one or more fields of an existing article. Requires a valid JWT token and article ownership.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Invalid article ID or validation failed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - you do not own this article
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to update article
 */
router.patch("/:id", authenticateToken, verifyArticleOwnership, validateBody(articleUpdateSchema), async (req, res) => {
    try {
        const articleId = Number(req.params.id);
        const {title, body, category} = req.body;

        if(isNaN(articleId)) {
            return res.status(400).json({error: "Invalid article id"});
        }

        const fieldsToUpdate = []
        const values = []

        if (title) {
            fieldsToUpdate.push("title = ?");
            values.push(title)
        }

        if (body) {
            fieldsToUpdate.push("body = ?");
            values.push(body)
        }

        if (category) {
            fieldsToUpdate.push("category = ?");
            values.push(category)
        }

        values.push(articleId);

        const query = `UPDATE articles SET ${fieldsToUpdate.join(", ")} WHERE id = ?`
        const [result]: [ResultSetHeader, any] = await pool.execute(query, values);

        const [rows] = await pool.execute(
            "SELECT title, body, category FROM articles WHERE id = ?",
            [articleId],
        );
        const articles = rows as ArticleWithUser[];
        const article = articles[0];

        res.json(article);


    } catch (error) {
        res.status(500).json({error: "Failed to update article"})
    }
})


/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     description: Deletes an existing article. Requires a valid JWT token and article ownership.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     responses:
 *       204:
 *         description: Article deleted successfully
 *       400:
 *         description: Invalid article ID
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - you do not own this article
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to delete article
 */
router.delete("/:id", authenticateToken, verifyArticleOwnership, async (req, res) => {
    try {
        const articleId = Number(req.params.id);

        if(isNaN(articleId)) {
            return res.status(400).json({error: "Invalid article id"});
        }


        const [result]: [ResultSetHeader, any] = await pool.execute(
            "DELETE  FROM articles WHERE id = ?",
            [articleId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Article not found",
            });
        }

        res.status(204).send();

    } catch (error) {
        res.status(500).json({error: "Failed to delete article"})
    }
})

export default router;