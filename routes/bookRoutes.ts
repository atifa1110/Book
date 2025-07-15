import express from 'express';
import { authenticateJWT } from "../middlewares/authMiddleware";
import { getBookById, getBooks,createLoanBook, returnLoanBook } from '../controllers/bookController';

const router = express.Router();

router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.post('/books/:id/borrow', authenticateJWT, createLoanBook)
router.post('/loans/:id/return', authenticateJWT, returnLoanBook)

export default router;