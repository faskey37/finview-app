"use client"

import * as React from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  PlusCircle, 
  MoreHorizontal, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Landmark,
  Wallet,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LineChart,
  Coins,
  Building2,
  Bitcoin,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Target,
  Clock,
  Calendar,
  DollarSign,
  Percent,
  Shield
} from "lucide-react"
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
import { addInvestment, deleteInvestment, updateInvestment } from "@/services/investments"
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line } from "recharts"
import { useAuth } from "@/hooks/use-auth"
import { useState, useMemo } from "react"
import { format, subMonths, differenceInDays, startOfMonth, endOfMonth } from "date-fns"

const investmentSchema = z.object({
  name: z.string().min(1, "Investment name is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0"),
  currentValue: z.coerce.number().min(0.01, "Current value must be greater than 0"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  notes: z.string().optional(),
  riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
})

// Modern Card Component
function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl ${className}`}>
      {children}
    </Card>
  )
}

// Enhanced Investment Stats Component
function InvestmentStats({ investments }: { investments: any[] }) {
  const { formatCurrency } = useCurrency();
  const [showValues, setShowValues] = useState(true);

  const stats = useMemo(() => {
    const totalValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
    const totalCost = investments.reduce((acc, inv) => acc + inv.purchasePrice, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    // Calculate by type
    const byType = investments.reduce((acc: any, inv) => {
      if (!acc[inv.type]) acc[inv.type] = { value: 0, cost: 0, count: 0 };
      acc[inv.type].value += inv.currentValue;
      acc[inv.type].cost += inv.purchasePrice;
      acc[inv.type].count++;
      return acc;
    }, {});

    // Best and worst performers
    const sortedByPerformance = [...investments].sort((a, b) => {
      const aReturn = a.purchasePrice > 0 ? ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100 : 0;
      const bReturn = b.purchasePrice > 0 ? ((b.currentValue - b.purchasePrice) / b.purchasePrice) * 100 : 0;
      return bReturn - aReturn;
    });

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      byType,
      bestPerformer: sortedByPerformance[0],
      worstPerformer: sortedByPerformance[sortedByPerformance.length - 1],
    };
  }, [investments]);

  const statsCards = [
    {
      title: "Total Portfolio Value",
      value: showValues ? formatCurrency(stats.totalValue) : '••••••',
      description: "Current market value",
      icon: Wallet,
      trend: stats.totalGainLossPercent,
      trendDirection: stats.totalGainLoss >= 0 ? "up" : "down",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Gain/Loss",
      value: showValues ? formatCurrency(stats.totalGainLoss) : '••••••',
      description: "All-time performance",
      icon: stats.totalGainLoss >= 0 ? TrendingUpIcon : TrendingDownIcon,
      trend: Math.abs(stats.totalGainLossPercent),
      trendDirection: stats.totalGainLoss >= 0 ? "up" : "down",
      color: stats.totalGainLoss >= 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20",
      gradient: stats.totalGainLoss >= 0 ? "from-emerald-500 to-green-500" : "from-rose-500 to-pink-500"
    },
    {
      title: "Average Return",
      value: showValues ? `${stats.totalGainLossPercent.toFixed(2)}%` : '•••%',
      description: "Portfolio ROI",
      icon: Percent,
      trend: stats.totalGainLossPercent,
      trendDirection: stats.totalGainLossPercent >= 0 ? "up" : "down",
      color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "Total Investments",
      value: investments.length.toString(),
      description: "Active holdings",
      icon: PieChart,
      trend: 0,
      trendDirection: "neutral",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Overview</h2>
          <p className="text-gray-400">Track your investment performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-values" className="text-sm text-gray-400 cursor-pointer">
            {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Label>
          <Switch
            id="show-values"
            checked={showValues}
            onCheckedChange={setShowValues}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <ModernCard key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge className={`${
                  stat.trendDirection === "up" 
                    ? "bg-emerald-500/20 text-emerald-500" 
                    : stat.trendDirection === "down"
                    ? "bg-rose-500/20 text-rose-500"
                    : "bg-gray-500/20 text-gray-500"
                } border-0 px-3 py-1`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(2)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.description}</p>
                  {stat.trendDirection === "up" ? (
                    <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
                  ) : stat.trendDirection === "down" ? (
                    <TrendingDownIcon className="h-4 w-4 text-rose-500" />
                  ) : null}
                </div>
              </div>
            </CardContent>
          </ModernCard>
        ))}
      </div>
    </div>
  )
}

// Portfolio Allocation Chart
function PortfolioAllocation({ investments }: { investments: any[] }) {
  const { formatCurrency } = useCurrency();
  
  const allocationData = useMemo(() => {
    const byType = investments.reduce((acc: any, inv) => {
      if (!acc[inv.type]) acc[inv.type] = 0;
      acc[inv.type] += inv.currentValue;
      return acc;
    }, {});

    const colors = {
      'Stock': '#3B82F6',
      'Crypto': '#F59E0B',
      'ETF': '#10B981',
      'Bond': '#8B5CF6',
      'Real Estate': '#EC4899',
      'Mutual Fund': '#06B6D4',
      'Other': '#6B7280'
    };

    const iconMap = {
      'Stock': Building2,
      'Crypto': Bitcoin,
      'ETF': PieChart,
      'Bond': Shield,
      'Real Estate': Building2,
      'Mutual Fund': Globe,
      'Other': Coins
    };

    return Object.entries(byType).map(([type, value]: [string, any]) => ({
      name: type,
      value,
      color: colors[type as keyof typeof colors] || '#6B7280',
      icon: iconMap[type as keyof typeof iconMap] || Coins
    }));
  }, [investments]);

  const totalValue = allocationData.reduce((acc, item) => acc + item.value, 0);

  if (allocationData.length === 0) {
    return (
      <ModernCard>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
          <CardDescription>No investments to display</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <PieChart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Add investments to see allocation</p>
          </div>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
        <CardDescription>Distribution by investment type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Value']}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3 mt-4">
          {allocationData.map((item, index) => {
            const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            const IconComponent = item.icon;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                    <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.value)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{percentage.toFixed(1)}%</p>
                  <Progress value={percentage} className="w-24 h-1.5 bg-gray-800 mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </ModernCard>
  )
}

// Performance Trend Chart
function PerformanceTrend({ investments }: { investments: any[] }) {
  const { formatCurrency } = useCurrency();
  
  const trendData = useMemo(() => {
    // Simulate trend data based on investment performance
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const baseValue = investments.reduce((acc, inv) => acc + inv.purchasePrice, 0);
      const growth = baseValue * (1 + (index * 0.05)); // Simulated growth
      return {
        month,
        value: growth,
        benchmark: growth * 0.95, // Simulated benchmark
      };
    });
  }, [investments]);

  if (investments.length === 0) {
    return (
      <ModernCard className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Performance Trend</CardTitle>
          <CardDescription>No performance data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Add investments to track performance</p>
          </div>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Performance Trend</CardTitle>
            <CardDescription>Portfolio growth over time</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-700 bg-gray-900">
              <DropdownMenuLabel>Time Range</DropdownMenuLabel>
              <DropdownMenuItem>1 Month</DropdownMenuItem>
              <DropdownMenuItem>3 Months</DropdownMenuItem>
              <DropdownMenuItem>6 Months</DropdownMenuItem>
              <DropdownMenuItem>1 Year</DropdownMenuItem>
              <DropdownMenuItem>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Value']}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Portfolio"
              />
              <Bar 
                dataKey="benchmark" 
                fill="#6B7280" 
                radius={[4, 4, 0, 0]}
                name="Benchmark"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-400">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm text-gray-400">Benchmark</span>
          </div>
        </div>
      </CardContent>
    </ModernCard>
  )
}

// Enhanced Investment Card Component
function InvestmentCard({ investment, onDelete }: { investment: any; onDelete: (id: string) => void }) {
  const { formatCurrency } = useCurrency();
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const gainLoss = investment.currentValue - investment.purchasePrice;
  const gainLossPercent = investment.purchasePrice > 0 ? (gainLoss / investment.purchasePrice) * 100 : 0;
  const daysHeld = investment.purchaseDate ? differenceInDays(new Date(), new Date(investment.purchaseDate)) : 0;
  
  const typeIcons = {
    'Stock': Building2,
    'Crypto': Bitcoin,
    'ETF': PieChart,
    'Bond': Shield,
    'Real Estate': Building2,
    'Mutual Fund': Globe,
    'Other': Coins
  };

  const riskColors = {
    'Low': 'bg-emerald-500/20 text-emerald-500',
    'Medium': 'bg-amber-500/20 text-amber-500',
    'High': 'bg-rose-500/20 text-rose-500'
  };

  const IconComponent = typeIcons[investment.type as keyof typeof typeIcons] || Coins;

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              investment.type === 'Stock' ? 'bg-blue-500/10' :
              investment.type === 'Crypto' ? 'bg-amber-500/10' :
              investment.type === 'ETF' ? 'bg-emerald-500/10' :
              'bg-gray-500/10'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                investment.type === 'Stock' ? 'text-blue-500' :
                investment.type === 'Crypto' ? 'text-amber-500' :
                investment.type === 'ETF' ? 'text-emerald-500' :
                'text-gray-500'
              }`} />
            </div>
            <div>
              <CardTitle className="text-lg">{investment.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-gray-700 text-xs">
                  {investment.type}
                </Badge>
                {investment.riskLevel && (
                  <Badge className={`${riskColors[investment.riskLevel as keyof typeof riskColors]} border-0 text-xs`}>
                    {investment.riskLevel} Risk
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost" className="text-gray-400 hover:text-gray-300">
                  <MoreHorizontal />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-gray-700 bg-gray-900">
                <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Value
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-rose-500">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent className="border-gray-700 bg-gray-900">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{investment.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-700">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(investment.id)}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-sm text-gray-400">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(investment.currentValue)}</p>
            </div>
            <div className={`flex items-center gap-2 ${gainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {gainLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <div className="text-right">
                <p className="font-bold">{gainLossPercent.toFixed(2)}%</p>
                <p className="text-sm">{formatCurrency(gainLoss)}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{investment.quantity} {investment.type === 'Stock' ? 'shares' : 'units'}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-gray-500">Cost Basis</p>
              <p className="font-medium">{formatCurrency(investment.purchasePrice)}</p>
            </div>
          </div>
          
          {showDetails && (
            <div className="space-y-3 p-3 rounded-lg bg-gray-800/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Holding Period</span>
                <span className="font-medium">{daysHeld} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Purchase Date</span>
                <span className="font-medium">
                  {investment.purchaseDate ? format(new Date(investment.purchaseDate), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              {investment.notes && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-300">{investment.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-800 pt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-gray-400 hover:text-gray-300"
        >
          {showDetails ? 'Show Less' : 'View Details'}
          <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </Button>
      </CardFooter>
    </ModernCard>
  )
}

export default function InvestmentsPage() {
  const { investments, loading, refresh } = useInvestments()
  const { formatCurrency } = useCurrency();
  const { isPro } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [sortBy, setSortBy] = useState("value")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      type: "Stock",
      quantity: 1,
      purchasePrice: 0,
      currentValue: 0,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      notes: "",
      riskLevel: "Medium",
    },
  });

  async function handleAddInvestment(values: z.infer<typeof investmentSchema>) {
    try {
      await addInvestment(values)
      form.reset()
      setAddDialogOpen(false)
      refresh()
      toast({ 
        title: "Success", 
        description: "Investment added successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error("Error adding investment:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to add investment." 
      })
    }
  }

  async function handleDeleteInvestment(id: string) {
    try {
      await deleteInvestment(id);
      refresh()
      toast({ 
        title: "Success", 
        description: "Investment deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting investment:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete investment." 
      });
    }
  }

  const filteredAndSortedInvestments = useMemo(() => {
    let filtered = investments;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(inv =>
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== "All") {
      filtered = filtered.filter(inv => inv.type === typeFilter);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.currentValue - a.currentValue;
        case "gain":
          return (b.currentValue - b.purchasePrice) - (a.currentValue - a.purchasePrice);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [investments, searchQuery, typeFilter, sortBy]);

  const investmentTypes = Array.from(new Set(investments.map(inv => inv.type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-gray-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl bg-gray-800" />
          <Skeleton className="h-[400px] rounded-xl bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl bg-gray-800" />
          <Skeleton className="h-96 rounded-xl bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="border-gray-700 bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Investment</DialogTitle>
            <DialogDescription className="text-gray-400">
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
                    <FormLabel className="text-gray-300">Investment Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Apple Inc., Bitcoin, Vanguard ETF" 
                        className="border-gray-700 bg-gray-800"
                        {...field} 
                        maxLength={30}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-700 bg-gray-800">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-gray-700 bg-gray-900">
                          <SelectItem value="Stock">Stock</SelectItem>
                          <SelectItem value="Crypto">Crypto</SelectItem>
                          <SelectItem value="ETF">ETF</SelectItem>
                          <SelectItem value="Bond">Bond</SelectItem>
                          <SelectItem value="Real Estate">Real Estate</SelectItem>
                          <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Risk Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-700 bg-gray-800">
                            <SelectValue placeholder="Select risk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-gray-700 bg-gray-900">
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any" 
                          className="border-gray-700 bg-gray-800"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Purchase Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="border-gray-700 bg-gray-800"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Purchase Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="border-gray-700 bg-gray-800"
                          {...field} 
                        />
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
                      <FormLabel className="text-gray-300">Current Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="border-gray-700 bg-gray-800"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes about this investment..."
                        className="border-gray-700 bg-gray-800 min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Add Investment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <main className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investments Portfolio</h1>
            <p className="text-gray-400">Track and manage your investment portfolio</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isPro && (
              <Button 
                variant="outline" 
                className="border-gray-700 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                asChild
              >
                <a href="/dashboard/upgrade">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </a>
              </Button>
            )}
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Investment Stats */}
        <InvestmentStats investments={investments} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerformanceTrend investments={investments} />
          <PortfolioAllocation investments={investments} />
        </div>

        {/* Investments Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Your Investments</h2>
            <p className="text-gray-400">{filteredAndSortedInvestments.length} total investments</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search investments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-700 bg-gray-800/50 w-full sm:w-64"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-gray-700 bg-gray-800/50 w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem value="All">All Types</SelectItem>
                  {investmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-700 bg-gray-800/50 w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem value="value">Highest Value</SelectItem>
                  <SelectItem value="gain">Best Performance</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Investments Grid */}
        {filteredAndSortedInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedInvestments.map(investment => (
              <InvestmentCard 
                key={investment.id} 
                investment={investment} 
                onDelete={handleDeleteInvestment}
              />
            ))}
          </div>
        ) : (
          <ModernCard>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-gray-800/50 mb-4">
                <TrendingUp className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Investments Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || typeFilter !== "All" 
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first investment"
                }
              </p>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Investment
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </ModernCard>
        )}

        {/* Quick Tips */}
        {investments.length > 0 && (
          <ModernCard>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Investment Tips
              </CardTitle>
              <CardDescription>AI-powered suggestions for your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-medium text-blue-400 mb-2">Diversification Check</h4>
                  <p className="text-sm text-gray-300">
                    Consider adding bonds or REITs to balance your {investmentTypes.length} investment types.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="font-medium text-emerald-400 mb-2">Rebalance Strategy</h4>
                  <p className="text-sm text-gray-300">
                    Review allocation monthly. Current portfolio has {investments.length} holdings.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-medium text-amber-400 mb-2">Risk Assessment</h4>
                  <p className="text-sm text-gray-300">
                    Monitor high-risk investments regularly. Consider setting stop-loss orders.
                  </p>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        )}
      </main>
    </div>
  )
}