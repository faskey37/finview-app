"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useBudgets } from "@/hooks/use-budgets";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/hooks/use-auth";
import { generateFinancialHealthScore } from "@/ai/flows/generate-financial-health-score";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Shield,
  Award,
  Zap,
  Calendar,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  Brain,
  Rocket,
  Heart,
  Users,
  Lock,
  Eye,
  EyeOff,
  Download,
  Share2,
  Bookmark,
  Bell,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, subMonths } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

const GAUGE_MAX_ANGLE = 180;

// Score categories with refined thresholds
const scoreCategories = [
  { 
    range: [800, 1000], 
    label: "Excellent", 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/20",
    description: "Your financial health is outstanding! You're on the right track.",
    icon: Award
  },
  { 
    range: [600, 799], 
    label: "Good", 
    color: "text-primary", 
    bg: "bg-primary/10", 
    border: "border-primary/20",
    description: "You're doing well. A few improvements can take you to excellent.",
    icon: TrendingUp
  },
  { 
    range: [400, 599], 
    label: "Fair", 
    color: "text-yellow-500", 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/20",
    description: "You're on the right path. Focus on key areas to improve.",
    icon: Activity
  },
  { 
    range: [0, 399], 
    label: "Needs Work", 
    color: "text-destructive", 
    bg: "bg-destructive/10", 
    border: "border-destructive/20",
    description: "Time to take action. Follow our recommendations to improve.",
    icon: AlertCircle
  },
];

// Score factors with refined weights and descriptions
const scoreFactors = [
  { 
    name: "Savings Rate", 
    weight: 25, 
    icon: TrendingUp, 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10",
    description: "Percentage of income you save each month",
    good: ">20%",
    fair: "10-20%",
    poor: "<10%"
  },
  { 
    name: "Budget Adherence", 
    weight: 20, 
    icon: Target, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10",
    description: "How well you stick to your budget",
    good: ">90%",
    fair: "70-90%",
    poor: "<70%"
  },
  { 
    name: "Income Stability", 
    weight: 15, 
    icon: LineChart, 
    color: "text-green-500", 
    bg: "bg-green-500/10",
    description: "Consistency of your income sources",
    good: "Stable",
    fair: "Moderately stable",
    poor: "Variable"
  },
  { 
    name: "Debt Management", 
    weight: 15, 
    icon: AlertCircle, 
    color: "text-orange-500", 
    bg: "bg-orange-500/10",
    description: "How well you manage your debt",
    good: "Low debt",
    fair: "Moderate debt",
    poor: "High debt"
  },
  { 
    name: "Emergency Fund", 
    weight: 15, 
    icon: Shield, 
    color: "text-purple-500", 
    bg: "bg-purple-500/10",
    description: "Savings for unexpected expenses",
    good: ">6 months",
    fair: "3-6 months",
    poor: "<3 months"
  },
  { 
    name: "Investment Health", 
    weight: 10, 
    icon: BarChart3, 
    color: "text-indigo-500", 
    bg: "bg-indigo-500/10",
    description: "Diversification and growth of investments",
    good: "Diversified",
    fair: "Some investments",
    poor: "No investments"
  },
];

// Real calculation functions with improved logic
const calculateSavingsRate = (totalIncome: number, totalExpense: number) => {
  if (totalIncome === 0) return 0;
  const savings = totalIncome - totalExpense;
  return Math.min(100, Math.max(0, (savings / totalIncome) * 100));
};

const calculateBudgetAdherence = (budgets: any[], transactions: any[]) => {
  if (budgets.length === 0) return 50; // Default when no budgets set
  
  let totalAdherence = 0;
  budgets.forEach(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category?.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (budget.amount > 0) {
      const adherence = Math.min(100, (budget.amount - Math.max(0, spent - budget.amount)) / budget.amount * 100);
      totalAdherence += adherence;
    }
  });
  
  return totalAdherence / budgets.length;
};

