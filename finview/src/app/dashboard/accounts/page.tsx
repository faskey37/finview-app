"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, CreditCard, Landmark, PlusCircle, MoreHorizontal, Trash2 } from "lucide-react"
import { useAccounts } from "@/hooks/use-accounts"
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
import { addAccount, deleteAccount } from "@/services/accounts"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const accountSchema = z.object({
  type: z.string().min(1, "Account type is required"),
  provider: z.string().min(1, "Provider is required"),
  balance: z.coerce.number(),
})

const iconMap: { [key: string]: React.ReactElement } = {
  Checking: <Landmark className="h-6 w-6 text-muted-foreground" />,
  Savings: <DollarSign className="h-6 w-6 text-muted-foreground" />,
  "Credit Card": <CreditCard className="h-6 w-6 text-muted-foreground" />,
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function AccountsPage() {
  const { accounts, loading } = useAccounts()
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: "Checking",
      provider: "",
      balance: 0,
    },
  });

  async function handleAddAccount(values: z.infer<typeof accountSchema>) {
    try {
      await addAccount(values)
      form.reset()
      setAddDialogOpen(false)
      toast({ title: "Success", description: "Account added successfully." })
    } catch (error) {
      console.error("Error adding account:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add account." })
    }
  }

  async function handleDeleteAccount(id: string) {
    setIsDeleting(true);
    try {
      await deleteAccount(id);
      toast({ title: "Success", description: "Account deleted successfully." });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete account." });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Account</DialogTitle>
              <DialogDescription>
                Link a new financial account.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAccount)} className="space-y-4 py-4">
                 <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Checking">Checking</SelectItem>
                          <SelectItem value="Savings">Savings</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank/Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Account</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{account.type}</CardTitle>
                  <CardDescription>{account.provider}</CardDescription>
                </div>
                 {iconMap[account.type] || <Landmark className="h-6 w-6 text-muted-foreground" />}
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                    <p className="text-xs text-muted-foreground">Available balance</p>
                </div>
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
                            This will permanently delete this account and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAccount(account.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
