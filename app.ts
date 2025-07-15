import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,  // Allow credentials like cookies or authorization headers
  };
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

export default app;