const calculateIncomeStability = (transactions: any[]) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  if (incomeTransactions.length < 3) return 60; // Default for insufficient data

  // Group by month
  const monthlyIncome = new Map();
  incomeTransactions.forEach(t => {
    const month = format(new Date(t.date), 'yyyy-MM');
    monthlyIncome.set(month, (monthlyIncome.get(month) || 0) + t.amount);
  });

  const amounts = Array.from(monthlyIncome.values());
  if (amounts.length < 2) return 70;

  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / amounts.length;
  const stability = Math.max(0, 100 - (Math.sqrt(variance) / avg) * 50);
  
  return Math.min(100, stability);
};

const calculateDebtManagement = (accounts: any[]) => {
  const debtAccounts = accounts.filter(a => 
    a.type?.toLowerCase().includes('credit') || 
    a.type?.toLowerCase().includes('loan') ||
    a.type?.toLowerCase().includes('mortgage')
  );
  
  if (debtAccounts.length === 0) return 100; // No debt = excellent
  
  const totalDebt = debtAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalAssets = accounts
    .filter(a => !a.type?.toLowerCase().includes('credit') && !a.type?.toLowerCase().includes('loan'))
    .reduce((acc, a) => acc + Math.abs(a.balance), 0);
  
  if (totalAssets === 0) return 30;
  
  const debtRatio = totalDebt / totalAssets;
  const score = Math.max(0, 100 - (debtRatio * 70));
  return Math.min(100, score);
};

const calculateEmergencyFund = (accounts: any[], totalExpense: number) => {
  const cashAccounts = accounts.filter(a => 
    a.type?.toLowerCase().includes('checking') || 
    a.type?.toLowerCase().includes('savings') ||
    a.type?.toLowerCase().includes('cash')
  );
  
  const totalCash = cashAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const monthlyExpense = totalExpense || 1;
  
  const monthsCovered = totalCash / monthlyExpense;
  const idealMonths = 6;
  
  const score = Math.min(100, (monthsCovered / idealMonths) * 100);
  return Math.max(0, Math.min(100, score));
};

const calculateInvestmentHealth = (accounts: any[]) => {
  const investmentAccounts = accounts.filter(a => 
    a.type?.toLowerCase().includes('investment') || 
    a.type?.toLowerCase().includes('retirement') ||
    a.type?.toLowerCase().includes('brokerage') ||
    a.type?.toLowerCase().includes('401k') ||
    a.type?.toLowerCase().includes('ira')
  );
  
  if (investmentAccounts.length === 0) return 0;
  
  const totalInvestments = investmentAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const uniqueTypes = new Set(investmentAccounts.map(a => a.type));
  
  // Score based on diversification and total invested
  const diversificationScore = Math.min(40, uniqueTypes.size * 8);
  const amountScore = Math.min(60, (totalInvestments / 50000) * 60); // $50k as benchmark
  
  return diversificationScore + amountScore;
};

// Modern Card Component
function ModernCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Card 
      className={cn(
        "rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300",
        onClick && "cursor-pointer hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

// Gauge Chart Component
function GaugeChart({ score }: { score: number }) {
  const data = [
    { name: 'Score', value: score, fill: 'hsl(var(--primary))' },
    { name: 'Remaining', value: 1000 - score, fill: 'hsl(var(--muted))' }
  ];

  const category = scoreCategories.find(c => score >= c.range[0] && score <= c.range[1]) || scoreCategories[3];
  const Icon = category.icon;

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill} 
                stroke={entry.fill}
                className="transition-all duration-300"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className={cn("px-4 py-1.5 rounded-full mb-3 flex items-center gap-2", category.bg)}>
          <Icon className={cn("h-4 w-4", category.color)} />
          <span className={cn("text-sm font-medium", category.color)}>{category.label}</span>
        </div>
        <span className="text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {score}
        </span>
        <span className="text-sm text-muted-foreground mt-2">out of 1000</span>
      </div>
    </div>
  );
}

