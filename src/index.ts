import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRouter from "./routes/auth";
import articleRouter from "./routes/articles";
import userRouter from "./routes/users";
const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json())

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "News Platform API",
            version: "1.0.0",
            description: "A simple API for managing users and news articles",
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            }
        }
    },
    apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use("/articles", articleRouter);
app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
