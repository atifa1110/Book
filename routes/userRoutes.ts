import express from 'express';
import { getUserBookLoan, getBookLoanHistory } from '../controllers/userController';
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

router.get('/loans', authenticateJWT, getUserBookLoan);
router.get('/history',authenticateJWT, getBookLoanHistory)

export default router;