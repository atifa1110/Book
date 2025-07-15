// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "secret";

// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     (req as any).user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid token" });
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: any; // You can replace `any` with a better User type
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }

      req.user = decoded; // ✅ Attach user info
      next();
    });
  } else {
    res.status(401).json({ error: "Token not provided" });
  }
};


// import jwt, { JwtPayload } from "jsonwebtoken";
// import { AuthenticatedRequest } from "@/types"; // or wherever your type is

// interface DecodedUser extends JwtPayload {
//   id: number;
//   name?: string;
//   email?: string;
//   isAdmin?: boolean;
// }

// export const authenticateJWT = (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     const token = authHeader.split(" ")[1];

//     jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ error: "Invalid token" });
//       }

//       const user = decoded as DecodedUser; // 👈 assert the type
//       req.user = {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,
//       };

//       next();
//     });
//   } else {
//     res.status(401).json({ error: "Token not provided" });
//   }
// };
