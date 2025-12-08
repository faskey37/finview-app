"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  PlusCircle, MoreHorizontal, Trash2, Edit, Flag, Target, PiggyBank, Calendar as CalendarIcon, 
  TrendingUp, Clock, DollarSign, TrendingDown, CheckCircle, AlertTriangle, Zap, 
  Crown, Rocket, Sparkles, Filter, SortAsc, Eye, EyeOff, Trophy, CalendarDays,
  Target as TargetIcon, TrendingUp as TrendingUpIcon, BarChart, ChevronDown
} from "lucide-react"
import { useGoals } from "@/hooks/use-goals"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { addGoal, deleteGoal, updateGoal } from "@/services/goals"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, differenceInDays, isBefore, addMonths } from "date-fns"
import { useCurrency } from "@/hooks/use-currency"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(50, "Goal name too long"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0").max(1000000000, "Amount too large"),
  currentAmount: z.coerce.number().min(0, "Current amount must be 0 or more"),
  deadline: z.date({ required_error: "A deadline is required." }),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  description: z.string().max(200, "Description too long").optional(),
  recurring: z.boolean().default(false),
  monthlyContribution: z.coerce.number().min(0).optional(),
})

type GoalStatus = "on-track" | "behind" | "at-risk" | "completed"

const CATEGORIES = [
  "Travel", "Home", "Car", "Education", "Emergency Fund", "Retirement", 
  "Wedding", "Business", "Health", "Entertainment", "Gadgets", "Other"
]

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-emerald-500 bg-emerald-500/10" },
  { value: "medium", label: "Medium", color: "text-amber-500 bg-amber-500/10" },
  { value: "high", label: "High", color: "text-rose-500 bg-rose-500/10" }
]

