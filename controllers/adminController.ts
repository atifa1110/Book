import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBook = await adminService.createBook(req.body);
      res.status(201).json(newBook);
    } catch (error: any) {
    res.status(500).json({ error: error.message })
    }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const updatedBook = await adminService.updateBook(id,data);
        if (!updatedBook) {
            throw new Error("Book not found or update failed.");
        }
        res.status(200).json(updatedBook);
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const deleteBook = await adminService.deleteBook(id);
        if(!deleteBook){
            throw new Error("Book not found or failed to delete.");
        }
        res.status(201).json(deleteBook);
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
};  

export const getBookLoanHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await adminService.getBookLoan();
      res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching book loan history:", error);
      next(error);
    }
};

export const updateBookLoanStatus = async(req:Request, res: Response, next: NextFunction) => {
  try{
    const id = Number(req.params.id);
    const status = req.body.status;
    if (!["pending", "approved", "borrowed", "returned", "rejected"].includes(status)) {
        throw new Error("Invalid status");
      }
    const loans = await adminService.updateBookLoanStatus(id,status);
     if (!loans) {
       throw new Error("Loan not found");
      }
    res.status(200).json(loans);
  }catch (error){
    console.error("Error updating book loan history:", error);
    next(error);
  }
};