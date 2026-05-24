# News Platform API

## Intro

A RESTful API for managing news articles and users, built with Node.js, Express, and TypeScript. The API allows users to register, log in, and perform CRUD operations on news articles. Authentication is handled with JSON Web Tokens (JWT), and all sensitive routes are protected. Data is stored in a MySQL database, and the API is documented with Swagger UI available at /api-docs.

## Motivations

I chose to do this option because I want to become a fullstack developer and I saw this opportunity to see if I liked it and also as a learning opportunity. I thoroughly enjoyed learning about and understanding what goes on behind all the calls to a database that I have done in earlier assignments. It was very interesting understanding how to write the routes, and I liked how we learned about connecting routes to securities such as middlewares and schemas. It was somewhat difficult structuring the SQL calls in the routes but also at the same time very interesting. I also enjoyed learning more about SQL and using Postman. I feel that this assignment has given me a deeper insight into how APIs work. I don't think there was anything I did not enjoy. I think one of the benefits in developing a custom API is that you as the creator get full control over everything. You can create the checks and authentications that you need and you also have better control of how data gets added to your database. A custom API also allows you to optimize queries for your specific use case, whereas a SaaS solution like Supabase may have limitations or abstractions that make it harder to control exactly how data is fetched and structured.

## Contents

- [Getting started](#getting-started)
    - [Requirements](#requirements)
    - [Install](#install)
    - [Usage](#usage)
    - [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
    - [Used Technologies](#used-technologies)

## Getting Started

In order to run this project locally on your computer, you have to do the following steps.
It is easier than you think.

### Requirements

Make sure that you have the following installed on your computer:

- Node.js (version 18 or higher)
- npm or yarn
- Git

### Install

#### 1. Clone the repository:

Use git to clone this repository into your computer. Assuming using https, then run the following in your CLI:

```
git clone https://github.com/Kateve52911/development-platforms-ca
```

#### 2. Install dependencies:

Navigate to the root directory of the repo and run the following to install all dependencies.

```
npm install
```

### 3. Set up database

- Create a new database (news) with the provided .sql database export. You can use MySql Workbench or any other tool you use.
- Database file:  [news](src/db/data/Dump20260523.sql)
- Use the environment example below and set up your own .env file. 
- `DB_Name`must match the exact database name
- To configure JWT_SECRET you can use node:
  ``node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"``

### Environment Variables

Create a `.env` file in the root directory, see the .env.example file for an example.

```bash
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
PORT=4000
```

**Note:** Never commit your `.env` file to version control.

### Usage

After installation, run the development server:

```bash
npm run dev
```

Open your browser and navigate to the local host address shown in the terminal.

### API Documentation

Once the server is running, you can explore the API documentation via Swagger UI at:
`http://localhost:4000/api-docs`

This provides an interactive interface where you can view and test all available endpoints.

## Project Structure

```
development-platforms-ca/
├── src/
│   ├── db/
│   │   └── database.ts        # Database connection
│   ├── middleware/
│   │   ├── articles.ts        # Article ownership verification
│   │   ├── auth-validation.ts # JWT authentication
│   │   └── validation.ts      # Zod body validation
│   ├── routes/
│   │   ├── articles.ts        # Article routes (CRUD)
│   │   ├── auth.ts            # Register and login routes
│   │   └── users.ts           # User routes (CRUD)
│   ├── schemas/
│   │   ├── article/
│   │   │   └── article.ts     # Article schemas
│   │   └── user/
│   │       ├── user-update.ts      # User update schema
│   │       └── user-validation.ts  # User login/register schemas
│   ├── types/
│   │   ├── express.d.ts       # Express type augmentation
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── generateToken.ts   # JWT token generation
│   │   └── verifyToken.ts     # JWT token verification
│   └── index.ts               # App entry point
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
└── tsconfig.json
```

## Contributing

To contribute to the project, simply install as detailed above, and then after finishing your changes, create a PR on GitHub.

### Used technologies

The tech stack for this project includes:

- Typescript
- Node.js
- Express
- SQL
- mySQL
- Zod
- JWT (JSON Web Tokens)
- bcrypt
- Swagger
