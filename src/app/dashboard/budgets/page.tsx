"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2, Edit2, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
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
import { addBudget, deleteBudget, } from "@/services/budgets"
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
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/hooks/use-currency"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Budget } from "@/services/budgets"

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
})

type BudgetWithSpent = Budget & {
  spent: number;
  progress: number;
  status: "under" | "over" | "approaching";
}

export default function BudgetsPage() {
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets()
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedBudget, setSelectedBudget] = React.useState<Budget | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("all")
  const { toast } = useToast()

  const loading = budgetsLoading || transactionsLoading;

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 100,
      period: "monthly",
    },
  });

  const editForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 100,
      period: "monthly",
    },
  });

  React.useEffect(() => {
    if (selectedBudget && editDialogOpen) {
      editForm.reset({
        category: selectedBudget.category,
        amount: selectedBudget.amount,
        period: selectedBudget.period || "monthly",
      });
    }
  }, [selectedBudget, editDialogOpen, editForm]);

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Housing",
    "Entertainment",
    "Health & Fitness",
    "Education",
    "Utilities",
    "Travel",
    "Personal Care",
    "Groceries",
    "Subscriptions",
    "Gifts & Donations",
    "Other"
  ]

  async function handleAddBudget(values: z.infer<typeof budgetSchema>) {
    setIsSubmitting(true);
    try {
      await addBudget(values)
      form.reset()
      setAddDialogOpen(false)
      await refetchBudgets();
      toast({ 
        title: "Budget created", 
        description: `Budget for ${values.category} has been created.`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error adding budget:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to create budget. Please try again." 
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditBudget(values: z.infer<typeof budgetSchema>) {
    if (!selectedBudget) return;
    
    setIsSubmitting(true);
    try {
      await updateBudget(selectedBudget.id, values)
      setEditDialogOpen(false)
      setSelectedBudget(null)
      await refetchBudgets();
      toast({ 
        title: "Budget updated", 
        description: `Budget for ${values.category} has been updated.`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update budget. Please try again." 
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBudget(id: string) {
    setIsDeleting(true);
    try {
      await deleteBudget(id);
      await refetchBudgets();
      toast({ 
        title: "Budget deleted", 
        description: "Budget has been deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete budget. Please try again." 
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const budgetsWithSpent: BudgetWithSpent[] = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    
    const progress = (spent / budget.amount) * 100;
    let status: "under" | "over" | "approaching" = "under";
    
    if (progress > 100) {
      status = "over";
    } else if (progress >= 80) {
      status = "approaching";
    }
    
    return { 
      ...budget, 
      spent,
      progress,
      status
    };
  });

  const filteredBudgets = budgetsWithSpent.filter(budget => {
    if (activeTab === "all") return true;
    if (activeTab === "over") return budget.status === "over";
    if (activeTab === "approaching") return budget.status === "approaching";
    return budget.status === "under";
  });

  const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
  const totalSpent = budgetsWithSpent.reduce((acc, budget) => acc + budget.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress > 100) return "bg-destructive";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  const getStatusIcon = (status: BudgetWithSpent["status"]) => {
    switch (status) {
      case "over":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "approaching":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your spending limits across categories
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a specific category. You can edit this later.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddBudget)} className="space-y-4">
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
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
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
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              step="1" 
                              className="pl-8"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Period</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Budget"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget - totalSpent)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-[400px]">
              <TabsTrigger value="all">All Budgets</TabsTrigger>
              <TabsTrigger value="under">On Track</TabsTrigger>
              <TabsTrigger value="approaching">Approaching</TabsTrigger>
              <TabsTrigger value="over">Over Budget</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground">
            {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredBudgets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBudgets.map(budget => (
              <Card 
                key={budget.id} 
                className={cn(
                  "transition-all hover:shadow-lg",
                  budget.status === "over" && "border-destructive/20",
                  budget.status === "approaching" && "border-yellow-500/20"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {budget.category}
                        {getStatusIcon(budget.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            budget.status === "over" && "border-destructive text-destructive",
                            budget.status === "approaching" && "border-yellow-500 text-yellow-600"
                          )}
                        >
                          {budget.period}
                        </Badge>
                        <span className="text-xs">Limit: {formatCurrency(budget.amount)}</span>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedBudget(budget);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteBudget(budget.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className={cn(
                        "font-medium",
                        budget.status === "over" && "text-destructive"
                      )}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress 
                            value={Math.min(budget.progress, 100)} 
                            className={cn(
                              "h-2",
                              getProgressColor(budget.progress)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{budget.progress.toFixed(1)}% of budget used</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Remaining</p>
                      <p className={cn(
                        "font-semibold",
                        budget.status === "over" && "text-destructive"
                      )}>
                        {formatCurrency(Math.max(0, budget.amount - budget.spent))}
                        {budget.status === "over" && " (Over)"}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-muted-foreground">Utilization</p>
                      <p className="font-semibold">{budget.progress.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full text-center">
                    {budget.status === "over" ? (
                      <Badge variant="destructive" className="w-full justify-center">
                        Over Budget by {formatCurrency(budget.spent - budget.amount)}
                      </Badge>
                    ) : budget.status === "approaching" ? (
                      <Badge variant="outline" className="w-full justify-center border-yellow-500 text-yellow-600">
                        Approaching Limit
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center">
                        On Track
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-16">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Target className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No budgets found</CardTitle>
              <CardDescription className="max-w-md">
                {activeTab === "all" 
                  ? "Get started by creating your first budget to track your spending."
                  : `No ${activeTab === "over" ? "over budget" : activeTab === "approaching" ? "approaching limit" : "on track"} budgets found.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Your First Budget
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Budget Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update your budget details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditBudget)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          step="1" 
                          className="pl-8"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Budget"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function updateBudget(id: any, values: { category?: string; amount?: number; period?: "monthly" | "weekly" | "yearly" }) {
  throw new Error("Function not implemented.")
}
