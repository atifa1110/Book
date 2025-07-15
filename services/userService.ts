import { db } from '../config/db'; // Import your Drizzle DB instance
import { users, books, bookLoans } from '../db/schema'; // Import your Drizzle schema
import { and, eq, desc } from "drizzle-orm";

export const getUserBookLoan = async (userId: number, status?: string) => {
    try {
        const conditions = [eq(bookLoans.userId, userId)];
        if (status) {
          conditions.push(eq(bookLoans.status, status));
        }
    
        const loans = await db
          .select({
            id: bookLoans.id,
            userId: bookLoans.userId,
            bookId: bookLoans.bookId,
            borrowDate: bookLoans.borrowDate,
            dueDate: bookLoans.dueDate,
            returnDate: bookLoans.returnDate,
            status: bookLoans.status,
            createdAt: bookLoans.createdAt,
            book: {
              id: books.id,
              title: books.title,
              author: books.author,
              coverImage : books.coverImage
            },
          })
          .from(bookLoans)
          .where(and(...conditions))
          .innerJoin(books, eq(bookLoans.bookId, books.id))
          .orderBy(bookLoans.createdAt);
    
        return loans;
    } catch (error) {
      throw new Error(`Database error: Failed to fetch all books: ${error}`);
    }
};
  
export const getBookLoanHistory = async (userId: number) => {
  try{
    const history = await db.select({
            id: bookLoans.id,
            userId: bookLoans.userId,
            bookId: bookLoans.bookId,
            borrowDate: bookLoans.borrowDate,
            dueDate: bookLoans.dueDate,
            returnDate: bookLoans.returnDate,
            status: bookLoans.status,
            createdAt: bookLoans.createdAt,
            book: {
              id: books.id,
              title: books.title,
              author: books.author,
              coverImage : books.coverImage
            },
          }
    ).from(bookLoans)
      .where(eq(bookLoans.userId, userId))
      .innerJoin(books, eq(bookLoans.bookId, books.id))
      .orderBy(desc(bookLoans.createdAt));
    return history
  }catch (error) {
    throw new Error(`Database error: Failed to fetch all books: ${error}`);
  }
}
