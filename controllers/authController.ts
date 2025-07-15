// controllers/authController.ts
import { Request, Response } from "express";
import * as authService from "../services/authService";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const register = async (req: Request, res: Response) => {
  try {
    const { name,email, password, address,phone } = req.body;
    const user = await authService.registerUser(name,email,password,address,phone);
    const { accessToken, refreshToken } = authService.generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ token: accessToken, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email,password);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const { accessToken, refreshToken } = authService.generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ token: accessToken, user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) throw new Error("Unauthorized");
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json(user); // usually already excludes password if your getUserById is safe
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) throw new Error("No refresh token found");

    const { accessToken, refreshToken } = await authService.refreshToken(tokenFromCookie);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: accessToken });
  } catch (error : any) {
    res.status(403).json({ error: error.message });
  }
};
