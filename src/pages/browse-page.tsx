import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import BookCard from "@/components/book-card";
import BookListItem from "@/components/book-list-item";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { GridIcon, ListIcon, Search } from "lucide-react";

export default function BrowsePage() {
  // State for filters and pagination
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch books with filters
  const { data: books, isLoading, isError } = useQuery<Book[]>({
    queryKey: ["/api/books", { search, availableOnly, selectedGenres, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      let url = `/api/books?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (availableOnly) url += "&available=true";
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => {
          url += `&genres=${encodeURIComponent(genre)}`;
        });
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch books");
      return await res.json();
    }
  });

  // Handle genre checkbox change
  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearch("");
    setAvailableOnly(false);
    setSelectedGenres([]);
    setSortBy("title");
    setSortOrder("asc");
    setPage(1);
  };

  // List of genres
  const genres = [
    { value: "fiction", label: "Fiction" },
    { value: "non_fiction", label: "Non-Fiction" },
    { value: "science_fiction", label: "Science Fiction" },
    { value: "fantasy", label: "Fantasy" },
    { value: "mystery", label: "Mystery" },
    { value: "biography", label: "Biography" }
  ];

  return (
    <div>
      <div className="bg-neutral-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Browse Books</h1>
          <p className="text-neutral-600">Explore our collection of books available for borrowing</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif font-bold text-lg">Filters</h2>
                <Button variant="link" onClick={handleClearFilters} className="text-primary-800">
                  Clear All
                </Button>
              </div>
              
              {/* Search Box */}
              <div className="mb-6">
                <Label htmlFor="search" className="block text-sm font-medium text-neutral-800 mb-2">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Title, author, ISBN..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Availability Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-sm text-neutral-800 mb-2">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="available" 
                      checked={availableOnly}
                      onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                    />
                    <Label htmlFor="available">Available now</Label>
                  </div>
                </div>
              </div>
              
              {/* Genre Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-sm text-neutral-800 mb-2">Genre</h3>
                <div className="space-y-2">
                  {genres.map(genre => (
                    <div key={genre.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`genre-${genre.value}`} 
                        checked={selectedGenres.includes(genre.value)}
                        onCheckedChange={(checked) => handleGenreChange(genre.value, checked as boolean)}
                      />
                      <Label htmlFor={`genre-${genre.value}`}>{genre.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <Label htmlFor="sort" className="block text-sm font-medium text-neutral-800 mb-2">
                  Sort By
                </Label>
                <Select 
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as "asc" | "desc");
                  }}
                >
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title-asc">Title: A to Z</SelectItem>
                    <SelectItem value="title-desc">Title: Z to A</SelectItem>
                    <SelectItem value="author-asc">Author: A to Z</SelectItem>
                    <SelectItem value="author-desc">Author: Z to A</SelectItem>
                    <SelectItem value="publicationDate-desc">Publication Date: Newest</SelectItem>
                    <SelectItem value="publicationDate-asc">Publication Date: Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Book Grid */}
          <div className="lg:w-3/4">
            <div className="bg-white p-5 rounded-lg shadow-md mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <p className="text-neutral-600 mb-3 sm:mb-0">
                  <span className="font-medium">{books?.length || 0}</span> books found
                </p>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-neutral-600">View:</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={view === "grid" ? "text-primary-800" : "text-neutral-400 hover:text-primary-800"}
                    onClick={() => setView("grid")}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={view === "list" ? "text-primary-800" : "text-neutral-400 hover:text-primary-800"}
                    onClick={() => setView("list")}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              // Loading skeleton
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {Array(6).fill(0).map((_, index) => (
                  view === "grid" ? (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 animate-pulse">
                      <div className="relative">
                        <div className="w-full book-cover bg-gray-300" />
                      </div>
                      <div className="p-4">
                        <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition-shadow duration-200 animate-pulse">
                      <div className="sm:w-1/5">
                        <div className="w-32 h-48 bg-gray-300 rounded-md" />
                      </div>
                      <div className="sm:w-4/5">
                        <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
                        <div className="h-16 bg-gray-300 rounded mb-4"></div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-6 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-red-500 mb-2">Error loading books.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : books && books.length > 0 ? (
              <>
                {/* Grid View */}
                {view === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map(book => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-4">
                    {books.map(book => (
                      <BookListItem key={book.id} book={book} />
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                      />
                    </PaginationItem>
                    
                    {[...Array(5)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(index + 1);
                          }}
                          isActive={page === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-neutral-600 mb-2">No books found matching your criteria.</p>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
