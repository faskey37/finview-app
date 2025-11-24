"use client"
import * as React from "react"
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, Search, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Transaction Statistics Component
function TransactionStatistics({ transactions, accounts }: { transactions: any[], accounts: any[] }) {
  const { formatCurrency } = useCurrency();
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  
  const netFlow = totalIncome - totalExpenses;
  
  const stats = [
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      description: "This month",
      icon: TrendingUp,
      trend: 8.2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      description: "This month",
      icon: TrendingDown,
      trend: -3.1,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      label: "Net Cash Flow",
      value: formatCurrency(netFlow),
      description: "Income vs Expenses",
      icon: netFlow >= 0 ? TrendingUp : TrendingDown,
      trend: netFlow >= 0 ? 12.5 : -5.2,
      color: netFlow >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: netFlow >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
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
              <div className={cn("p-3 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Export functionality utilities
const exportToCSV = (transactions: any[], accounts: any[], filename: string = 'transactions') => {
  if (transactions.length === 0) return;

  // Create CSV headers
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Account', 'Status'];
  
  // Map transactions to CSV rows
  const csvData = transactions.map(transaction => {
    const account = accounts.find(acc => acc.id === transaction.accountId);
    return [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description || 'N/A',
      transaction.category || 'Uncategorized',
      transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'N/A',
      transaction.amount.toString(),
      account?.provider || 'Unknown Account',
      transaction.status || 'Completed'
    ];
  });

  // Combine headers and data
  const csvContent = [
    headers,
    ...csvData
  ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToJSON = (transactions: any[], filename: string = 'transactions') => {
  if (transactions.length === 0) return;

  const exportData = {
    exportDate: new Date().toISOString(),
    transactionCount: transactions.length,
    transactions: transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      accountId: transaction.accountId,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printTransactions = (transactions: any[], accounts: any[]) => {
  if (transactions.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const transactionRows = transactions.map(transaction => {
    const account = accounts.find(acc => acc.id === transaction.accountId);
    return `
      <tr>
        <td>${new Date(transaction.date).toLocaleDateString()}</td>
        <td>${transaction.description || 'N/A'}</td>
        <td>${transaction.category || 'Uncategorized'}</td>
        <td>${transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'N/A'}</td>
        <td>$${transaction.amount.toFixed(2)}</td>
        <td>${account?.provider || 'Unknown Account'}</td>
        <td>${transaction.status || 'Completed'}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transactions Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Transactions Report</h1>
        <div class="summary">
          <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
          <strong>Total Transactions:</strong> ${transactions.length}
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Account</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Quick Actions Component with Export Menu
function QuickActions({ 
  onAddTransaction, 
  onExport, 
  isLoading,
  transactions,
  accounts 
}: { 
  onAddTransaction: () => void; 
  onExport: (format: 'csv' | 'json' | 'print') => void;
  isLoading: boolean;
  transactions: any[];
  accounts: any[];
}) {
  const { toast } = useToast();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'print') => {
    if (transactions.length === 0) {
      toast({
        variant: "destructive",
        title: "No transactions to export",
        description: "There are no transactions to export.",
      });
      return;
    }

    setExporting(true);
    
    try {
      switch (format) {
        case 'csv':
          exportToCSV(transactions, accounts);
          break;
        case 'json':
          exportToJSON(transactions);
          break;
        case 'print':
          printTransactions(transactions, accounts);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `Transactions exported as ${format.toUpperCase()}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export transactions. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
        <p className="text-muted-foreground">
          View and manage all your financial transactions
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')} 
            disabled={isLoading || exporting || transactions.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
        <Button onClick={onAddTransaction} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
}

// Filters Component
function TransactionFilters({ 
  accounts, 
  onSearchChange, 
  onAccountFilterChange, 
  onTypeFilterChange,
  searchTerm,
  selectedAccount,
  selectedType 
}: { 
  accounts: any[];
  onSearchChange: (value: string) => void;
  onAccountFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  searchTerm: string;
  selectedAccount: string;
  selectedType: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={selectedAccount} onValueChange={onAccountFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedType} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
    const { transactions, loading: transactionsLoading } = useTransactions();
    const { accounts, loading: accountsLoading } = useAccounts();
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedAccount, setSelectedAccount] = React.useState("all");
    const [selectedType, setSelectedType] = React.useState("all");
    const [activeTab, setActiveTab] = React.useState("all");
    const { toast } = useToast();
    
    const loading = transactionsLoading || accountsLoading;

    // Filter transactions based on search and filters
    const filteredTransactions = React.useMemo(() => {
      return transactions.filter(transaction => {
        const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAccount = selectedAccount === "all" || transaction.accountId === selectedAccount;
        
        const matchesType = selectedType === "all" || transaction.type === selectedType;
        
        const matchesTab = activeTab === "all" || 
                          (activeTab === "income" && transaction.type === "income") ||
                          (activeTab === "expenses" && transaction.type === "expense");

        return matchesSearch && matchesAccount && matchesType && matchesTab;
      });
    }, [transactions, searchTerm, selectedAccount, selectedType, activeTab]);

    const handleExport = (format: 'csv' | 'json' | 'print') => {
      const transactionsToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
      
      if (transactionsToExport.length === 0) {
        toast({
          variant: "destructive",
          title: "No transactions to export",
          description: "There are no transactions to export.",
        });
        return;
      }

      try {
        switch (format) {
          case 'csv':
            exportToCSV(transactionsToExport, accounts, `transactions-${activeTab}`);
            break;
          case 'json':
            exportToJSON(transactionsToExport, `transactions-${activeTab}`);
            break;
          case 'print':
            printTransactions(transactionsToExport, accounts);
            break;
        }
        
        toast({
          title: "Export successful",
          description: `Transactions exported as ${format.toUpperCase()}`,
          variant: "default"
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          variant: "destructive",
          title: "Export failed",
          description: "Failed to export transactions. Please try again.",
        });
      }
    };

    if (loading) {
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      );
    }

    return (
        <div className="flex flex-col gap-6">
          {/* Header with Quick Actions */}
          <QuickActions 
            onAddTransaction={() => setAddDialogOpen(true)}
            onExport={handleExport}
            isLoading={loading}
            transactions={filteredTransactions}
            accounts={accounts}
          />

          {/* Transaction Statistics */}
          {transactions.length > 0 && (
            <TransactionStatistics transactions={transactions} accounts={accounts} />
          )}

          {/* Filters */}
          <TransactionFilters
            accounts={accounts}
            onSearchChange={setSearchTerm}
            onAccountFilterChange={setSelectedAccount}
            onTypeFilterChange={setSelectedType}
            searchTerm={searchTerm}
            selectedAccount={selectedAccount}
            selectedType={selectedType}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  All Transactions
                  <Badge variant="secondary" className="ml-2">
                    {filteredTransactions.length}
                  </Badge>
                </h3>
                <div className="text-sm text-muted-foreground">
                  Sorted by: Most Recent
                </div>
              </div>
              <RecentTransactions 
                transactions={filteredTransactions} 
                accounts={accounts} 
                addDialogOpen={addDialogOpen}
                setAddDialogOpen={setAddDialogOpen}
              />
            </TabsContent>

            <TabsContent value="income" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Income Transactions
                  <Badge variant="secondary" className="ml-2">
                    {filteredTransactions.filter(t => t.type === 'income').length}
                  </Badge>
                </h3>
              </div>
              <RecentTransactions 
                transactions={filteredTransactions.filter(t => t.type === 'income')} 
                accounts={accounts} 
                addDialogOpen={addDialogOpen}
                setAddDialogOpen={setAddDialogOpen}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Expense Transactions
                  <Badge variant="secondary" className="ml-2">
                    {filteredTransactions.filter(t => t.type === 'expense').length}
                  </Badge>
                </h3>
              </div>
              <RecentTransactions 
                transactions={filteredTransactions.filter(t => t.type === 'expense')} 
                accounts={accounts} 
                addDialogOpen={addDialogOpen}
                setAddDialogOpen={setAddDialogOpen}
              />
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Analysis</CardTitle>
                  <CardDescription>
                    Insights and trends from your transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analysis Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Detailed charts and insights will be available here soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {filteredTransactions.length === 0 && transactions.length > 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedAccount("all");
                    setSelectedType("all");
                    setActiveTab("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {transactions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your finances by adding your first transaction
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Transaction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
    );
}