import { Router } from "express";
import { createBook,updateBook, deleteBook, getBookLoanHistory, updateBookLoanStatus } from "../controllers/adminController";

const router = Router();

router.post('/books', createBook);
router.put('/books/:id',updateBook);
router.delete('/books/:id', deleteBook);
router.get('/loans', getBookLoanHistory);
router.put('/loans/:id/status', updateBookLoanStatus);

export default router;
