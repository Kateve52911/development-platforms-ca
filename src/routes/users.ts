import { Router } from "express";
import {pool} from "../db/database";
import {ArticleWithUser, User, UserUpdate} from "../types";
import {authenticateToken} from "../middleware/auth-validation";
import {ResultSetHeader} from "mysql2";
import {userUpdateSchema} from "../schemas/user/user-update";
import {validateBody} from "../middleware/validation";

const router = Router();


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users. Requires a valid JWT token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Failed to load users
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT users.id, users.email FROM users ORDER BY users.created_at DESC");

        const users = rows as User[]
        res.json(users)

    } catch (error) {
        res.status(500).json({
            error: "Failed to load users",
        })
    }
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns a single user by their ID. Requires a valid JWT token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user
 */
router.get("/:id", authenticateToken,  async (req, res) => {
    try {
        const userId: number = Number(req.params.id);

        if(isNaN(userId)) {
            return res.status(404).json({error: "User not found!"})
        }

        const [rows] = await pool.execute (
            "SELECT id, email FROM users WHERE id = ?;", [userId]
        );

        const users = rows as User[];

        if(users.length === 0) {
            return res.status(404).json({error: "User not found!"})
        }

        const user = users[0];
        res.json(user);
    } catch(error) {
        return res.status(500).json({error: "Failed to fetch user!"})
    }
})

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Updates a user's email. Requires a valid JWT token and can only update your own profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid user ID or validation failed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - you can only update your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
router.put("/:id", authenticateToken, validateBody(userUpdateSchema), async (req, res) => {
    try {
        const userId: number = Number(req.params.id);
        const {email} = req.body;

        if(isNaN(userId)) {
            return res.status(400).json({error: "Invalid user Id!"})
        }

        if (req.user?.id !== userId) {
            return res.status(403).json({ error: "You can only update your own profile" });
        }

        const [result]: [ResultSetHeader, any] = await pool.execute(
            "UPDATE users SET email = ? WHERE id = ?",
            [email, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        const user: UserUpdate = { id: userId, email };
        res.json(user);

    } catch (error) {
        res.status(500).json({error: "Failed to update user!"})
    }
})

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user and all their articles. Requires a valid JWT token and can only delete your own profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - you can only delete your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const userId: number = Number(req.params.id);

        if(isNaN(userId)) {
            return res.status(400).json({error: "Invalid user Id!"})
        }

        if (req.user?.id !== userId) {
            return res.status(403).json({ error: "You can only delete your own profile" });
        }

        await pool.execute("DELETE FROM articles WHERE submitted_by = ?", [userId]);
        const [result]: [ResultSetHeader, any] = await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.status(204).send();

    } catch (error) {
        res.status(500).json({error: "Failed to delete user!"})
    }
})

export default router
