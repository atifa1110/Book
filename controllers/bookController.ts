import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/bookService';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";


export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  const { 
    search, 
    genres, 
    available, 
    page = 1, 
    limit = 10, 
    sortBy = "title", 
    sortOrder = "asc" 
  } = req.query;

  const options = {
    search: search as string | undefined,
    genres: genres ? (Array.isArray(genres) ? genres as string[] : [genres as string]) : undefined,
    available: available === "true" ? true : available === "false" ? false : undefined,
    limit: parseInt(limit as string),
    offset: (parseInt(page as string) - 1) * parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc"
  };

  try{
    const books = await bookService.getBooks(options);
     res.status(200).json(books);
  } catch (error){
    next(error);
  }

}

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new Error("Invalid ID : ID must be a number");
    }
    const book = await bookService.getBookById(id);
    if (!book) {
      throw new Error("Book not found");
    }
    res.status(200).json(book);
  } catch (error) {
    next(error); 
  }
};

export const createLoanBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user?.id; 
    //const userId = parseInt(req.query.userId as string); // query is always string
    if (!userId) {
      throw new Error("Unauthorized or missing userId");
    }

    const book = await bookService.getBookById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    if (!book.available) {
      throw new Error("Book is not available for borrowing");
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loan = await bookService.createBookLoan(userId, bookId, dueDate);
    res.status(201).json(loan);
  } catch (error) {
    console.error("Error borrowing book:", error);
    next(error);
  }
};

export const returnLoanBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      const loanId = parseInt(id);
      const userId = req.user!.id;
      
      // Get loan
      const loan = await bookService.getBookLoan(loanId);
      if (!loan) {
        throw new Error("Loan not found");
      }
      
      // Check if loan belongs to user or user is admin
      if (loan.userId !== userId && !req.user!.isAdmin) {
         throw new Error("Not authorized to return this book");
      }
      
      // Check if loan is already returned
      if (loan.status === "returned") {
        throw new Error("Book is already returned")
      }
      
      // Return the book
      const updatedLoan = await bookService.returnBook(loanId);
      
      res.json(updatedLoan);
    } catch (error) {
      console.error("Error returning book:", error);
      res.status(500).json({ message: "Failed to return book" });
    }
}