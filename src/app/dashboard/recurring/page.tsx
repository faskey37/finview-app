
"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2, Repeat } from "lucide-react"
import { useRecurring } from "@/hooks/use-recurring"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRecurringTransaction, deleteRecurringTransaction } from "@/services/recurring"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useCurrency } from "@/hooks/use-currency"

const recurringSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().optional(),
})

export default function RecurringPage() {
  const { recurring, loading } = useRecurring()
  const { formatCurrency } = useCurrency();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof recurringSchema>>({
    resolver: zodResolver(recurringSchema),
    defaultValues: { description: "", amount: 0, type: "expense", category: "", frequency: "monthly" },
  });

  async function handleAddRecurring(values: z.infer<typeof recurringSchema>) {
    try {
      await addRecurringTransaction({ ...values, startDate: new Date().toLocaleDateString('en-CA') })
      form.reset()
      setAddDialogOpen(false)
      toast({ title: "Success", description: "Recurring transaction added." })
    } catch (error) {
      console.error("Error adding recurring transaction:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add recurring transaction." })
    }
  }

  async function handleDeleteRecurring(id: string) {
    setIsDeleting(true);
    try {
      await deleteRecurringTransaction(id);
      toast({ title: "Success", description: "Recurring transaction deleted." });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete recurring transaction." });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manual Recurring Transactions</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle />Add Manual Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Recurring Transaction</DialogTitle><DialogDescription>Set up an automatic, recurring income or expense.</DialogDescription></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddRecurring)} className="space-y-4 py-4">
                 <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g. Netflix Subscription" {...field} maxLength={30} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Food">Food</SelectItem><SelectItem value="Transport">Transport</SelectItem><SelectItem value="Shopping">Shopping</SelectItem><SelectItem value="Housing">Housing</SelectItem><SelectItem value="Entertainment">Entertainment</SelectItem><SelectItem value="Health">Health</SelectItem><SelectItem value="Salary">Salary</SelectItem><SelectItem value="Freelance">Freelance</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="frequency" render={({ field }) => (
                    <FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Your Manually Tracked Items</CardTitle>
            <CardDescription>These are recurring transactions you have manually added. For AI-powered subscription tracking, see the "Subscriptions" page.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
            ) : recurring.length > 0 ? (
                <Table>
                    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Frequency</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {recurring.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell><Badge variant={item.type === 'income' ? 'success' : 'secondary'}>{item.category}</Badge></TableCell>
                                <TableCell className="capitalize">{item.frequency}</TableCell>
                                <TableCell className={`text-right font-semibold ${item.type === 'income' ? 'text-primary' : 'text-destructive'}`}>{item.type === 'expense' && '-'}{formatCurrency(item.amount)}</TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive"><Trash2 />Delete</DropdownMenuItem></AlertDialogTrigger>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this recurring transaction.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRecurring(item.id)} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 rounded-lg border-2 border-dashed">
                    <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Recurring Transactions</h3>
                    <p className="text-muted-foreground text-sm">Add a recurring transaction to automate your tracking.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
