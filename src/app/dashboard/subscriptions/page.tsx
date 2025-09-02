
"use client"
import * as React from "react"
import { useSubscriptions } from "@/hooks/use-recurring"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { generateSubscriptionInsights } from "@/ai/flows/generate-subscription-insight"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import { Loader2, Sparkles, Lightbulb, Repeat, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react"
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
import { addRecurringTransaction, deleteRecurringTransaction } from "@/services/recurring";

const categoryColors: { [key: string]: string } = {
    Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    Software: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    Music: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300",
    Productivity: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Health: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300",
};


export default function SubscriptionsPage() {
    const { subscriptions, loading: subsLoading } = useSubscriptions()
    const { transactions, loading: transLoading } = useTransactions()
    const { isPro } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const { formatCurrency } = useCurrency()

    const [isGenerating, setIsGenerating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const loading = subsLoading || transLoading

    const handleGenerateInsights = async () => {
        if (!isPro) {
            router.push("/dashboard/upgrade");
            return;
        }
        setIsGenerating(true)
        setError(null)
        try {
            const result = await generateSubscriptionInsights({ transactions: JSON.stringify(transactions) });
            
            // Save each insight as a recurring transaction
            for (const insight of result.insights) {
              await addRecurringTransaction({
                description: insight.name,
                amount: insight.monthlyCost,
                type: 'expense',
                category: insight.category,
                frequency: 'monthly',
                startDate: new Date().toLocaleDateString('en-CA'),
                suggestion: insight.suggestion
              });
            }

            toast({ title: "Success", description: "Found subscriptions have been added to your list."})
        } catch (e) {
            console.error(e)
            setError("Failed to generate insights. Please try again later.")
        } finally {
            setIsGenerating(false)
        }
    }
    
    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await deleteRecurringTransaction(id);
            toast({ title: "Success", description: "Subscription deleted successfully." });
        } catch (error) {
            console.error("Error deleting subscription:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete subscription." });
        } finally {
            setIsDeleting(false);
        }
    }

    const totalMonthlyCost = subscriptions.reduce((acc, sub) => acc + sub.monthlyCost, 0)


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Subscription Manager</h1>
            <p className="text-muted-foreground">Identify and manage your recurring subscriptions.</p>
        </div>
        {isPro && (
             <Button onClick={handleGenerateInsights} disabled={isGenerating || transactions.length === 0}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isGenerating ? 'Analyzing...' : 'Find My Subscriptions'}
            </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Total Monthly Cost</CardTitle>
            <CardDescription>The total amount you spend on subscriptions each month.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
        </CardContent>
      </Card>

      {error && (
            <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            </div>
        )}

        {!isPro && (
            <Card className="flex flex-col items-center justify-center py-12 text-center col-span-full bg-accent/10 border-accent/20">
                <CardHeader className="items-center">
                    <Sparkles className="h-10 w-10 text-accent mb-4" />
                    <CardTitle className="text-lg">Unlock AI Insights</CardTitle>
                    <CardDescription>Upgrade to Pro to automatically analyze your transactions and find all your subscriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard/upgrade')}>Upgrade to Pro</Button>
                </CardContent>
            </Card>
        )}


        {loading || isGenerating ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
            </div>
        ) : subscriptions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subscriptions.map(sub => (
                    <Card key={sub.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start justify-between">
                             <div className="space-y-1.5">
                                <CardTitle>{sub.name}</CardTitle>
                                <Badge className={categoryColors[sub.category] || categoryColors.Other}>{sub.category}</Badge>
                            </div>
                            <AlertDialog>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive"><Trash2 />Delete</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this subscription.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(sub.id)} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-3xl font-bold">{formatCurrency(sub.monthlyCost)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                        </CardContent>
                         {sub.suggestion && (
                            <CardFooter className="flex-col items-start gap-2 pt-4 bg-muted/50">
                                <p className="text-xs font-semibold flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> AI Suggestion</p>
                                <p className="text-xs text-muted-foreground">{sub.suggestion}</p>
                            </CardFooter>
                         )}
                    </Card>
                ))}
            </div>
        ) : (
             <Card className="flex flex-col items-center justify-center py-20 text-center col-span-full">
                <CardHeader className="items-center">
                    <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="text-lg">No Subscriptions Found</CardTitle>
                    <CardDescription>Add recurring expenses or click "Find My Subscriptions" to discover them automatically.</CardDescription>
                </CardHeader>
            </Card>
        )}

    </div>
  )
}
