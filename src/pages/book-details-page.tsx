import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { apiRequestAuthorization , queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Share2, 
  ArrowLeft, 
  Star, 
  StarHalf,
  Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BookDetails() {
  const { id } = useParams();
  const [_,navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  // Fetch book details
  const { data: book, isLoading, isError } = useQuery<Book>({
    queryKey: [`/api/books/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Book not found");
        }
        throw new Error("Failed to fetch book details");
      }
      return await res.json();
    }
  });
  
  // Borrow book mutation
  const borrowMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await apiRequestAuthorization("POST", `/api/books/${bookId}/borrow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
      toast({
        title: "Borrow request submitted",
        description: "The administrator will review your request soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error borrowing book",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle borrow button click
  const handleBorrow = () => {
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }
    
    if (id !== undefined) { 
      borrowMutation.mutate(parseInt(id));
    }
  };

  // Format genre for display
  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800 mr-2" />
        <p>Loading book details...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
        <p className="mb-6">The book you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/browse">Browse Other Books</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 text-primary-800"
        asChild
      >
        <Link href="/browse">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Link>
      </Button>
    
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full rounded-lg shadow-md book-detail-cover"
          />
          
          <div className="mt-6 space-y-4">
            <Card className="bg-neutral-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3">Book Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">ISBN:</span>
                    <span className="font-mono font-medium">{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Publisher:</span>
                    <span>{book.publisher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Published:</span>
                    <span>{book.publicationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Language:</span>
                    <span>{book.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Pages:</span>
                    <span>{book.pages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={book.available ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Status</h3>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${book.available ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {book.available ? 'Available' : 'On Loan'}
                  </span>
                </div>
                <p className={`text-sm mb-4 ${book.available ? 'text-green-800' : 'text-yellow-800'}`}>
                  {book.available 
                    ? `This book is currently available for borrowing (${book.availableCopies} of ${book.totalCopies} copies available)`
                    : `All copies of this book are currently on loan (0 of ${book.totalCopies} copies available)`
                  }
                </p>
                <Button 
                  className="w-full"
                  disabled={!book.available || borrowMutation.isPending}
                  onClick={handleBorrow}
                >
                  {borrowMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    book.available ? "Borrow This Book" : "Join Waiting List"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h2 className="font-serif font-bold text-2xl mb-2">{book.title}</h2>
          <p className="text-neutral-600 text-lg mb-4">{book.author}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded-full">
              {formatGenre(book.genre)}
            </span>
          </div>
          
          <h3 className="font-serif font-bold text-lg mb-3">Synopsis</h3>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            {book.synopsis}
          </p>
          
          <h3 className="font-serif font-bold text-lg mb-3">Reviews</h3>
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Sarah Johnson</div>
                <div className="flex">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                A masterpiece of literature. The author's prose is both beautiful and powerful, creating an unforgettable reading experience.
              </p>
            </div>
            
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Michael Chen</div>
                <div className="flex">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <StarHalf className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                A fascinating exploration with compelling characters. The plot is engaging and the ending still resonates after you finish reading.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" className="text-primary-800">
              <Heart className="mr-2 h-4 w-4" /> Add to Favorites
            </Button>
            <Button variant="ghost" className="text-neutral-600">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
      
      {/* Login Alert Dialog */}
      <AlertDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to borrow books. Would you like to login or register now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => navigate('/auth')}>
                Login / Register
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
