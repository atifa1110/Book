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
