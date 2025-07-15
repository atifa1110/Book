# 📚 BookBuddy - Library Management System

A modern full-stack library management application built with TypeScript, React, and Express.js.

---

## 🚀 Tech Stack Overview

### 🔸 Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- @tailwindcss/typography
- tailwindcss-animate
- tailwind-merge
- TanStack Query (React Query)
- React Hook Form
- Zod
- Wouter
- Framer Motion
- Lucide React
- React Icons
- date-fns
- class-variance-authority
- clsx

### 🔹 Backend

- Node.js
- Express.js
- TypeScript
- Passport.js
- passport-local
- Express Session
- connect-pg-simple
- PostgreSQL (via Neon)
- @neondatabase/serverless
- Drizzle ORM
- drizzle-zod

### 🛠️ Tooling & Dev Experience

- tsx
- esbuild
- Drizzle Kit
- PostCSS
- Autoprefixer
- @vitejs/plugin-react
- TypeScript compiler
- zod-validation-error
- @types (for type definitions)

### 🌐 Hosting & Deployment

- Neon Database

---

## 🔧 Key Features

- User authentication with secure sessions
- Book browsing, search, and filtering
- Loan system with borrow/return functionality
- Admin panel for managing books and loans
- Fully responsive UI
- End-to-end type safety (frontend, backend, database)

---

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev