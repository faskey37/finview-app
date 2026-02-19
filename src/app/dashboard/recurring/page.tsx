"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2, Edit2, Calendar, Clock, TrendingUp, TrendingDown, Bell, Info, AlertTriangle } from "lucide-react"
import { useRecurring } from "@/hooks/use-recurring"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRecurringTransaction,  getRecurringTransactions } from "@/services/recurring"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, addDays, isBefore, differenceInDays, isToday } from "date-fns"
import { useCurrency } from "@/hooks/use-currency"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const recurringSchema = z.object({
  description: z.string().min(1, "Description is required").max(50, "Description too long"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  notifyBeforeDays: z.coerce.number().min(0).max(30).default(0),
  isActive: z.boolean().default(true),
})

type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: string;
  startDate: string;
  lastProcessed?: string;
  notifyBeforeDays?: number;
  isActive?: boolean;
}

export default function RecurringPage() {
  const { recurring, loading, refetch } = useRecurring()
  const { formatCurrency } = useCurrency();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedTransaction, setSelectedTransaction] = React.useState<RecurringTransaction | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("all")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof recurringSchema>>({
    resolver: zodResolver(recurringSchema),
    defaultValues: { 
      description: "", 
      amount: 0, 
      type: "expense", 
      category: "", 
      frequency: "monthly",
      startDate: new Date().toISOString().split('T')[0],
      notifyBeforeDays: 0,
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof recurringSchema>>({
    resolver: zodResolver(recurringSchema),
    defaultValues: { 
      description: "", 
      amount: 0, 
      type: "expense", 
      category: "", 
      frequency: "monthly",
      startDate: new Date().toISOString().split('T')[0],
      notifyBeforeDays: 0,
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (selectedTransaction && editDialogOpen) {
      editForm.reset({
        description: selectedTransaction.description,
        amount: selectedTransaction.amount,
        type: selectedTransaction.type,
        category: selectedTransaction.category,
        frequency: selectedTransaction.frequency as any,
        startDate: selectedTransaction.startDate,
        notifyBeforeDays: selectedTransaction.notifyBeforeDays || 0,
        isActive: selectedTransaction.isActive ?? true,
      });
    }
  }, [selectedTransaction, editDialogOpen, editForm]);

  const categories = {
    expense: [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Housing",
      "Utilities",
      "Entertainment",
      "Health & Fitness",
      "Education",
      "Subscriptions",
      "Insurance",
      "Personal Care",
      "Travel",
      "Gifts & Donations",
      "Debt Payments",
      "Other Expenses"
    ],
    income: [
      "Salary",
      "Freelance",
      "Investment",
      "Rental Income",
      "Business Income",
      "Side Hustle",
      "Government Benefits",
      "Royalties",
      "Other Income"
    ]
  }

  const frequencyLabels = {
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly"
  }

  const getNextDueDate = (transaction: RecurringTransaction) => {
    const startDate = parseISO(transaction.startDate);
    const lastProcessed = transaction.lastProcessed ? parseISO(transaction.lastProcessed) : startDate;
    let nextDate = lastProcessed;
    
    switch (transaction.frequency) {
      case 'daily':
        nextDate = addDays(lastProcessed, 1);
        break;
      case 'weekly':
        nextDate = addDays(lastProcessed, 7);
        break;
      case 'biweekly':
        nextDate = addDays(lastProcessed, 14);
        break;
      case 'monthly':
        nextDate = addDays(lastProcessed, 30);
        break;
      case 'quarterly':
        nextDate = addDays(lastProcessed, 90);
        break;
      case 'yearly':
        nextDate = addDays(lastProcessed, 365);
        break;
      default:
        nextDate = addDays(lastProcessed, 30);
    }
    
    return nextDate;
  }

  const getDaysUntilDue = (transaction: RecurringTransaction) => {
    const nextDue = getNextDueDate(transaction);
    const today = new Date();
    return differenceInDays(nextDue, today);
  }

  async function handleAddRecurring(values: z.infer<typeof recurringSchema>) {
    setIsSubmitting(true);
    try {
      await addRecurringTransaction(values);
      form.reset({
        ...form.formState.defaultValues,
        startDate: new Date().toISOString().split('T')[0],
      });
      setAddDialogOpen(false);
      await refetch();
      toast({ 
        title: "Recurring transaction created", 
        description: `${values.description} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding recurring transaction:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to add recurring transaction. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditRecurring(values: z.infer<typeof recurringSchema>) {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    try {
      await addRecurringTransaction({
        ...values,
        id: selectedTransaction.id,
      });
      setEditDialogOpen(false);
      setSelectedTransaction(null);
      await refetch();
      toast({ 
        title: "Transaction updated", 
        description: `${values.description} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update transaction. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRecurring(id: string) {
    setIsDeleting(true);
    try {
      await getRecurringTransactions(id);
      await refetch();
      toast({ 
        title: "Transaction deleted", 
        description: "Recurring transaction has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete transaction. Please try again." 
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await addRecurringTransaction({
        id,
        isActive: !isActive,
      } as any);
      await refetch();
      toast({ 
        title: isActive ? "Transaction paused" : "Transaction resumed",
        description: `Transaction has been ${isActive ? 'paused' : 'resumed'}.`,
      });
    } catch (error) {
      console.error("Error toggling transaction:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update transaction status." 
      });
    }
  }

  const recurringWithDetails = recurring.map(transaction => {
    const nextDue = getNextDueDate(transaction);
    const daysUntilDue = getDaysUntilDue(transaction);
    const isDueSoon = daysUntilDue <= (transaction.notifyBeforeDays || 0) && daysUntilDue > 0;
    const isOverdue = daysUntilDue < 0;
    
    return {
      ...transaction,
      nextDue,
      daysUntilDue,
      isDueSoon,
      isOverdue,
      status: isOverdue ? "overdue" : isDueSoon ? "dueSoon" : "upcoming",
      isActive: transaction.isActive ?? true,
    };
  });

  const filteredTransactions = recurringWithDetails.filter(transaction => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return transaction.isActive !== false;
    if (activeTab === "paused") return transaction.isActive === false;
    if (activeTab === "dueSoon") return transaction.status === "dueSoon" || transaction.status === "overdue";
    if (activeTab === "income") return transaction.type === "income";
    return transaction.type === "expense";
  });

  const totalMonthlyValue = recurringWithDetails
    .filter(t => t.isActive !== false)
    .reduce((sum, transaction) => {
      let multiplier = 1;
      switch (transaction.frequency) {
        case 'daily': multiplier = 30; break;
        case 'weekly': multiplier = 4.33; break;
        case 'biweekly': multiplier = 2.17; break;
        case 'monthly': multiplier = 1; break;
        case 'quarterly': multiplier = 0.33; break;
        case 'yearly': multiplier = 0.083; break;
      }
      const value = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      return sum + (value * multiplier);
    }, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
            <p className="text-muted-foreground mt-2">
              Automate your financial tracking with recurring income and expenses
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Recurring Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Recurring Transaction</DialogTitle>
                <DialogDescription>
                  Set up automatic tracking for regular income or expenses.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddRecurring)} className="space-y-4">
                  <FormField 
                    control={form.control} 
                    name="description" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Netflix Subscription, Salary, Rent Payment" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      control={form.control} 
                      name="amount" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                              <Input 
                                type="number" 
                                step="0.01" 
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
                      name="type" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="expense" className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-destructive" />
                                Expense
                              </SelectItem>
                              <SelectItem value="income" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Income
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      control={form.control} 
                      name="category" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories[form.watch("type") || "expense"].map((category) => (
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
                      name="frequency" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      control={form.control} 
                      name="startDate" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <FormField 
                      control={form.control} 
                      name="notifyBeforeDays" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              Notify Before (days)
                            </div>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="No notification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">No notification</SelectItem>
                              <SelectItem value="1">1 day before</SelectItem>
                              <SelectItem value="3">3 days before</SelectItem>
                              <SelectItem value="7">1 week before</SelectItem>
                              <SelectItem value="14">2 weeks before</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  </div>

                  <FormField 
                    control={form.control} 
                    name="isActive" 
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Transaction will be tracked automatically
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} 
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Transaction"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">
                  {recurringWithDetails.filter(t => t.isActive !== false).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monthly Impact</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalMonthlyValue >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {totalMonthlyValue >= 0 ? '+' : ''}{formatCurrency(totalMonthlyValue)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {recurringWithDetails.filter(t => t.status === "dueSoon" || t.status === "overdue").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(recurring.reduce((acc, t) => {
                    if (t.type === 'income') return acc + t.amount;
                    return acc - t.amount;
                  }, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 w-[600px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="dueSoon">Due Soon</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recurring Transactions</CardTitle>
            <CardDescription>
              Manually tracked recurring items. For AI-powered subscription detection, visit the Subscriptions page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category & Frequency</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((item) => (
                      <TableRow key={item.id} className={cn(
                        !item.isActive && "opacity-60",
                        item.status === "overdue" && "bg-destructive/10"
                      )}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              item.type === 'income' ? "bg-primary" : "bg-destructive",
                              !item.isActive && "bg-muted"
                            )} />
                            <div className="space-y-1">
                              <p className="font-medium">{item.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Started {format(parseISO(item.startDate), "MMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={item.type === 'income' ? 'success' : 'secondary'}>
                              {item.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {frequencyLabels[item.frequency as keyof typeof frequencyLabels] || item.frequency}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "font-medium",
                                    item.status === "overdue" && "text-destructive",
                                    item.status === "dueSoon" && "text-yellow-600"
                                  )}>
                                    {format(item.nextDue, "MMM d, yyyy")}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {item.status === "overdue" 
                                      ? `${Math.abs(item.daysUntilDue)} days overdue` 
                                      : item.status === "dueSoon"
                                      ? `${item.daysUntilDue} days remaining`
                                      : `${item.daysUntilDue} days remaining`
                                    }
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {item.status === "dueSoon" && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Due in {item.daysUntilDue} days
                              </Badge>
                            )}
                            {item.status === "overdue" && (
                              <Badge variant="destructive">
                                Overdue by {Math.abs(item.daysUntilDue)} days
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={cn(
                            "font-semibold text-lg",
                            item.type === 'income' ? 'text-primary' : 'text-destructive',
                            !item.isActive && "text-muted-foreground"
                          )}>
                            {item.type === 'expense' && '-'}
                            {formatCurrency(item.amount)}
                          </div>
                          {item.frequency !== "monthly" && (
                            <div className="text-xs text-muted-foreground">
                              ~{formatCurrency(item.type === 'income' ? item.amount : -item.amount)}/mo
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            {item.isActive === false ? (
                              <Badge variant="outline" className="text-muted-foreground border-muted">
                                Paused
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">
                                Active
                              </Badge>
                            )}
                            {item.notifyBeforeDays ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Bell className="h-3 w-3" />
                                {item.notifyBeforeDays}d notice
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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
                                  setSelectedTransaction(item);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleActive(item.id, item.isActive !== false)}
                              >
                                {item.isActive === false ? (
                                  <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Resume
                                  </>
                                ) : (
                                  <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Pause
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteRecurring(item.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? "Deleting..." : "Delete"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 rounded-lg border-2 border-dashed">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recurring Transactions</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  {activeTab === "all" 
                    ? "Add recurring transactions to automate your financial tracking."
                    : `No ${activeTab} recurring transactions found.`
                  }
                </p>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create Recurring Transaction
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </CardContent>
          {recurringWithDetails.some(t => t.status === "dueSoon" || t.status === "overdue") && (
            <CardFooter>
              <div className="w-full">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Upcoming & Overdue</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {recurringWithDetails.filter(t => t.status === "dueSoon").length > 0 && (
                      <span className="text-yellow-600">
                        {recurringWithDetails.filter(t => t.status === "dueSoon").length} due soon
                      </span>
                    )}
                    {recurringWithDetails.filter(t => t.status === "overdue").length > 0 && (
                      <span className="text-destructive">
                        {recurringWithDetails.filter(t => t.status === "overdue").length} overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Recurring Transaction</DialogTitle>
            <DialogDescription>
              Update the details of this recurring transaction.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditRecurring)} className="space-y-4">
              {/* Same form fields as add dialog, but using editForm */}
              <FormField 
                control={editForm.control} 
                name="description" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Netflix Subscription, Salary, Rent Payment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  control={editForm.control} 
                  name="amount" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                
                <FormField 
                  control={editForm.control} 
                  name="type" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense" className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            Expense
                          </SelectItem>
                          <SelectItem value="income" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Income
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  control={editForm.control} 
                  name="category" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories[editForm.watch("type") || "expense"].map((category) => (
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
                  name="frequency" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  control={editForm.control} 
                  name="startDate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                
                <FormField 
                  control={editForm.control} 
                  name="notifyBeforeDays" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notify Before (days)
                        </div>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No notification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No notification</SelectItem>
                          <SelectItem value="1">1 day before</SelectItem>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="7">1 week before</SelectItem>
                          <SelectItem value="14">2 weeks before</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <FormField 
                control={editForm.control} 
                name="isActive" 
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Transaction will be tracked automatically
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} 
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedTransaction(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}