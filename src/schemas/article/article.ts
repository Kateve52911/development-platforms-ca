import {z} from "zod";

export const articleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    body: z.string().min(1, "Body is required"),
    category: z.string().min(1, "Category is required"),
})


export const articleUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
}).refine(
    (data) => data.title || data.body || data.category,
    { message: "At least one field (title, body, category) is required" }
);

