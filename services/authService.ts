import jwt from "jsonwebtoken";
import { hashPassword, comparePasswords } from "../utils/authUtil"
import { db } from "../config/db";
import { users , User } from "../db/schema";
import { eq } from "drizzle-orm";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const registerUser = async (
  name : string,
  email : string,
  password : string,
  address : string,
  phone : string,
): Promise<Omit<User, "password">> => {
  const hashed = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ name, email, password: hashed, address, phone })
    .returning();

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  const isMatch = await comparePasswords(password, user.password);
  return isMatch ? user : null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
};

export const generateTokens = (user: Omit<User, "password">)=> {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET ,{ 
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET ,{ 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
});

  return { accessToken, refreshToken };
};


export const refreshToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET!) as any;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user) throw new Error("User not found");

    const accessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
};