
"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2, TrendingUp, TrendingDown, Landmark } from "lucide-react"
import { useInvestments } from "@/hooks/use-investments"
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
import { addInvestment, deleteInvestment } from "@/services/investments"
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
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"

const investmentSchema = z.object({
  name: z.string().min(1, "Investment name is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be non-negative"),
  currentValue: z.coerce.number().min(0, "Current value must be non-negative"),
})

export default function InvestmentsPage() {
  const { investments, loading } = useInvestments()
  const { formatCurrency } = useCurrency();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      type: "Stock",
      quantity: 0,
      purchasePrice: 0,
      currentValue: 0,
    },
  });

  async function handleAddInvestment(values: z.infer<typeof investmentSchema>) {
    try {
      await addInvestment({
          ...values,
          purchaseDate: new Date().toLocaleDateString('en-CA')
      })
      form.reset()
      setAddDialogOpen(false)
      toast({ title: "Success", description: "Investment added successfully." })
    } catch (error) {
      console.error("Error adding investment:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add investment." })
    }
  }

  async function handleDeleteInvestment(id: string) {
    setIsDeleting(true);
    try {
      await deleteInvestment(id);
      toast({ title: "Success", description: "Investment deleted successfully." });
    } catch (error) {
      console.error("Error deleting investment:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete investment." });
    } finally {
      setIsDeleting(false);
    }
  }
  
  const totalValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
  const totalCost = investments.reduce((acc, inv) => acc + inv.purchasePrice, 0);
  const totalGainLoss = totalValue - totalCost;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Investment</DialogTitle>
              <DialogDescription>
                Track a new investment in your portfolio.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddInvestment)} className="space-y-4 py-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apple Inc. / Bitcoin" {...field} />
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
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Stock">Stock</SelectItem>
                          <SelectItem value="Crypto">Crypto</SelectItem>
                          <SelectItem value="ETF">ETF</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity / Shares</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Purchase Cost</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Total Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Investment</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                     {totalGainLoss >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                </CardHeader>
                <CardContent>
                     <div className={cn("text-2xl font-bold", totalGainLoss >= 0 ? "text-primary" : "text-destructive")}>{formatCurrency(totalGainLoss)}</div>
                </CardContent>
            </Card>
        </div>


      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : investments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map(investment => {
              const gainLoss = investment.currentValue - investment.purchasePrice;
              const gainLossPercent = investment.purchasePrice > 0 ? (gainLoss / investment.purchasePrice) * 100 : 0;
            
             return (
            <Card key={investment.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <Image
                            src={`https://picsum.photos/seed/${investment.name}/48`}
                            width={48}
                            height={48}
                            alt={investment.name}
                            className="rounded-full"
                            data-ai-hint={`${investment.type} logo`}
                        />
                        <AlertDialog>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 />
                                    Delete
                                </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this investment.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteInvestment(investment.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <CardTitle className="text-lg">{investment.name}</CardTitle>
                    <CardDescription>{investment.quantity} {investment.type === 'Stock' ? 'shares' : ''}</CardDescription>
                </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold">{formatCurrency(investment.currentValue)}</span>
                    <div className={cn("flex items-center text-sm font-semibold", gainLoss >= 0 ? 'text-primary' : 'text-destructive')}>
                         {gainLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
                         {gainLossPercent.toFixed(2)}%
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Cost: {formatCurrency(investment.purchasePrice)} &bull; P/L: {formatCurrency(gainLoss)}
                </p>
              </CardContent>
              <CardFooter>
                 <p className="text-xs text-muted-foreground">Purchased on {investment.purchaseDate}</p>
              </CardFooter>
            </Card>
          )})}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
            <CardHeader className="items-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No Investments Found</CardTitle>
                <CardDescription>Get started by adding a new investment.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                        <PlusCircle />
                        Add Investment
                        </Button>
                    </DialogTrigger>
                </Dialog>
            </CardContent>
        </Card>
      )}
    </div>
  )
}
