
"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Trash2, Edit, Flag, Target, PiggyBank, Calendar as CalendarIcon } from "lucide-react"
import { useGoals } from "@/hooks/use-goals"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { addGoal, deleteGoal, updateGoal } from "@/services/goals"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useCurrency } from "@/hooks/use-currency"

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount must be 0 or more"),
  deadline: z.date({ required_error: "A deadline is required." }),
})

export default function GoalsPage() {
  const { goals, loading } = useGoals()
  const { formatCurrency } = useCurrency();
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: "", targetAmount: 1000, currentAmount: 0 },
  });

  async function handleSaveGoal(values: z.infer<typeof goalSchema>) {
    try {
      const goalData = { ...values, deadline: format(values.deadline, "yyyy-MM-dd") }
      if (editingGoal) {
        await updateGoal(editingGoal, goalData)
        toast({ title: "Success", description: "Goal updated successfully." })
      } else {
        await addGoal(goalData)
        toast({ title: "Success", description: "Goal added successfully." })
      }
      form.reset()
      setEditingGoal(null)
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving goal:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to save goal." })
    }
  }

  async function handleDeleteGoal(id: string) {
    setIsDeleting(true);
    try {
      await deleteGoal(id);
      toast({ title: "Success", description: "Goal deleted successfully." });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete goal." });
    } finally {
      setIsDeleting(false);
    }
  }
  
  const openEditDialog = (goal: any) => {
    setEditingGoal(goal.id);
    form.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: new Date(goal.deadline)
    });
    setDialogOpen(true);
  }

  const openNewDialog = () => {
    setEditingGoal(null);
    form.reset({ name: "", targetAmount: 1000, currentAmount: 0, deadline: undefined });
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <Button onClick={openNewDialog}>
            <PlusCircle />
            Add Goal
          </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Add a New Goal"}</DialogTitle>
              <DialogDescription>
                {editingGoal ? "Update your savings goal details." : "Set a new target to save for."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveGoal)} className="space-y-4 py-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Vacation to Hawaii" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="targetAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount</FormLabel>
                      <FormControl><Input type="number" step="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="currentAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Amount Saved</FormLabel>
                      <FormControl><Input type="number" step="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={(date) => {
                                if (!date) return;
                                field.onChange(date);
                                setPopoverOpen(false);
                            }}
                            disabled={(date) => date < new Date()} 
                            initialFocus 
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                   <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingGoal ? "Save Changes" : "Add Goal"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      ) : goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
            <Card key={goal.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2"><Target/> {goal.name}</CardTitle>
                        <CardDescription>Deadline: {format(new Date(goal.deadline), "PPP")}</CardDescription>
                    </div>
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(goal)}><Edit />Edit</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive"><Trash2 />Delete</DropdownMenuItem></AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete this savings goal.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    <Progress value={progress} className="h-3" />
                     <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{formatCurrency(goal.currentAmount)} saved</span>
                        <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} left</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                 <p className="text-xs text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</p>
              </CardFooter>
            </Card>
          )})}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
            <CardHeader className="items-center"><PiggyBank className="h-12 w-12 text-muted-foreground mb-4" /><CardTitle className="text-lg">No Goals Yet</CardTitle><CardDescription>Create a savings goal to get started.</CardDescription></CardHeader>
             <CardContent><Button onClick={openNewDialog}><PlusCircle />Create Goal</Button></CardContent>
        </Card>
      )}
    </div>
  )
}
