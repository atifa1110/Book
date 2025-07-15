import { db } from '../config/db'; // Import your Drizzle DB instance
import { books, Book ,genreEnumValues, BookLoan, bookLoans } from '../db/schema'; // Import your Drizzle schema
import { eq, or, and, inArray, desc, like} from 'drizzle-orm';

export type GetBooksOptions = {
  search?: string;
  genres?: String[];
  available?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const sortableColumns = {
  title: books.title,
  author: books.author,
  createdAt: books.createdAt,
};

export const getBooks = async (options: GetBooksOptions = {}): Promise<Book[]> => {
  try {
    const query = db.select().from(books);
    const conditions = [];

    // Search filter
    if (options.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          like(books.title, searchTerm), // Use like instead of eq for partial matching
          like(books.author, searchTerm),
          like(books.isbn, searchTerm)
        )
      );
    }

    // Genre filter
    if (options.genres && options.genres.length > 0) {
      const validGenres = options.genres.filter((g) =>
        genreEnumValues.includes(g as any)
      ) as typeof genreEnumValues[number][];

      conditions.push(inArray(books.genre, validGenres));
    }

    // Availability filter
    if (options.available !== undefined) {
      conditions.push(eq(books.available, options.available));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    if (options?.sortBy) {
      const sortColumn = sortableColumns[options.sortBy as keyof typeof sortableColumns];
      if (sortColumn) {
        if (options.sortOrder === 'desc') {
          query.orderBy(desc(sortColumn));
        } else {
          query.orderBy(sortColumn);
        }
      }
    } else {
      query.orderBy(books.title); // default
    }
  
    if (options?.limit) {
      query.limit(options.limit);
      if (options.offset) {
        query.offset(options.offset);
      }
    }
  
    return await query;
  } catch (error) {
    throw new Error(`Database error: Failed to fetch books: ${error}`);
  }
};

// Function to get all books using Drizzle
export const getAllBooks = async () => {
  try {
    const result = await db.select().from(books);
    return result;
  } catch (error) {
    throw new Error(`Database error: Failed to fetch all books: ${error}`);
  }
};


// Function to get a book by ID using Drizzle
export const getBookById = async (id: number) => {
  try {
    const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
    return result[0] || undefined; // Return undefined if no book found
  } catch (error) {
    throw new Error(`Database error: Failed to fetch book by ID: ${error}`);
  }
};

export const createBookLoan = async (
  userId: number,
  bookId: number,
  dueDate: Date
): Promise<BookLoan> => {
  const [loan] = await db.insert(bookLoans)
    .values({
      userId,
      bookId,
      dueDate,
      status: "pending"
    })
    .returning();

  return loan;
};

export const getBookLoan = async(
  id: number
): Promise<BookLoan | undefined> => {
    const loans = await db.query.bookLoans.findFirst({
      where: eq(bookLoans.id, id),
      with: {
        book: true,
        user: true
      }
    });
    return loans
  }

export const getBook= async(
  id: number
): Promise<Book | undefined> => {
    return await db.query.books.findFirst({
      where: eq(books.id, id)   
    });
}

export const returnBook = async(
  id: number
): Promise<BookLoan | undefined> => {
  const [loan] = await db.update(bookLoans)
      .set({ 
        status: "returned",
        returnDate: new Date()
      })
      .where(eq(bookLoans.id, id))
      .returning();
    
    // Update book availability
    if (loan) {
      const book = await getBook(loan.bookId);
      if (book) {
        await db.update(books)
          .set({ 
            availableCopies: book.availableCopies + 1,
            available: true
          })
          .where(eq(books.id, loan.bookId));
      }
    }
    
    return loan;
}
