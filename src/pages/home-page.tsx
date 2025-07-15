import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, BookUser } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Loader2 } from "lucide-react";
import BookCard from "@/components/book-card";

export default function HomePage() {
 
  const { data: books, isLoading, isError } = useQuery<Book[]>({
    queryKey: ["/api/books/latest"],
    queryFn: async () => {
      const res = await fetch("/api/books/");
      if (!res.ok) throw new Error("Failed to fetch books");
      const allBooks = await res.json();
      return allBooks.slice(-4); // Return only the last 4 books
    },
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800 mr-2" />
        <p>Loading book details...</p>
      </div>
    );
  }

  if (isError || !books) {
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
    <>
      {/* Hero Section */}
      <div className="relative bg-cover bg-center min-h-[500px] flex items-center"
           style={{
             backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
           }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-white drop-shadow-md">Discover, Borrow, and Read</h1>
            <p className="text-lg md:text-xl text-white opacity-90 mb-8 drop-shadow-md">Access thousands of books from our extensive library collection - all at your fingertips.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-amber-500 text-white hover:bg-amber-600 font-semibold shadow-lg transition-all">
                <Link href="/browse">Browse Books</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-amber-400 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 hover:text-white font-medium shadow-lg">
                <a href="#how-it-works">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">Featured Books</h2>
          <Link href="/browse" className="text-amber-600 hover:text-amber-700 font-medium flex items-center">
            View All <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-15"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Find Books</h3>
              <p className="text-neutral-600">Browse our extensive collection and find books that interest you using our powerful search and filter tools.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Borrow Books</h3>
              <p className="text-neutral-600">Request to borrow available books with just a few clicks. We'll prepare them for pickup at your convenience.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center backdrop-blur-sm bg-white/90">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <BookUser className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Return When Done</h3>
              <p className="text-neutral-600">Enjoy your books and return them by the due date. It's that simple! Keep track of everything in your dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl font-bold mb-3 text-amber-600">5,000+</div>
              <p className="text-black font-medium text-lg">Books Available</p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl font-bold mb-3 text-amber-600">1,200+</div>
              <p className="text-black font-medium text-lg">Happy Users</p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl font-bold mb-3 text-amber-600">100+</div>
              <p className="text-black font-medium text-lg">New Books Monthly</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
