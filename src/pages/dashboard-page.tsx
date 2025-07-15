import { useQuery, useMutation } from "@tanstack/react-query";
import { BookLoan, Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInDays } from "date-fns";
import { apiRequestAuthorization, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Book as BookIcon, Clock, BookOpen } from "lucide-react";

type BookLoanWithBook = BookLoan & { book: Book };

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
// Fetch current loans
  const { data: currentLoans, isLoading: loansLoading } = useQuery<BookLoanWithBook[]>({
  queryKey: ["/api/user/loans"],
  queryFn: async () => {
    const token = localStorage.getItem("accessToken"); // pastikan token disimpan di localStorage
    const res = await fetch("/api/user/loans", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch current loans");
    const data = await res.json();
    console.log("Fetched currentLoans:", data); // ⬅️ Log actual data
    return data;
  }
});

// Fetch loan history
const { data: loanHistory, isLoading: historyLoading } = useQuery<BookLoanWithBook[]>({
  queryKey: ["/api/user/history"],
  queryFn: async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("/api/user/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch loan history");
    return await res.json();
  }
});

  
  // Return book mutation
  const returnMutation = useMutation({
    mutationFn: async (loanId: number) => {
      await apiRequestAuthorization("POST", `/api/loans/${loanId}/return`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/history"] });
      toast({
        title: "Book returned",
        description: "The book has been successfully returned.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error returning book",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Calculate dashboard summary
  const currentlyBorrowed = currentLoans?.filter(loan => loan.status === "borrowed")?.length || 0;
  const dueSoon = currentLoans?.filter(loan => {
    if (loan.status !== "borrowed") return false;
    const daysUntilDue = differenceInDays(new Date(loan.dueDate), new Date());
    return daysUntilDue <= 3 && daysUntilDue >= 0;
  })?.length || 0;
  const totalRead = loanHistory?.filter(loan => loan.status === "returned")?.length || 0;
  
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
  
  // Get due date status
  const getDueDateStatus = (dueDate: Date | string, status: string) => {
    if (status === "returned") {
      return null;
    }
    console.log("Due Date: ",dueSoon)
    const due = new Date(dueDate);
    const today = new Date();

    if (isNaN(due.getTime())) {
      // Invalid date string
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Invalid Due Date</Badge>;
    }

    const daysUntilDue = differenceInDays(due, today);
    
    if (daysUntilDue < 0) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Overdue by {Math.abs(daysUntilDue)} days</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Due in {daysUntilDue} days</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Due in {daysUntilDue} days</Badge>;
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-12">
      <div className="bg-neutral-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">My Dashboard</h1>
          <p className="text-neutral-600">Manage your borrowed books and account</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Summary */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm">Currently Borrowed</p>
                    <h3 className="text-3xl font-bold text-primary-800 mt-1">{currentlyBorrowed}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <BookIcon className="h-6 w-6 text-primary-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm">Books Due Soon</p>
                    <h3 className="text-3xl font-bold text-yellow-500 mt-1">{dueSoon}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm">Total Books Read</p>
                    <h3 className="text-3xl font-bold text-secondary-500 mt-1">{totalRead}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-secondary-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="current">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="current">Current Loans</TabsTrigger>
                <TabsTrigger value="history">Borrowing History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                <Card>
                  <CardHeader>
                    <CardTitle>Currently Borrowed Books</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loansLoading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, index) => (
                          <div key={index} className="p-4 border-b border-neutral-200 flex items-start space-x-4 animate-pulse">
                            <div className="w-16 h-24 bg-gray-300 rounded-md" />
                            <div className="flex-1">
                              <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                              <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="mb-2 sm:mb-0">
                                  <div className="h-6 bg-gray-300 rounded w-24"></div>
                                </div>
                                <div className="h-8 bg-gray-300 rounded w-32"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : currentLoans && currentLoans.length > 0 ? (
                      <div className="divide-y divide-neutral-200">
                        {currentLoans.map(loan => (
                          <div key={loan.id} className="p-4 flex items-start space-x-4">
                            <img 
                              src={loan.book.coverImage} 
                              alt={loan.book.title} 
                              className="w-16 h-24 object-cover rounded-md shadow-sm"
                            />
                            <div className="flex-1">
                              <h3 className="font-serif font-bold text-lg mb-1">{loan.book.title}</h3>
                              <p className="text-neutral-600 text-sm mb-3">{loan.book.author}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="mb-2 sm:mb-0 flex gap-2">
                                  {getStatusBadge(loan.status)}
                                  {getDueDateStatus(loan.dueDate, loan.status)}
                                </div>
                                {loan.status === "borrowed" && (
                                  <Button 
                                    onClick={() => returnMutation.mutate(loan.id)}
                                    disabled={returnMutation.isPending}
                                  >
                                    Return Book
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-600 mb-4">You don't have any borrowed books at the moment.</p>
                        <Button asChild>
                          <a href="/browse">Browse Books</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Reading History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-4"></div>
                        {Array(5).fill(0).map((_, index) => (
                          <div key={index} className="h-12 bg-gray-300 rounded mb-2"></div>
                        ))}
                      </div>
                    ) : loanHistory && loanHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Book</TableHead>
                            <TableHead>Borrowed</TableHead>
                            <TableHead>Returned</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loanHistory.map(loan => (
                            <TableRow key={loan.id}>
                              <TableCell className="font-medium">{loan.book.title}</TableCell>
                              <TableCell>{format(new Date(loan.borrowDate), 'MMM d, yyyy')}</TableCell>
                              <TableCell>
                                {loan.returnDate ? format(new Date(loan.returnDate), 'MMM d, yyyy') : '-'}
                              </TableCell>
                              <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-600">You haven't borrowed any books yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center mr-4">
                    <span className="text-primary-800 font-bold text-xl">
                      {user?.name?.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user?.name}</h3>
                    <p className="text-neutral-600 text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <BookIcon className="text-neutral-400 w-5 h-5" />
                    <span className="text-sm text-neutral-600 ml-2">
                      {totalRead} books borrowed
                    </span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* Pending Requests */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loansLoading ? (
                  <div className="mb-4 flex items-start space-x-3 animate-pulse">
                    <div className="w-10 h-14 bg-gray-300 rounded-md" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded mb-1 w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ) : currentLoans?.some(loan => loan.status === "pending") ? (
                  <>
                    {currentLoans
                      .filter(loan => loan.status === "pending")
                      .map(loan => (
                        <div key={loan.id} className="mb-4 flex items-start space-x-3">
                          <img 
                            src={loan.book.coverImage} 
                            alt={loan.book.title} 
                            className="w-10 h-14 object-cover rounded-md shadow-sm"
                          />
                          <div>
                            <h3 className="font-medium text-sm mb-1">{loan.book.title}</h3>
                            <p className="text-neutral-500 text-xs mb-1">
                              Status: <span className="text-yellow-600">Pending approval</span>
                            </p>
                            <p className="text-neutral-500 text-xs">
                              Requested: {format(new Date(loan.borrowDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </>
                ) : (
                  <p className="text-neutral-600 text-sm">No pending requests.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
