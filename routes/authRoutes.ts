import { Router } from "express";
import { login, register, logout, getCurrentUser,refreshToken } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post('/register', register);
router.post('/login',login);
router.post('/logout', logout);
router.get('/user', authenticateJWT, getCurrentUser);
router.post('/refresh-token', refreshToken);

export default router;
