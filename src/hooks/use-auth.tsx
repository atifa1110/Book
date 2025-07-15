import { createContext, ReactNode, useContext, } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{token: string, user: Omit<User, "password">}, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = z.infer<typeof insertUserSchema>;

// Create a default AuthContext with mock functions to avoid errors
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as unknown as UseMutationResult<
    { token: string; user: Omit<User, "password"> },
    Error,
    LoginData
  >,
  logoutMutation: {} as unknown as UseMutationResult<void, Error, void>,
  registerMutation: {} as unknown as UseMutationResult<
    Omit<User, "password">,
    Error,
    RegisterData
  >,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Use query to fetch user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<User, "password"> | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutations
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Sending login request with credentials:", credentials);
      try {
        console.log("Sending login request with credentials:", credentials);
        const res = await apiRequest("POST", "/api/login", credentials);
        const data = await res.json();
        console.log("Login response:", data);
        return data;
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred during login");
      }
    },
    onSuccess: (response: { token: string , user: Omit<User, "password">}) => {
      localStorage.setItem("accessToken", response.token);
      queryClient.setQueryData(["/api/user"], response.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", userData);
        return await res.json();
      } catch (error) {
        console.error("Register error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred during registration");
      }
    },
    onSuccess: (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to BookBuddy, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Error creating account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error("Logout error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred during logout");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout mutation error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Error logging out",
        variant: "destructive",
      });
    },
  });

  // Create the auth context value
  const authContextValue: AuthContextType = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
