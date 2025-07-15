import { pgTable, text, serial, integer, boolean, timestamp, unique, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  address: text("address"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Genre enum
export const genreEnum = pgEnum("genre", [
  "fiction", 
  "non_fiction", 
  "science_fiction", 
  "fantasy", 
  "mystery", 
  "thriller", 
  "romance", 
  "biography", 
  "history", 
  "science", 
  "self_help", 
  "children", 
  "comic", 
  "poetry", 
  "drama", 
  "classic"
]);

export const genreEnumValues = genreEnum.enumValues;


// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull().unique(),
  publisher: text("publisher").notNull(),
  publicationDate: text("publication_date").notNull(),
  genre: genreEnum("genre").notNull(),
  synopsis: text("synopsis").notNull(),
  coverImage: text("cover_image").notNull(),
  available: boolean("available").default(true).notNull(),
  totalCopies: integer("total_copies").default(1).notNull(),
  availableCopies: integer("available_copies").default(1).notNull(),
  pages: integer("pages"),
  language: text("language").default("English").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Book Loans table
export const bookLoans = pgTable("book_loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  borrowDate: timestamp("borrow_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  status: text("status").notNull(), // "pending", "approved", "borrowed", "returned", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookLoans: many(bookLoans),
}));

export const booksRelations = relations(books, ({ many }) => ({
  bookLoans: many(bookLoans),
}));

export const bookLoansRelations = relations(bookLoans, ({ one }) => ({
  user: one(users, {
    fields: [bookLoans.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [bookLoans.bookId],
    references: [books.id],
  }),
}));

// Create schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
}).omit({ id: true, createdAt: true, isAdmin: true });

export const insertBookSchema = createInsertSchema(books, {
  title: (schema) => schema.min(1, "Title is required"),
  author: (schema) => schema.min(1, "Author is required"),
  isbn: (schema) => schema.min(10, "ISBN must be at least 10 characters"),
  synopsis: (schema) => schema.min(10, "Synopsis must be at least 10 characters"),
}).omit({ id: true, createdAt: true });

export const insertBookLoanSchema = createInsertSchema(bookLoans, {
  bookId: (schema) => schema.positive("Book ID must be positive"),
}).omit({ id: true, borrowDate: true, createdAt: true, userId: true, returnDate: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BookLoan = typeof bookLoans.$inferSelect;
export type InsertBookLoan = z.infer<typeof insertBookLoanSchema>;
