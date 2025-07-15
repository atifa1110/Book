import { Book } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookListItemProps {
  book: Book;
}

export default function BookListItem({ book }: BookListItemProps) {
  // Format genre for display
  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition-shadow duration-200">
      <div className="sm:w-1/5 relative">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-32 h-48 object-cover mx-auto sm:mx-0"
        />
        <Badge 
          className={`absolute top-2 right-2 sm:top-0 sm:right-0 ${book.available 
            ? 'bg-green-500 hover:bg-green-500' 
            : 'bg-yellow-500 hover:bg-yellow-500'}`}
        >
          {book.available ? 'Available' : 'On Loan'}
        </Badge>
      </div>
      <div className="sm:w-4/5">
        <h3 className="font-serif font-bold text-lg">{book.title}</h3>
        <p className="text-neutral-600 mb-2">{book.author}</p>
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{book.synopsis}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-neutral-100 hover:bg-neutral-100">
            {formatGenre(book.genre)}
          </Badge>
          {book.language && (
            <Badge variant="outline" className="bg-neutral-100 hover:bg-neutral-100">
              {book.language}
            </Badge>
          )}
          {book.publicationDate && (
            <Badge variant="outline" className="bg-neutral-100 hover:bg-neutral-100">
              {book.publicationDate.split(',')[1] || book.publicationDate}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            <span className="font-medium">ISBN:</span> {book.isbn}
          </div>
          <Button asChild variant="link">
            <Link href={`/books/${book.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
