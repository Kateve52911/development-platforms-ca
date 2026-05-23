import { Router } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../db/database"
import {User, UserResponse} from "../types";
import bcrypt from "bcrypt";
import {generateToken} from "../utils/generateToken";
import {validateBody} from "../middleware/validation";
import {loginSchema, registerSchema} from "../schemas/user/user-validation";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: User with this email already exists
 *       500:
 *         description: Failed to create user
 */
router.post("/register", validateBody(registerSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.execute("SELECT id FROM users WHERE email = ? ", [email])

        const existingUsers = rows as User[];

        if (existingUsers.length > 0) {
            return res.status(409).json({
                error: "User with this email or username already exists",
            });
        }

        const saltRounds = 10
        const hashedPassword: string = await bcrypt.hash(password, saltRounds)

        const [result]: [ResultSetHeader, any] = await pool.execute( "INSERT INTO users (email, password_hash) VALUES (?,?)", [email, hashedPassword])

        const userResponse = {
            id: result.insertId,
            email
        };

        res.status(201).json({
            message: "User registered",
            user: userResponse,
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to create user",
        });
    }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Logs in a user and returns a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Failed to login
 */
router.post("/login", validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            [email]
        );
        const users = rows as User[];

        if (users.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const user: User = users[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const token = generateToken(user.id);


        const userResponse: UserResponse = {
            id: user.id,
            email: user.email,
        };

        res.json({
            message: "Login successful",
            user: userResponse,
            token,
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to login",
        });
    }
})

export default router;