// Factor Score Component
function FactorScore({ factor, score }: { factor: typeof scoreFactors[0]; score: number }) {
  const Icon = factor.icon;
  
  const getScoreStatus = (value: number) => {
    if (value >= 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (value >= 60) return { label: "Good", color: "text-primary", bg: "bg-primary/10" };
    if (value >= 40) return { label: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Needs Work", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const status = getScoreStatus(score);

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", factor.bg)}>
            <Icon className={cn("h-5 w-5", factor.color)} />
          </div>
          <div>
            <h4 className="font-medium text-sm">{factor.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
          </div>
        </div>
        <div className={cn("px-2 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
          {status.label}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Score</span>
          <span className="font-semibold">{Math.round(score)}%</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="text-center">
          <div className="text-xs font-medium text-emerald-500">Good</div>
          <div className="text-[10px] text-muted-foreground">{factor.good}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-yellow-500">Fair</div>
          <div className="text-[10px] text-muted-foreground">{factor.fair}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-destructive">Poor</div>
          <div className="text-[10px] text-muted-foreground">{factor.poor}</div>
        </div>
      </div>
    </div>
  );
}

// Historical Trends Component
function HistoricalTrends({ transactions }: { transactions: any[] }) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return d;
  }).reverse();

  const data = last6Months.map(date => {
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return {
      month: format(date, 'MMM'),
      savingsRate: Math.round(savingsRate),
      score: Math.round(300 + savingsRate * 7), // Rough score calculation
      income: Math.round(income / 1000),
      expense: Math.round(expense / 1000),
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2} 
            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
            name="Health Score"
          />
          <Line 
            type="monotone" 
            dataKey="savingsRate" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2} 
            dot={{ r: 4, fill: 'hsl(var(--chart-2))' }}
            name="Savings Rate %"
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Recommendations Component
function Recommendations({ factors }: { factors: any[] }) {
  const weakFactors = factors.filter(f => f.score < 60);
  
  const getRecommendation = (factor: any) => {
    switch(factor.name) {
      case "Savings Rate":
        return "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Set up automatic transfers to savings.";
      case "Budget Adherence":
        return "Review your budget categories weekly. Use our budgeting tools to track spending in real-time.";
      case "Income Stability":
        return "Consider diversifying income sources. Freelancing, investments, or side businesses can help.";
      case "Debt Management":
        return "Focus on high-interest debt first. Consider debt consolidation or the snowball method.";
      case "Emergency Fund":
        return "Aim for 3-6 months of expenses. Start small - even $50 per week adds up.";
      case "Investment Health":
        return "Start with low-cost index funds. Diversify across stocks, bonds, and real estate.";
      default:
        return "Focus on improving this area to boost your overall score.";
    }
  };

  return (
    <div className="space-y-4">
      {weakFactors.length > 0 ? (
        weakFactors.map((factor, index) => (
          <ModernCard key={index} className="p-5 border-l-4" style={{ borderLeftColor: `hsl(var(--${factor.color.split('-')[1]}))` }}>
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl", factor.bg)}>
                <factor.icon className={cn("h-5 w-5", factor.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Improve your {factor.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    Priority {index + 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {getRecommendation(factor)}
                </p>
                <Button variant="link" className="p-0 h-auto text-sm text-primary">
                  View detailed guide <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </ModernCard>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
            <Award className="h-12 w-12 text-primary" />
          </div>
          <h4 className="text-xl font-semibold mb-2">Excellent financial health!</h4>
          <p className="text-muted-foreground max-w-md mx-auto">
            You're doing great! Keep up the good habits and check back monthly to track your progress.
          </p>
        </div>
      )}
    </div>
  );
}

// Comparison Component
function Comparison({ score, factors }: { score: number; factors: any[] }) {
  const averages = {
    overall: 620,
    savingsRate: 45,
    budgetAdherence: 55,
    incomeStability: 65,
    debtManagement: 50,
    emergencyFund: 40,
    investmentHealth: 30,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50">
        <div>
          <p className="text-sm text-muted-foreground">Your Score</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Avg. User</p>
          <p className="text-2xl font-bold">{averages.overall}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Difference</p>
          <p className={cn("text-2xl font-bold", score > averages.overall ? "text-emerald-500" : "text-destructive")}>
            {score > averages.overall ? '+' : ''}{Math.round(score - averages.overall)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => {
          const avg = averages[factor.name.toLowerCase().replace(' ', '') as keyof typeof averages] || 50;
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{factor.name}</span>
              <div className="flex items-center gap-3">
                <span className={cn("font-medium", factor.score > avg ? "text-emerald-500" : "text-destructive")}>
                  {Math.round(factor.score)}%
                </span>
                <span className="text-muted-foreground">vs {avg}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScorePage() {
  const { isPro, loading: authLoading } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { formatCurrency } = useCurrency();
  
  const router = useRouter();
  const [score, setScore] = React.useState<number | null>(null);
  const [summary, setSummary] = React.useState('');
  const [factors, setFactors] = React.useState<any[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const loading = authLoading || transactionsLoading || accountsLoading || budgetsLoading || goalsLoading;

  // Calculate real scores for each factor
  const calculateRealScores = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const savingsRate = calculateSavingsRate(totalIncome, totalExpense);
    const budgetAdherence = calculateBudgetAdherence(budgets, transactions);
    const incomeStability = calculateIncomeStability(transactions);
    const debtManagement = calculateDebtManagement(accounts);
    const emergencyFund = calculateEmergencyFund(accounts, totalExpense);
    const investmentHealth = calculateInvestmentHealth(accounts);

    return [
      { ...scoreFactors[0], score: savingsRate },
      { ...scoreFactors[1], score: budgetAdherence },
      { ...scoreFactors[2], score: incomeStability },
      { ...scoreFactors[3], score: debtManagement },
      { ...scoreFactors[4], score: emergencyFund },
      { ...scoreFactors[5], score: investmentHealth },
    ];
  };

  // Calculate overall score
  const calculateOverallScore = (factorScores: any[]) => {
    const weightedScore = factorScores.reduce((acc, factor) => {
      return acc + (factor.score * factor.weight / 100);
    }, 0);
    
    // Scale to 0-1000 range
    return Math.round(weightedScore * 10);
  };

  const handleGenerateScore = async () => {
    if (!isPro) {
      router.push("/dashboard/upgrade");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Calculate real scores
      const factorScores = calculateRealScores();
      const overallScore = calculateOverallScore(factorScores);
      
      setScore(overallScore);
      setFactors(factorScores);
      setLastUpdated(new Date());

      // Generate AI summary using existing flow
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
      const budgetWithSpent = budgets.map(b => ({
        ...b,
        spent: transactions.filter(t => t.type === 'expense' && t.category?.toLowerCase() === b.category?.toLowerCase()).reduce((acc, t) => acc + t.amount, 0)
      }));

      const result = await generateFinancialHealthScore({
        totalIncome,
        totalExpense,
        totalBalance,
        savingsGoals: JSON.stringify(goals),
        budgets: JSON.stringify(budgetWithSpent)
      });
      
      setSummary(result.summary);
    } catch (e) {
      console.error(e);
      setError("Failed to generate score. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const category = score ? scoreCategories.find(c => score >= c.range[0] && score <= c.range[1]) || scoreCategories[3] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              {isPro && (
                <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro Feature
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Financial Health Score
            </h1>
            <p className="text-muted-foreground mt-2">
              Get a comprehensive analysis of your financial wellness with AI-powered insights
            </p>
          </div>
          
          {lastUpdated && (
            <Badge variant="outline" className="px-3 py-2 text-sm">
              <Clock className="h-3 w-3 mr-2" />
              Last updated: {format(lastUpdated, 'MMM d, h:mm a')}
            </Badge>
          )}
        </div>

        {/* Main Card */}
        <ModernCard className="w-full overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Action Section */}
            <div className="flex flex-col items-center justify-center mb-8">
              {loading ? (
                <Skeleton className="h-12 w-56" />
              ) : (
                <Button 
                  onClick={handleGenerateScore} 
                  disabled={isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 h-12 text-base shadow-lg"
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing Your Finances...</>
                  ) : isPro ? (
                    <><Sparkles className="mr-2 h-5 w-5" />{score !== null ? 'Recalculate Score' : 'Calculate My Score'}</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Upgrade to Get Your Score</>
                  )}
                </Button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 mb-6">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Score Display */}
            {isGenerating ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : score !== null && isPro ? (
              <div className="space-y-8">
                {/* Score Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 border">
                      <GaugeChart score={score} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <ModernCard className="p-5">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Key Metrics
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Income</span>
                          <span className="font-medium">{formatCurrency(transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Expenses</span>
                          <span className="font-medium">{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Net Worth</span>
                          <span className="font-medium">{formatCurrency(accounts.reduce((acc, a) => acc + a.balance, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Active Goals</span>
                          <span className="font-medium">{goals.filter(g => g.status === 'active').length}</span>
                        </div>
                      </div>
                    </ModernCard>

                    <ModernCard className="p-5">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Comparison
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Your Score</p>
                          <p className="text-xl font-bold text-primary">{score}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. User</p>
                          <p className="text-xl font-bold">620</p>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          score > 620 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        )}>
                          {score > 620 ? '+' : ''}{score - 620}
                        </div>
                      </div>
                    </ModernCard>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary shadow-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">AI Analysis</h4>
                      <p className="text-muted-foreground leading-relaxed">{summary}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="factors" className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="factors">Factors</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  {/* Factors Tab */}
                  <TabsContent value="factors" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {factors.map((factor, index) => (
                        <FactorScore key={index} factor={factor} score={factor.score} />
                      ))}
                    </div>
                  </TabsContent>

                  {/* Trends Tab */}
                  <TabsContent value="trends" className="space-y-6">
                    <div className="p-6 rounded-xl border">
                      <h4 className="text-sm font-medium mb-6">6-Month History</h4>
                      <HistoricalTrends transactions={transactions} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ModernCard className="p-5 text-center">
                        <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">+12%</p>
                        <p className="text-xs text-muted-foreground">vs last month</p>
                      </ModernCard>
                      <ModernCard className="p-5 text-center">
                        <Target className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">850</p>
                        <p className="text-xs text-muted-foreground">Next milestone</p>
                      </ModernCard>
                      <ModernCard className="p-5 text-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-2xl font-bold">30</p>
                        <p className="text-xs text-muted-foreground">Days to next update</p>
                      </ModernCard>
                    </div>
                  </TabsContent>

                  {/* Insights Tab */}
                  <TabsContent value="insights" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ModernCard className="p-6">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-primary" />
                          Recommendations
                        </h4>
                        <Recommendations factors={factors} />
                      </ModernCard>
                      <ModernCard className="p-6">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Peer Comparison
                        </h4>
                        <Comparison score={score} factors={factors} />
                      </ModernCard>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="p-4 rounded-full bg-primary/10 mb-6">
                  <Activity className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No Score Yet</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  {isPro 
                    ? "Click the button above to generate your personalized financial health score based on your actual data."
                    : "Upgrade to Pro to get your personalized financial health score and unlock AI-powered insights."}
                </p>
                {!isPro && (
                  <Button className="bg-gradient-to-r from-primary to-purple-600 px-8" asChild>
                    <a href="/dashboard/upgrade">Upgrade to Pro</a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </ModernCard>

        {/* Info Footer */}
        {!isPro && !loading && score === null && (
          <ModernCard className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-3">Unlock Your Financial Health Score</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Real-time score calculation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Detailed factor breakdown</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Personalized recommendations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Historical trends tracking</span>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600" asChild>
                  <a href="/dashboard/upgrade">Upgrade Now</a>
                </Button>
              </div>
            </CardContent>
          </ModernCard>
        )}
      </div>
    </div>
  );
}