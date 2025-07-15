import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const auth = useAuth();
  const { user, loginMutation, registerMutation } = auth;
  console.log("Auth context:", {
    userExists: !!auth.user,
    loginMutationExists: !!auth.loginMutation,
    isMutateFunction: typeof auth.loginMutation?.mutate === 'function'
  });
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false
    }
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      phone: "",
      terms: false
    }
  });

  // Handle login submit
  const onLoginSubmit = (data: LoginFormValues) => {
    console.log("Login form submitted:", { email: data.email, password: data.password });  
    console.log("loginMutation:", loginMutation);
    console.log("typeof loginMutation.mutate:", typeof loginMutation.mutate);
    if (loginMutation && typeof loginMutation.mutate === 'function') {
      console.log("Calling loginMutation.mutate");
      loginMutation.mutate({
        email: data.email,
        password: data.password
      });
    } else {
      console.error("Login mutation not available", loginMutation);
      alert("Login system is currently unavailable. Please try again later.");
    }
  };

  // Handle register submit
  const onRegisterSubmit = (data: RegisterFormValues) => {
    console.log("Register form submitted:", { email: data.email, name: data.name });
    
    if (registerMutation && typeof registerMutation.mutate === 'function') {
      const { confirmPassword, terms, ...userData } = data;
      registerMutation.mutate(userData);
    } else {
      console.error("Register mutation not available", registerMutation);
      alert("Registration system is currently unavailable. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form side */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            {activeTab === "login" ? (
              <div>
                <h3 className="text-xl font-semibold mb-6">Welcome back</h3>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <Button variant="link" type="button" className="text-sm p-0 h-auto">
                        Forgot password?
                      </Button>
                    </div>

                    <Button 
                      onClick={ () => console.log("Button was clicked!") }
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
                      disabled={loginMutation.isPending}
                      >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" type="button" className="w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="mr-2">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" type="button" className="w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M16 3c-2.1.5-4.2 1.7-5.4 3.8-.7 1.3-1.2 3.2-1 5.2.4 3 2 6 5.4 7" />
                          <path d="M12 20v-5" />
                          <path d="M10 5.5v13" />
                          <path d="M14 17.5a9 9 0 0 0 7 .8c-1.7-2.5-2-5.5-1-8.2.1 0 .2 0 .3.2.2.2.5.3.7.2.3-.1.4-.3.4-.3l.4-1.1c0-.2 0-.5-.2-.6-.2-.1-.5-.2-.8-.1A9 9 0 0 0 14 5.5" />
                        </svg>
                        Apple
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="mt-6 text-center text-sm text-neutral-600">
                  Don't have an account?{" "}
                  <Button variant="link" type="button" className="p-0 h-auto text-amber-600 hover:text-amber-700" onClick={() => setActiveTab("register")}>
                    Register here
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-6">Create an account</h3>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the <Button variant="link" className="p-0 h-auto">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
                      disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-6 text-center text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Button variant="link" type="button" className="p-0 h-auto text-amber-600 hover:text-amber-700" onClick={() => setActiveTab("login")}>
                    Login here
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Hero side */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-amber-600 to-amber-800 text-white p-8 md:p-12 flex items-center">
        <div className="max-w-lg">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Discover a World of Books at Your Fingertips</h1>
          <p className="text-lg opacity-90 mb-6">
            Join BookBuddy today and gain access to thousands of books. Borrow, read, and return - all in one simple platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Extensive Collection</h3>
                <p className="opacity-80">Browse through thousands of books across all genres</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Easy Borrowing</h3>
                <p className="opacity-80">Simple process to borrow and return books</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Personal Dashboard</h3>
                <p className="opacity-80">Track your borrowed books and reading history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
