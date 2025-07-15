import { db } from '../config/db'; // Import your Drizzle DB instance
import { users, books, bookLoans, BookLoan, Book } from '../db/schema'; // Import your Drizzle schema
import { eq } from 'drizzle-orm';


// Function to create a new book using Drizzle
export const createBook = async (bookData: typeof books.$inferInsert) => {
  try {
    const insertedBooks = await db.insert(books).values(bookData).returning();
    if (insertedBooks.length > 0) {
        return insertedBooks[0];
    }
    else {
        throw new Error("Failed to insert book"); 
    }

  } catch (error) {
    throw new Error(`Database error: Failed to create book: ${error}`);
  }
};

// Function to update a book by its ID
export const updateBook = async (id: number, bookData: Partial<typeof books.$inferInsert>) => {
    try {
      const updatedBooks = await db
        .update(books)
        .set(bookData)
        .where(eq(books.id, id))
        .returning();
  
      if (updatedBooks.length > 0) {
        return updatedBooks[0];
      } else {
        throw new Error("Failed to update book");
      }
    } catch (error) {
      throw new Error(`Database error: Failed to update book: ${error}`);
    }
};
  

// Function to delete a book by its ID
export const deleteBook = async (id: number) => {
    try {
      const deletedBooks = await db
        .delete(books)
        .where(eq(books.id, id))
        .returning();
  
      if (deletedBooks.length > 0) {
        return deletedBooks[0];
      } else {
        throw new Error("Failed to delete book");
      }
    } catch (error) {
      throw new Error(`Database error: Failed to delete book: ${error}`);
    }
};
  
// Function to get all books using Drizzle
export const getBookLoan = async () => {
    try {
        const history = await db
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
            },
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(bookLoans)
          .innerJoin(books, eq(bookLoans.bookId, books.id))
          .innerJoin(users, eq(bookLoans.userId, users.id));
      return history;
    } catch (error) {
      throw new Error(`Database error: Failed to fetch all books: ${error}`);
    }
};

export const getBookLoanById = async (id: number): Promise<BookLoan | undefined> => {
  return await db.query.bookLoans.findFirst({
    where: eq(bookLoans.id, id),
    with: {
      book: true,
      user: true
    }
  });
};


export const getBook = async (id: number): Promise<Book | undefined> => {
  return await db.query.books.findFirst({
    where: eq(books.id, id)
  });
};


// export const updateBookLoanStatus = async (
//   id: number,
//   status: string
// ): Promise<BookLoan | undefined> => {
//   const [loan] = await db.update(bookLoans)
//     .set({ status })
//     .where(eq(bookLoans.id, id))
//     .returning();

//   // If approved, update book availability
//   if (status === "borrowed" || status === "approved") {
//     const bookLoan = await getBookLoanById(id);
//     if (bookLoan) {
//       const bookId = bookLoan.bookId;
//       const book = await getBook(bookId);
//       if (book && book.availableCopies > 0) {
//         await db.update(books)
//           .set({ 
//             availableCopies: book.availableCopies - 1,
//             available: book.availableCopies > 1
//           })
//           .where(eq(books.id, bookId));
//       }
//     }
//   }

//   return loan;
// };

  
export const updateBookLoanStatus = async (
  id: number,
  status: string
): Promise<BookLoan | undefined> => {
  try {
    const [loan] = await db.update(bookLoans)
      .set({ status })
      .where(eq(bookLoans.id, id))
      .returning();

    // If approved, update book availability
    if ((status === "borrowed" || status === "approved") && loan) {
      const bookLoan = await getBookLoanById(id);
      if (bookLoan) {
        const bookId = bookLoan.bookId;
        const book = await getBook(bookId);
        if (book && book.availableCopies > 0) {
          await db.update(books)
            .set({ 
              availableCopies: book.availableCopies - 1,
              available: book.availableCopies > 1
            })
            .where(eq(books.id, bookId));
        }
      }
    }

    return loan;
  } catch (error) {
    console.error(`Failed to update book loan status for ID ${id}:`, error);
    throw new Error(`Error updating book loan status: ${error}`);
  }
};