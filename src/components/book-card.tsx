import { Book } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  // Format genre for display
  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full book-cover"
        />
        <Badge 
          className={`availability-badge ${book.available 
            ? 'bg-green-500 hover:bg-green-500' 
            : 'bg-yellow-500 hover:bg-yellow-500'}`}
        >
          {book.available ? 'Available' : 'On Loan'}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-serif font-bold text-lg mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-neutral-600 text-sm mb-3">{book.author}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">{formatGenre(book.genre)}</span>
          <Button asChild variant="link" className="text-sm h-auto p-0">
            <Link href={`/books/${book.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