// Simple Date Picker Component with better date selection
function SimpleDatePicker({ 
  date, 
  onChange, 
  disabled,
  className
}: { 
  date: Date | undefined; 
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && (!disabled || !disabled(selectedDate))) {
      onChange(selectedDate)
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabled}
            initialFocus
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function GoalsPage() {
  const { goals, loading, refetch } = useGoals()
  const { formatCurrency, currencySymbol } = useCurrency()
  const { isPro } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("deadline")
  const [showCompleted, setShowCompleted] = React.useState(true)
  const [showBalance, setShowBalance] = React.useState(true)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: { 
      name: "", 
      targetAmount: 1000, 
      currentAmount: 0, 
      deadline: addMonths(new Date(), 6),
      category: "Other",
      priority: "medium",
      description: "",
      recurring: false,
      monthlyContribution: 100
    },
  })

  const getGoalStatus = (goal: any): GoalStatus => {
    if (goal.currentAmount >= goal.targetAmount) return "completed"
    
    const daysLeft = differenceInDays(new Date(goal.deadline), new Date())
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100
    
    if (daysLeft <= 0) return "at-risk"
    
    const dailyRequired = (goal.targetAmount - goal.currentAmount) / Math.max(daysLeft, 1)
    const monthlyContribution = goal.monthlyContribution || 100
    const estimatedDailyRate = monthlyContribution / 30
    
    if (progressPercentage >= 75 && dailyRequired <= estimatedDailyRate) return "on-track"
    if (progressPercentage >= 50 && dailyRequired <= estimatedDailyRate * 1.5) return "behind"
    return "at-risk"
  }

  const getStatusColor = (status: GoalStatus) => {
    switch(status) {
      case "completed": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
      case "on-track": return "bg-blue-500/20 text-blue-600 border-blue-500/30"
      case "behind": return "bg-amber-500/20 text-amber-600 border-amber-500/30"
      case "at-risk": return "bg-rose-500/20 text-rose-600 border-rose-500/30"
    }
  }

  const getStatusIcon = (status: GoalStatus) => {
    switch(status) {
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "on-track": return <TrendingUp className="h-4 w-4" />
      case "behind": return <Clock className="h-4 w-4" />
      case "at-risk": return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredAndSortedGoals = React.useMemo(() => {
    let filtered = goals
    
    if (filter !== "all") {
      filtered = filtered.filter(goal => goal.category === filter)
    }
    
    if (!showCompleted) {
      filtered = filtered.filter(goal => getGoalStatus(goal) !== "completed")
    }
    
    return [...filtered].sort((a, b) => {
      switch(sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "amount":
          return b.targetAmount - a.targetAmount
        case "progress":
          return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)
        default:
          return 0
      }
    })
  }, [goals, filter, sortBy, showCompleted])

  async function handleSaveGoal(values: z.infer<typeof goalSchema>) {
    try {
      const goalData = { 
        ...values, 
        deadline: format(values.deadline, "yyyy-MM-dd"),
        status: "active"
      }
      
      if (editingGoal) {
        await updateGoal(editingGoal, goalData)
        toast({ 
          title: "Success", 
          description: "Goal updated successfully.",
          variant: "default"
        })
      } else {
        await addGoal(goalData)
        toast({ 
          title: "Success", 
          description: "Goal added successfully.",
          variant: "default"
        })
      }
      
      form.reset()
      setEditingGoal(null)
      setDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Error saving goal:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to save goal. Please try again." 
      })
    }
  }

  async function handleDeleteGoal(id: string) {
    setIsDeleting(true);
    try {
      await deleteGoal(id);
      toast({ 
        title: "Success", 
        description: "Goal deleted successfully.",
        variant: "default"
      });
      refetch()
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete goal. Please try again." 
      });
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
      deadline: new Date(goal.deadline),
      category: goal.category || "Other",
      priority: goal.priority || "medium",
      description: goal.description || "",
      recurring: goal.recurring || false,
      monthlyContribution: goal.monthlyContribution || 100
    });
    setDialogOpen(true);
  }

  const openNewDialog = () => {
    setEditingGoal(null);
    form.reset({ 
      name: "", 
      targetAmount: 1000, 
      currentAmount: 0, 
      deadline: addMonths(new Date(), 6),
      category: "Other",
      priority: "medium",
      description: "",
      recurring: false,
      monthlyContribution: 100
    });
    setDialogOpen(true);
  }

  const calculateDaysLeft = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date())
    return days > 0 ? days : 0
  }

  const calculateMonthlyRequired = (goal: any) => {
    const daysLeft = calculateDaysLeft(goal.deadline)
    const amountLeft = goal.targetAmount - goal.currentAmount
    const monthsLeft = daysLeft / 30
    
    if (monthsLeft <= 0) return amountLeft
    return amountLeft / monthsLeft
  }

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
            <p className="text-muted-foreground">Track and achieve your financial targets</p>
          </div>
          <Button onClick={openNewDialog} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Target</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <PiggyBank className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{totalProgress.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUpIcon className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Goals</TabsTrigger>
              <TabsTrigger value="Travel">Travel</TabsTrigger>
              <TabsTrigger value="Home">Home</TabsTrigger>
              <TabsTrigger value="Car">Car</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={showBalance}
              onCheckedChange={setShowBalance}
              className="data-[state=checked]:bg-primary"
            />
            <Label className="text-sm">Show Amounts</Label>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SortAsc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Deadline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                <Flag className="h-4 w-4 mr-2" />
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("progress")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredAndSortedGoals.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const status = getGoalStatus(goal)
              const daysLeft = calculateDaysLeft(goal.deadline)
              const monthlyRequired = calculateMonthlyRequired(goal)
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-semibold truncate">
                              {goal.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              goal.category === "Travel" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                              goal.category === "Home" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                              goal.category === "Car" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              goal.category === "Education" && "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            )}>
                              {goal.category || "Other"}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              getStatusColor(status)
                            )}>
                              {getStatusIcon(status)}
                              <span className="ml-1 capitalize">{status.replace("-", " ")}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(goal)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Goal
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{goal.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {showBalance ? formatCurrency(goal.currentAmount) : "••••••"} saved
                            </span>
                            <span className="font-medium">
                              {showBalance ? formatCurrency(goal.targetAmount) : "••••••"} target
                            </span>
                          </div>
                          <Progress 
                            value={progress} 
                            className={cn(
                              "h-2",
                              status === "completed" && "bg-emerald-500",
                              status === "on-track" && "bg-blue-500",
                              status === "behind" && "bg-amber-500",
                              status === "at-risk" && "bg-rose-500"
                            )}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progress.toFixed(1)}% complete</span>
                            <span>{daysLeft} days left</span>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Amount Left</p>
                            <p className="font-semibold">
                              {showBalance ? formatCurrency(goal.targetAmount - goal.currentAmount) : "••••••"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Monthly Needed</p>
                            <p className="font-semibold">
                              {showBalance ? formatCurrency(monthlyRequired) : "••••••"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-3 border-t">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Due {format(new Date(goal.deadline), "MMM d, yyyy")}
                          </span>
                        </div>
                        
                        {goal.priority && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              goal.priority === "high" && "text-rose-600 bg-rose-500/10 border-rose-500/30",
                              goal.priority === "medium" && "text-amber-600 bg-amber-500/10 border-amber-500/30",
                              goal.priority === "low" && "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
                            )}
                          >
                            {goal.priority} priority
                          </Badge>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <PiggyBank className="h-16 w-16 text-muted-foreground/50" />
              <div className="absolute -top-2 -right-2">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Goals Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === "all" 
                  ? "Start your financial journey by creating your first savings goal." 
                  : `No goals found in the ${filter} category.`}
              </p>
            </div>
            <Button onClick={openNewDialog} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </DialogTitle>
            <DialogDescription>
              {editingGoal ? "Update your goal details below." : "Set a target to work towards."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveGoal)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Hawaii Vacation 2024" 
                        {...field} 
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add notes about your goal..." 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground">{currencySymbol}</span>
                          </div>
                          <Input 
                            type="number" 
                            step="1"
                            className="pl-7"
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
                  name="currentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Already Saved *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground">{currencySymbol}</span>
                          </div>
                          <Input 
                            type="number" 
                            step="1"
                            className="pl-7"
                            {...field} 
                          />
                        </div>
                      </FormControl>
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
                          {CATEGORIES.map(category => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${priority.color.split(' ')[0]}`} />
                                {priority.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Fixed Date Picker */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline *</FormLabel>
                    <FormControl>
                      <SimpleDatePicker
                        date={field.value}
                        onChange={field.onChange}
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring Goal</FormLabel>
                      <FormDescription>
                        Reset this goal automatically after completion
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("recurring") && (
                <FormField
                  control={form.control}
                  name="monthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Contribution</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="text-sm font-medium">
                              {currencySymbol}{field.value}
                            </span>
                          </div>
                          <Slider
                            min={10}
                            max={5000}
                            step={10}
                            value={[field.value || 100]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{currencySymbol}10</span>
                            <span>{currencySymbol}5,000</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditingGoal(null)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  {editingGoal ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Update Goal
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      Create Goal
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}