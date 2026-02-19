"use client";

import * as React from "react";
import { useSubscriptions } from "@/hooks/use-recurring";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { generateSubscriptionInsights } from "@/ai/flows/generate-subscription-insight";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import { 
  Loader2, 
  Sparkles, 
  Lightbulb, 
  Repeat, 
  MoreHorizontal, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  EyeOff,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
  Bell,
  BellOff,
  Zap,
  Crown,
  Shield,
  HelpCircle,
  ChevronRight,
  Plus,
  Filter,
  Search
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addRecurringTransaction, deleteRecurringTransaction, updateRecurringTransaction } from "@/services/recurring";
import type { SubscriptionInsight } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addMonths, isAfter } from "date-fns";

const categoryColors: { [key: string]: string } = {
  Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Software: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Music: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  Productivity: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800",
  Health: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  Fitness: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  News: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
  Cloud: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  Gaming: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

const frequencyLabels = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  quarterly: "Quarterly",
};

// Subscription Analytics Component
function SubscriptionAnalytics({ subscriptions }: { subscriptions: any[] }) {
  const { formatCurrency } = useCurrency();
  
  const totalMonthly = subscriptions.reduce((acc, sub) => acc + sub.monthlyCost, 0);
  const totalYearly = totalMonthly * 12;
  
  const categoryBreakdown = subscriptions.reduce((acc: any, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.monthlyCost;
    return acc;
  }, {});
  
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);
  
  const upcomingRenewals = subscriptions
    .filter(sub => {
      if (!sub.nextBillingDate) return false;
      const daysUntil = differenceInDays(new Date(sub.nextBillingDate), new Date());
      return daysUntil <= 7 && daysUntil >= 0;
    })
    .length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalYearly)} yearly
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg. {formatCurrency(totalMonthly / (subscriptions.length || 1))} each
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Repeat className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Top Category</p>
              <p className="text-2xl font-bold">
                {topCategories[0] ? String(topCategories[0][0]) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {topCategories[0] ? formatCurrency(Number(topCategories[0][1])) : ''}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <PieChart className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Renewals</p>
              <p className="text-2xl font-bold">{upcomingRenewals}</p>
              <p className="text-xs text-muted-foreground mt-1">
                In the next 7 days
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Calendar className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Subscription Dialog
function AddSubscriptionDialog({ onAdd }: { onAdd: (subscription: any) => Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    amount: "",
    category: "Other",
    frequency: "monthly",
    startDate: format(new Date(), "yyyy-MM-dd"),
    nextBillingDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    autoRenew: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
        monthlyCost: formData.frequency === 'yearly' ? parseFloat(formData.amount) / 12 :
                     formData.frequency === 'weekly' ? parseFloat(formData.amount) * 4 :
                     parseFloat(formData.amount),
      });
      setOpen(false);
      setFormData({
        name: "",
        amount: "",
        category: "Other",
        frequency: "monthly",
        startDate: format(new Date(), "yyyy-MM-dd"),
        nextBillingDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
        autoRenew: true,
        notes: "",
      });
    } catch (error) {
      console.error("Error adding subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Enter the details of your recurring subscription.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="499"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Cloud">Cloud Storage</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoRenew"
              checked={formData.autoRenew}
              onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
            />
            <Label htmlFor="autoRenew">Auto-renewal enabled</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Subscription'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Subscription Dialog
function EditSubscriptionDialog({ subscription, onEdit }: { subscription: any; onEdit: (id: string, data: any) => Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: subscription.name || "",
    amount: subscription.amount?.toString() || (subscription.monthlyCost * (subscription.frequency === 'yearly' ? 12 : 1)).toString(),
    category: subscription.category || "Other",
    frequency: subscription.frequency || "monthly",
    nextBillingDate: subscription.nextBillingDate || format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    autoRenew: subscription.autoRenew !== false,
    notes: subscription.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onEdit(subscription.id, {
        ...formData,
        amount: parseFloat(formData.amount),
        monthlyCost: formData.frequency === 'yearly' ? parseFloat(formData.amount) / 12 :
                     formData.frequency === 'weekly' ? parseFloat(formData.amount) * 4 :
                     parseFloat(formData.amount),
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update your subscription details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="News">News</SelectItem>
                <SelectItem value="Cloud">Cloud Storage</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-autoRenew"
              checked={formData.autoRenew}
              onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
            />
            <Label htmlFor="edit-autoRenew">Auto-renewal enabled</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Subscription Card Component
function SubscriptionCard({ subscription, onDelete, onEdit }: { subscription: any; onDelete: (id: string) => Promise<void>; onEdit: (id: string, data: any) => Promise<void> }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { formatCurrency } = useCurrency();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(subscription.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    setIsUpdating(true);
    try {
      await onEdit(subscription.id, { autoRenew: !subscription.autoRenew });
    } catch (error) {
      console.error("Error updating:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const daysUntilRenewal = subscription.nextBillingDate 
    ? differenceInDays(new Date(subscription.nextBillingDate), new Date())
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{subscription.name}</CardTitle>
                {subscription.autoRenew ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Auto-renew
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">
                    <XCircle className="h-3 w-3 mr-1" />
                    Manual
                  </Badge>
                )}
              </div>
              <Badge className={cn("border", categoryColors[subscription.category] || categoryColors.Other)}>
                {subscription.category}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <EditSubscriptionDialog subscription={subscription} onEdit={onEdit} />
                <DropdownMenuItem onClick={handleToggleAutoRenew} disabled={isUpdating}>
                  {subscription.autoRenew ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable auto-renew
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable auto-renew
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4">
          <div>
            <p className="text-3xl font-bold">
              {formatCurrency(subscription.monthlyCost)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{frequencyLabels[subscription.frequency as keyof typeof frequencyLabels] || 'mo'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(subscription.monthlyCost * 12)} yearly
            </p>
          </div>

          {daysUntilRenewal !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next renewal</span>
                <span className={cn(
                  "font-medium",
                  daysUntilRenewal <= 3 && "text-yellow-500",
                  daysUntilRenewal <= 0 && "text-destructive"
                )}>
                  {daysUntilRenewal <= 0 ? 'Overdue' : `${daysUntilRenewal} days`}
                </span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, ((30 - daysUntilRenewal) / 30) * 100))} 
                className="h-1.5"
              />
            </div>
          )}

          {subscription.notes && (
            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
              {subscription.notes}
            </p>
          )}
        </CardContent>

        {subscription.suggestion && (
          <CardFooter className="flex-col items-start gap-2 pt-4 bg-gradient-to-r from-yellow-500/5 to-transparent border-t">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
              <p className="text-xs font-semibold">AI Suggestion</p>
            </div>
            <p className="text-xs text-muted-foreground">{subscription.suggestion}</p>
          </CardFooter>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{subscription.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </motion.div>
  );
}

export default function SubscriptionsPage() {
  const { subscriptions, loading: subsLoading, deleteSubscription } = useSubscriptions();
  const { transactions, loading: transLoading } = useTransactions();
  const { isPro } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = React.useState<"name" | "cost" | "renewal">("cost");

  const loading = subsLoading || transLoading;

  // Filter and sort subscriptions
  const filteredSubscriptions = React.useMemo(() => {
    let filtered = [...subscriptions];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(sub => sub.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "cost":
          return b.monthlyCost - a.monthlyCost;
        case "renewal":
          return (a.nextBillingDate || "").localeCompare(b.nextBillingDate || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [subscriptions, searchQuery, categoryFilter, sortBy]);

  const handleGenerateInsights = async () => {
    if (!isPro) {
      router.push("/dashboard/upgrade");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateSubscriptionInsights({ transactions: JSON.stringify(transactions) });
      
      const promises = result.insights.map((insight: SubscriptionInsight) => {
        return addRecurringTransaction({
          description: insight.name,
          amount: insight.monthlyCost,
          type: 'expense',
          category: insight.category,
          frequency: 'monthly',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          nextBillingDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
          suggestion: insight.suggestion,
          autoRenew: true,
        });
      });

      await Promise.all(promises);

      toast({ 
        title: "Success", 
        description: `Found ${result.insights.length} subscriptions. They've been added to your list.`
      });
    } catch (e) {
      console.error(e);
      setError("Failed to generate insights. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubscription = async (data: any) => {
    try {
      await addRecurringTransaction({
        description: data.name,
        amount: data.amount,
        type: 'expense',
        category: data.category,
        frequency: data.frequency,
        startDate: data.startDate,
        nextBillingDate: data.nextBillingDate,
        notes: data.notes,
        autoRenew: data.autoRenew,
      });
      toast({ title: "Success", description: "Subscription added successfully." });
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add subscription." });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id);
      toast({ title: "Success", description: "Subscription deleted successfully." });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete subscription." });
      throw error;
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      await updateRecurringTransaction(id, data);
      toast({ title: "Success", description: "Subscription updated successfully." });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update subscription." });
      throw error;
    }
  };

  const totalMonthlyCost = filteredSubscriptions.reduce((acc, sub) => acc + sub.monthlyCost, 0);

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const cats = new Set(subscriptions.map(sub => sub.category));
    return Array.from(cats);
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <div className="container max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="px-3 py-1">
                <Repeat className="h-3 w-3 mr-1" />
                Subscription Manager
              </Badge>
              {isPro && (
                <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Manage Your Subscriptions
            </h1>
            <p className="text-muted-foreground mt-2">
              Track, analyze, and optimize your recurring expenses
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPro && (
              <Button 
                onClick={handleGenerateInsights} 
                disabled={isGenerating || transactions.length === 0}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find Subscriptions
                  </>
                )}
              </Button>
            )}
            <AddSubscriptionDialog onAdd={handleAddSubscription} />
          </div>
        </div>

        {/* Analytics Dashboard */}
        {subscriptions.length > 0 && <SubscriptionAnalytics subscriptions={subscriptions} />}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 my-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Highest Cost</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="renewal">Renewal Date</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isPro && subscriptions.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-16 text-center mb-6 bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
            <CardHeader className="items-center">
              <div className="p-4 rounded-full bg-gradient-to-r from-primary to-purple-600 mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Unlock AI-Powered Subscription Detection</CardTitle>
              <CardDescription className="text-base max-w-md">
                Upgrade to Pro and let our AI automatically find all your subscriptions from your transaction history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => router.push('/dashboard/upgrade')} className="bg-gradient-to-r from-primary to-purple-600">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {loading || isGenerating ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredSubscriptions.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </p>
              <p className="text-sm font-medium">
                Total: <span className="text-primary">{formatCurrency(totalMonthlyCost)}/mo</span>
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {viewMode === "grid" ? (
                <motion.div 
                  layout
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filteredSubscriptions.map(sub => (
                    <SubscriptionCard
                      key={sub.id}
                      subscription={sub}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredSubscriptions.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-accent/30">
                          <div className="flex items-center gap-4">
                            <Badge className={cn("border", categoryColors[sub.category] || categoryColors.Other)}>
                              {sub.category}
                            </Badge>
                            <div>
                              <p className="font-medium">{sub.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Next: {sub.nextBillingDate ? format(new Date(sub.nextBillingDate), 'MMM d, yyyy') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold">{formatCurrency(sub.monthlyCost)}<span className="text-xs text-muted-foreground">/mo</span></p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <EditSubscriptionDialog subscription={sub} onEdit={handleEdit} />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(sub.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <CardHeader className="items-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Repeat className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Subscriptions Found</CardTitle>
              <CardDescription className="text-base max-w-md">
                {searchQuery || categoryFilter !== "all" 
                  ? "No subscriptions match your filters. Try adjusting your search."
                  : "Add your first subscription manually or click 'Find Subscriptions' to discover them automatically."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              {searchQuery || categoryFilter !== "all" ? (
                <Button variant="outline" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}>
                  Clear Filters
                </Button>
              ) : (
                <AddSubscriptionDialog onAdd={handleAddSubscription} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}