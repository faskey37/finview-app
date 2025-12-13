
"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2 } from "lucide-react"
import { useBudgets } from "@/hooks/use-budgets"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addBudget, deleteBudget } from "@/services/budgets"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
})

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function BudgetsPage() {
  const { budgets, loading: budgetsLoading } = useBudgets()
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { toast } = useToast()

  const loading = budgetsLoading || transactionsLoading;

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 100,
    },
  });

  async function handleAddBudget(values: z.infer<typeof budgetSchema>) {
    try {
      await addBudget(values)
      form.reset()
      setAddDialogOpen(false)
      toast({ title: "Success", description: "Budget added successfully." })
    } catch (error) {
      console.error("Error adding budget:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add budget." })
    }
  }

  async function handleDeleteBudget(id: string) {
    setIsDeleting(true);
    try {
      await deleteBudget(id);
      toast({ title: "Success", description: "Budget deleted successfully." });
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete budget." });
    } finally {
      setIsDeleting(false);
    }
  }

  const budgetsWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...budget, spent };
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget</DialogTitle>
              <DialogDescription>
                Create a spending limit for a category.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddBudget)} className="space-y-4 py-4">
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Shopping">Shopping</SelectItem>
                          <SelectItem value="Housing">Housing</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Budget</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : budgetsWithSpent.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgetsWithSpent.map(budget => {
            const progress = budget.spent ? (budget.spent / budget.amount) * 100 : 0;
            const isApproachingLimit = progress > 80 && progress <= 100;
            const isOverBudget = progress > 100;
            return (
            <Card key={budget.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                     <AlertDialog>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this budget.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteBudget(budget.id)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    <Progress 
                        value={progress} 
                        className={cn(
                        "h-3",
                        isApproachingLimit && "[&>div]:bg-yellow-500",
                        isOverBudget && "[&>div]:bg-destructive"
                        )}
                    />
                     <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{formatCurrency(budget.spent || 0)} spent</span>
                        <span className={cn(isOverBudget && "text-destructive font-semibold")}>
                           {formatCurrency(budget.amount - (budget.spent || 0))} {isOverBudget ? 'over' : 'left'}
                        </span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                 <p className="text-xs text-muted-foreground">Limit: {formatCurrency(budget.amount)}</p>
              </CardFooter>
            </Card>
          )})}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12">
            <CardHeader>
                <CardTitle>No Budgets Found</CardTitle>
                <CardDescription>Get started by creating a new budget.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Budget
                        </Button>
                    </DialogTrigger>
                    {/* DialogContent is defined above */}
                </Dialog>
            </CardContent>
        </Card>
      )}
    </div>
  )
}
