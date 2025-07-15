import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, BookOpen, ChevronDown, LogOut, User, History, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Navigation links
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Browse Books", path: "/browse" },
    { label: "My Dashboard", path: "/dashboard", requireAuth: true },
    { label: "Admin", path: "/admin", requireAdmin: true }
  ];

  // Filter navigation links based on user authentication
  const filteredNavLinks = navLinks.filter(link => {
    if (link.requireAdmin && (!user || !user.isAdmin)) return false;
    if (link.requireAuth && !user) return false;
    return true;
  });

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo with Navigation */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-2xl text-amber-600" />
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-primary-800 cursor-pointer">BookBuddy</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation - Now next to the logo */}
          <div className="hidden md:flex items-center ml-6 space-x-6">
            {filteredNavLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`${
                  location === link.path
                    ? "text-amber-600 font-medium"
                    : "text-neutral-800 hover:text-amber-600"
                } transition-colors duration-200`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Empty div to maintain the space-between layout */}
        <div className="hidden md:block"></div>
        
        {/* User Menu / Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none p-1">
                  <Avatar className="w-8 h-8 bg-primary-200 text-primary-800">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    Borrowing History
                  </DropdownMenuItem>
                </Link>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-700"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="link" asChild className="text-amber-600 hover:text-amber-700">
                <Link href="/auth">Login</Link>
              </Button>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="/auth?tab=register">Register</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            className="md:hidden text-neutral-800 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="text-xl" />
            ) : (
              <Menu className="text-xl" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-3">
          <nav className="flex flex-col space-y-3">
            {filteredNavLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`${
                  location === link.path
                    ? "text-amber-600 font-medium"
                    : "text-neutral-800 hover:text-amber-600"
                } py-1`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Add login/register to mobile menu */}
            {!user && (
              <>
                <div className="border-t border-neutral-200 my-2 pt-2"></div>
                <Link 
                  href="/auth"
                  className="text-amber-600 font-medium py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth?tab=register"
                  className="text-amber-600 font-medium py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

