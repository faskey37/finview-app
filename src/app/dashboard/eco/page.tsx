
"use client"
import * as React from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { generateCarbonFootprint } from "@/ai/flows/generate-carbon.footprint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, Loader2, Leaf, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Footprint } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  co2: {
    label: "CO₂ (kg)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function EcoPage() {
    const { transactions, loading: transactionsLoading } = useTransactions()
    const [footprints, setFootprints] = React.useState<Footprint[]>([])
    const [summary, setSummary] = React.useState('')
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    
    const handleGenerateFootprint = async () => {
        setIsGenerating(true)
        setError(null)
        try {
            const spendingByCategory = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {} as { [key: string]: number });
            
            const result = await generateCarbonFootprint({ spendingData: JSON.stringify(spendingByCategory) })
            setFootprints(result.footprints)
            setSummary(result.summary)
        } catch (e) {
            console.error(e)
            setError("Failed to generate footprint. Please check your API key and try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const totalCO2 = footprints.reduce((acc, f) => acc + f.co2, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Eco-Tracker</h1>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Leaf className="text-green-500" /> Carbon Footprint Analysis</CardTitle>
            <CardDescription>Estimate your environmental impact based on your spending habits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {transactionsLoading ? (
                <Skeleton className="h-12 w-48" />
            ) : (
                 <Button onClick={handleGenerateFootprint} disabled={isGenerating || transactions.length === 0}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Leaf className="mr-2 h-4 w-4" />{footprints.length > 0 ? 'Re-Analyze Spending' : 'Analyze My Spending'}</>
                  )}
                </Button>
            )}
            
            {error && (
                 <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                 </div>
            )}

            {isGenerating ? (
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            ) : footprints.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold">CO₂ by Category (kg)</h3>
                         <div className="h-[250px]">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={footprints} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                                        <ChartTooltip
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            content={<ChartTooltipContent hideLabel formatter={(value) => `${(value as number).toFixed(2)} kg CO₂`} />}
                                        />
                                        <Bar dataKey="co2" fill="var(--color-co2)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                         </div>
                    </div>
                     <div className="bg-muted/50 rounded-lg p-6 space-y-4 flex flex-col justify-center">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Estimated Footprint</p>
                            <p className="text-4xl font-bold text-green-600">{totalCO2.toFixed(2)} kg CO₂</p>
                            <p className="text-xs text-muted-foreground">this month</p>
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground">
                            <h4 className="font-semibold">AI Summary & Tips</h4>
                            <p>{summary}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center w-full h-48 rounded-lg border-2 border-dashed mt-4">
                    <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click the button to generate your eco-report.</p>
                </div>
            )}

          </CardContent>
       </Card>

    </div>
  )
}
