"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  CreditCard, 
  Landmark, 
  PlusCircle, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Wallet,
  PiggyBank,
  RefreshCw
} from "lucide-react"
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
import { addAccount, deleteAccount, updateAccount } from "@/services/accounts"
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
import { useCurrency } from "@/hooks/use-currency"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/hooks/use-transactions"

const accountSchema = z.object({
  type: z.string().min(1, "Account type is required"),
  provider: z.string().min(1, "Provider is required"),
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
  accountNumber: z.string().optional(),
  color: z.string().default("blue"),
})

const iconMap: { [key: string]: React.ReactElement } = {
  Checking: <Landmark className="h-5 w-5" />,
  Savings: <PiggyBank className="h-5 w-5" />,
  "Credit Card": <CreditCard className="h-5 w-5" />,
  Investment: <TrendingUp className="h-5 w-5" />,
  Loan: <DollarSign className="h-5 w-5" />,
};

const colorMap: { [key: string]: string } = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
}

// Account Statistics Component
function AccountStatistics({ accounts, showBalance }: { accounts: any[], showBalance: boolean }) {
  const { formatCurrency } = useCurrency();
  
  const totalBalance = accounts.reduce((acc, account) => 
    account.type !== 'Credit Card' && account.type !== 'Loan' ? acc + account.balance : acc - account.balance, 0
  );
  
  const totalAssets = accounts
    .filter(acc => acc.type !== 'Credit Card' && acc.type !== 'Loan')
    .reduce((acc, account) => acc + account.balance, 0);
  
  const totalLiabilities = accounts
    .filter(acc => acc.type === 'Credit Card' || acc.type === 'Loan')
    .reduce((acc, account) => acc + account.balance, 0);

  const stats = [
    {
      label: "Total Balance",
      value: showBalance ? formatCurrency(totalBalance) : "••••••",
      description: "Net worth",
      icon: Wallet,
      trend: 12.5,
      color: "text-blue-600"
    },
    {
      label: "Total Assets",
      value: showBalance ? formatCurrency(totalAssets) : "••••••",
      description: "All accounts",
      icon: TrendingUp,
      trend: 8.2,
      color: "text-green-600"
    },
    {
      label: "Total Liabilities",
      value: showBalance ? formatCurrency(totalLiabilities) : "••••••",
      description: "Debts & credit",
      icon: TrendingDown,
      trend: -3.1,
      color: "text-orange-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="card-compact">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                    stat.trend >= 0 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20"
                  )}>
                    {stat.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(stat.trend)}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </div>
              <div className={cn("p-2 rounded-lg", stat.trend >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { accounts, loading, refreshAccounts } = useAccounts()
  const { transactions } = useTransactions()
  const { formatCurrency } = useCurrency();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<any>(null)
  const [deletingAccount, setDeletingAccount] = React.useState<any>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showBalance, setShowBalance] = React.useState(true);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: "Checking",
      provider: "",
      balance: 0,
      accountNumber: "",
      color: "blue",
    },
  });

  const editForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
  });

  React.useEffect(() => {
    if (editingAccount) {
      editForm.reset(editingAccount);
    }
  }, [editingAccount, editForm]);

  async function handleAddAccount(values: z.infer<typeof accountSchema>) {
    try {
      await addAccount(values)
      form.reset()
      setAddDialogOpen(false)
      toast({ 
        title: "Success", 
        description: "Account added successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error("Error adding account:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to add account." 
      })
    }
  }

  async function handleEditAccount(values: z.infer<typeof accountSchema>) {
    if (!editingAccount) return;
    
    try {
      await updateAccount(editingAccount.id, values)
      setEditDialogOpen(false)
      setEditingAccount(null)
      toast({ 
        title: "Success", 
        description: "Account updated successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error("Error updating account:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update account." 
      })
    }
  }

  async function handleDeleteAccount(id: string) {
    setIsDeleting(true);
    try {
      await deleteAccount(id);
      toast({ 
        title: "Success", 
        description: "Account deleted successfully." 
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete account." 
      });
    } finally {
      setIsDeleting(false);
      setDeletingAccount(null);
    }
  }

  async function handleRefreshAccounts() {
    setIsRefreshing(true);
    try {
      if (refreshAccounts) {
        await refreshAccounts();
      }
      toast({
        title: "Accounts Refreshed",
        description: "Your account data has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Unable to refresh account data.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  function getAccountActivity(accountId: string) {
    return transactions.filter(t => t.accountId === accountId).length;
  }

  function getAccountTypeColor(type: string) {
    const colors = {
      'Checking': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Savings': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Credit Card': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Investment': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Loan': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  const accountTypes = [
    { value: "Checking", label: "Checking Account" },
    { value: "Savings", label: "Savings Account" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Investment", label: "Investment Account" },
    { value: "Loan", label: "Loan Account" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and track balances</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2">
            <Label htmlFor="balance-toggle" className="text-sm text-muted-foreground cursor-pointer">
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Label>
            <Switch
              id="balance-toggle"
              checked={showBalance}
              onCheckedChange={setShowBalance}
              className="scale-90"
            />
          </div>
          <Button variant="outline" onClick={handleRefreshAccounts} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Link a new financial account to track your finances.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddAccount)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  {iconMap[type.value] || <Wallet className="h-4 w-4" />}
                                  {type.label}
                                </div>
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
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank/Provider Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chase Bank, PayPal, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Last 4 digits" {...field} />
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
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(colorMap).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-4 w-4 rounded-full", value)} />
                                  <span className="capitalize">{key}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full sm:w-auto">Add Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Statistics */}
      {!loading && accounts.length > 0 && (
        <AccountStatistics accounts={accounts} showBalance={showBalance} />
      )}

      {/* Accounts Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first financial account</p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <Card key={account.id} className="group hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        colorMap[account.color as string] || colorMap.blue,
                        "text-white"
                      )}>
                        {iconMap[account.type] || <Wallet className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{account.provider}</CardTitle>
                        <CardDescription className="text-xs">{account.type}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingAccount(account);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeletingAccount(account)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently delete this account. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingAccount(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deletingAccount && handleDeleteAccount(deletingAccount.id)}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {account.accountNumber && (
                  <Badge variant="outline" className="w-fit text-xs mt-2">
                    ****{account.accountNumber.slice(-4)}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{showBalance ? formatCurrency(account.balance) : "••••••"}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Available balance</span>
                    <span>{getAccountActivity(account.id)} transactions</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Badge variant="secondary" className={cn("text-xs", getAccountTypeColor(account.type))}>
                  {account.type}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update your account information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditAccount)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {iconMap[type.value] || <Wallet className="h-4 w-4" />}
                              {type.label}
                            </div>
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
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank/Provider Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={editForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Last 4 digits" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                <FormField
                    control={editForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(colorMap).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-4 w-4 rounded-full", value)} />
                                  <span className="capitalize">{key}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              <DialogFooter>
                <Button type="submit">Update Account</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
