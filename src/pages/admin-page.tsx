import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Book, BookLoan, insertBookSchema, genreEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Convert genre enum to an array for select options
const genreOptions = Object.keys(genreEnum.enumValues).map(genre => ({
  value: genre,
  label: genre.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

type BookLoanWithDetails = BookLoan & { 
  book: Book,
  user: { name: string, email: string }
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Create book form schema
  const bookFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    isbn: z.string().min(10, "ISBN must be at least 10 characters"),
    publisher: z.string().min(1, "Publisher is required"),
    publicationDate: z.string().min(1, "Publication date is required"),
    genre: z.string().min(1, "Genre is required"),
    synopsis: z.string().min(10, "Synopsis must be at least 10 characters"),
    coverImage: z.string().url("Cover image must be a valid URL"),
    pages: z.coerce.number().int().positive("Pages must be a positive number"),
    language: z.string().min(1, "Language is required"),
    totalCopies: z.coerce.number().int().positive("Total copies must be a positive number"),
    availableCopies: z.coerce.number().int().min(0, "Available copies cannot be negative"),
  });

  // Form for adding/editing books
  const bookForm = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publicationDate: "",
      genre: "",
      synopsis: "",
      coverImage: "",
      pages: 1,
      language: "English",
      totalCopies: 1,
      availableCopies: 1,
    }
  });

  // Fetch all books
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return await res.json();
    }
  });

  // Fetch all loans
  const { data: loans, isLoading: loansLoading } = useQuery<BookLoanWithDetails[]>({
    queryKey: ["/api/admin/loans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/loans");
      if (!res.ok) throw new Error("Failed to fetch loans");
      return await res.json();
    }
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (bookData: z.infer<typeof bookFormSchema>) => {
      await apiRequest("POST", "/api/admin/books", bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsAddBookOpen(false);
      bookForm.reset();
      toast({
        title: "Book added",
        description: "The book has been successfully added to the library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding book",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Edit book mutation
  const editBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof bookFormSchema> }) => {
      await apiRequest("PUT", `/api/admin/books/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setBookToEdit(null);
      bookForm.reset();
      toast({
        title: "Book updated",
        description: "The book has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating book",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setBookToDelete(null);
      toast({
        title: "Book deleted",
        description: "The book has been successfully deleted from the library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting book",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update loan status mutation
  const updateLoanStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PUT", `/api/admin/loans/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: "Loan status updated",
        description: "The loan status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating loan status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle book form submission
  const onBookFormSubmit = (data: z.infer<typeof bookFormSchema>) => {
    if (bookToEdit) {
      editBookMutation.mutate({ id: bookToEdit.id, data });
    } else {
      addBookMutation.mutate(data);
    }
  };

  // Open edit dialog and populate form
  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    bookForm.reset({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationDate: book.publicationDate,
      genre: book.genre,
      synopsis: book.synopsis,
      coverImage: book.coverImage,
      pages: book.pages || 1,
      language: book.language,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>;
      case "borrowed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Borrowed</Badge>;
      case "returned":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100">Returned</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-12">
      <div className="bg-neutral-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage books, users, and borrowing requests</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="books">
          <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
            <TabsTrigger value="books">Book Management</TabsTrigger>
            <TabsTrigger value="loans">Loan Management</TabsTrigger>
          </TabsList>
          
          {/* Books Tab */}
          <TabsContent value="books">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Library Books</CardTitle>
                  <CardDescription>Manage your book collection</CardDescription>
                </div>
                
                <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new book below.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...bookForm}>
                      <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <form onSubmit={bookForm.handleSubmit(onBookFormSubmit)} className="space-y-4 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Book title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                  <Input placeholder="Author name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="isbn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ISBN</FormLabel>
                                <FormControl>
                                  <Input placeholder="ISBN number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="publisher"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publisher</FormLabel>
                                <FormControl>
                                  <Input placeholder="Publisher name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="publicationDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publication Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., January 15, 2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="genre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Genre</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a genre" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {genreOptions.map(genre => (
                                      <SelectItem key={genre.value} value={genre.value}>
                                        {genre.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="pages"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pages</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="totalCopies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Copies</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="availableCopies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Available Copies</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={bookForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., English" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter a URL for the book cover image
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="synopsis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Synopsis</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Book description" 
                                  rows={4}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={addBookMutation.isPending}
                          >
                            {addBookMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Book"
                            )}
                          </Button>
                        </DialogFooter>
                        </form>
                      </div>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                {/* Edit Book Dialog */}
                <Dialog open={!!bookToEdit} onOpenChange={(open) => !open && setBookToEdit(null)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Book</DialogTitle>
                      <DialogDescription>
                        Update the details for this book.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...bookForm}>
                    <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <form onSubmit={bookForm.handleSubmit(onBookFormSubmit)} className="space-y-4 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Book title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                  <Input placeholder="Author name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="isbn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ISBN</FormLabel>
                                <FormControl>
                                  <Input placeholder="ISBN number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="publisher"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publisher</FormLabel>
                                <FormControl>
                                  <Input placeholder="Publisher name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="publicationDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publication Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., January 15, 2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="genre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Genre</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a genre" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {genreOptions.map(genre => (
                                      <SelectItem key={genre.value} value={genre.value}>
                                        {genre.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={bookForm.control}
                            name="pages"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pages</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="totalCopies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Copies</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={bookForm.control}
                            name="availableCopies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Available Copies</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={bookForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., English" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter a URL for the book cover image
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="synopsis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Synopsis</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Book description" 
                                  rows={4}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={editBookMutation.isPending}
                          >
                            {editBookMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Book"
                            )}
                          </Button>
                        </DialogFooter>
                        </form>
                      </div>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                {/* Delete Book Dialog */}
                <AlertDialog
                  open={!!bookToDelete}
                  onOpenChange={(open) => !open && setBookToDelete(null)}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the book
                        "{bookToDelete?.title}" from the library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => bookToDelete && deleteBookMutation.mutate(bookToDelete.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteBookMutation.isPending}
                      >
                        {deleteBookMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              
              <CardContent>
                {booksLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-800" />
                    <p>Loading books...</p>
                  </div>
                ) : books && books.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cover</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Availability</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map(book => (
                          <TableRow key={book.id}>
                            <TableCell>
                              <img 
                                src={book.coverImage} 
                                alt={book.title} 
                                className="w-12 h-16 object-cover rounded-md"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>
                              {book.genre.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </TableCell>
                            <TableCell>
                              {book.available ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Available ({book.availableCopies}/{book.totalCopies})
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  Unavailable (0/{book.totalCopies})
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditBook(book)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => setBookToDelete(book)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-neutral-600 mb-4">No books found in the library.</p>
                    <Button onClick={() => setIsAddBookOpen(true)}>Add Your First Book</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Loans Tab */}
          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Requests and Management</CardTitle>
                <CardDescription>Manage borrowing requests and active loans</CardDescription>
              </CardHeader>
              
              <CardContent>
                {loansLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-800" />
                    <p>Loading loan data...</p>
                  </div>
                ) : loans && loans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Borrowed Date</TableHead>s
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loans.map(loan => (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.book.title}</TableCell>
                            <TableCell>{loan.user.name}<br/><span className="text-xs text-neutral-500">{loan.user.email}</span></TableCell>
                            <TableCell>{format(new Date(loan.borrowDate), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{format(new Date(loan.dueDate), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {loan.status === "pending" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 hover:text-green-800"
                                      onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: "approved" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800"
                                      onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: "rejected" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {loan.status === "approved" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: "borrowed" })}
                                  >
                                    Mark as Borrowed
                                  </Button>
                                )}
                                {loan.status === "borrowed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: "returned" })}
                                  >
                                    Mark as Returned
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-neutral-600">No loan requests found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
