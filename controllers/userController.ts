import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getUserBookLoan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.user?.id; 
    const status = req.query.status as string | undefined;
    if (isNaN(id)) {
      throw new Error("Invalid ID : ID must be a number");
    }
    const book = await userService.getUserBookLoan(id, status);
    if (!book) {
      throw new Error("Book not found");
    }
    res.status(200).json(book);
  } catch (error) {
    next(error); 
  }
};

export const getBookLoanHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.user?.id; 
    if (isNaN(id)) {
      throw new Error("Invalid ID : ID must be a number");
    }
    const book = await userService.getBookLoanHistory(id);
    if (!book) {
      throw new Error("Book not found");
    }
    res.status(200).json(book);
  } catch (error) {
    next(error); 
  }
}