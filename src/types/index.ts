export interface User {
    id: number;
    email: string;
    password_hash: string;
}

export interface UserResponse {
    id: number;
    email: string;
}

export interface UserUpdate {
    id: number;
    email: string;
}

export interface Article {
    articles_id: number;
    title: string;
    body: string;
    category: string;
    submitted_by: number;
}

export interface ArticleWithUser extends Article {
    email: string;
}