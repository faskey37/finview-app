
"use client"
import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useCurrency } from "@/hooks/use-currency"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- Schemas ---
const loanSchema = z.object({
  principal: z.coerce.number().min(1000, "Must be at least 1,000"),
  interestRate: z.coerce.number().min(0.1, "Must be at least 0.1%").max(30, "Cannot exceed 30%"),
  years: z.coerce.number().min(1, "Must be at least 1 year").max(40, "Cannot exceed 40 years"),
})

const sipSchema = z.object({
  monthlyInvestment: z.coerce.number().min(10, "Must be at least 10"),
  returnRate: z.coerce.number().min(0.1, "Must be at least 0.1%").max(30, "Cannot exceed 30%"),
  years: z.coerce.number().min(1, "Must be at least 1 year").max(40, "Cannot exceed 40 years"),
})

const taxSchema = z.object({
    income: z.coerce.number().min(0, "Income must be a positive number"),
});

const retirementSchema = z.object({
    currentAge: z.coerce.number().min(18, "Must be at least 18").max(99),
    retirementAge: z.coerce.number().min(19, "Must be older than current age").max(100),
    currentSavings: z.coerce.number().min(0),
    monthlyContribution: z.coerce.number().min(0),
    returnRate: z.coerce.number().min(0.1, "Must be at least 0.1%").max(30, "Cannot exceed 30%"),
}).refine(data => data.retirementAge > data.currentAge, {
    message: "Retirement age must be after current age.",
    path: ["retirementAge"],
});

const emergencyFundSchema = z.object({
    monthlyExpenses: z.coerce.number().min(1, "Must be at least 1"),
});


// --- Tax Brackets (Simplified Example) ---
const taxBrackets = [
    { upTo: 11000, rate: 0.10 },
    { upTo: 44725, rate: 0.12 },
    { upTo: 95375, rate: 0.22 },
    { up to: 182100, rate: 0.24 },
    { upTo: 231250, rate: 0.32 },
    { upTo: 578125, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
];


function LoanCalculator() {
    const { formatCurrency, formatCompactNumber } = useCurrency();
    const [monthlyPayment, setMonthlyPayment] = React.useState<number | null>(null)
    const [totalPayment, setTotalPayment] = React.useState<number | null>(null)
    const [totalInterest, setTotalInterest] = React.useState<number | null>(null)

    const form = useForm<z.infer<typeof loanSchema>>({
        resolver: zodResolver(loanSchema),
        defaultValues: { principal: 50000, interestRate: 5, years: 10 },
    });
    
    const watchedValues = useWatch({ control: form.control });

    React.useEffect(() => {
        const calculateLoan = (values: z.infer<typeof loanSchema>) => {
            const principal = values.principal;
            const monthlyInterestRate = values.interestRate / 100 / 12;
            const numberOfPayments = values.years * 12;

            if (monthlyInterestRate === 0) {
                const payment = principal / numberOfPayments;
                setMonthlyPayment(payment);
                setTotalPayment(principal);
                setTotalInterest(0);
                return;
            }

            const payment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
            const totalPaid = payment * numberOfPayments;
            const interestPaid = totalPaid - principal;

            setMonthlyPayment(payment);
            setTotalPayment(totalPaid);
            setTotalInterest(interestPaid);
        }
        calculateLoan(watchedValues as z.infer<typeof loanSchema>);
    }, [watchedValues]);


  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Form {...form}>
            <form className="space-y-6">
            <FormField control={form.control} name="principal" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between">
                        <FormLabel>Loan Amount</FormLabel>
                        <span className="text-sm font-medium">{formatCurrency(field.value)}</span>
                    </div>
                    <FormControl><Input type="number" min={1000} step={1000} {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between">
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <span className="text-sm font-medium">{field.value}%</span>
                    </div>
                    <FormControl><Slider min={0.1} max={30} step={0.1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between">
                        <FormLabel>Loan Term (Years)</FormLabel>
                        <span className="text-sm font-medium">{field.value} years</span>
                    </div>
                    <FormControl><Slider min={1} max={40} step={1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            </form>
        </Form>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Your Estimated Payments</h3>
            <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="text-2xl font-bold text-primary">{monthlyPayment !== null ? formatCurrency(monthlyPayment) : '-'}</span>
            </div>
                <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Total Payment</span>
                <span className="font-semibold">{totalPayment !== null ? formatCompactNumber(totalPayment) : '-'}</span>
            </div>
                <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Interest Paid</span>
                <span className="font-semibold">{totalInterest !== null ? formatCompactNumber(totalInterest) : '-'}</span>
            </div>
        </div>
    </div>
  );
}

function SipCalculator() {
    const { formatCurrency, formatCompactNumber } = useCurrency();
    const [futureValue, setFutureValue] = React.useState<number | null>(null);
    const [totalInvested, setTotalInvested] = React.useState<number | null>(null);
    const [totalGains, setTotalGains] = React.useState<number | null>(null);

    const form = useForm<z.infer<typeof sipSchema>>({
        resolver: zodResolver(sipSchema),
        defaultValues: { monthlyInvestment: 500, returnRate: 12, years: 10 },
    });
    
    const watchedValues = useWatch({ control: form.control });

    React.useEffect(() => {
        const calculateSip = (values: z.infer<typeof sipSchema>) => {
            const P = values.monthlyInvestment;
            const i = values.returnRate / 100 / 12;
            const n = values.years * 12;
            
            const M = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const invested = P * n;
            const gains = M - invested;

            setFutureValue(M);
            setTotalInvested(invested);
            setTotalGains(gains);
        }
        calculateSip(watchedValues as z.infer<typeof sipSchema>);
    }, [watchedValues]);

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
                <form className="space-y-6">
                    <FormField control={form.control} name="monthlyInvestment" render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between">
                                <FormLabel>Monthly Investment</FormLabel>
                                <span className="text-sm font-medium">{formatCurrency(field.value)}</span>
                            </div>
                            <FormControl><Input type="number" min={10} step={100} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="returnRate" render={({ field }) => (
                        <FormItem>
                           <div className="flex justify-between">
                                <FormLabel>Expected Return Rate (% p.a.)</FormLabel>
                                <span className="text-sm font-medium">{field.value}%</span>
                            </div>
                          <FormControl><Slider min={0.1} max={30} step={0.1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="years" render={({ field }) => (
                        <FormItem>
                           <div className="flex justify-between">
                                <FormLabel>Investment Period (Years)</FormLabel>
                                <span className="text-sm font-medium">{field.value} years</span>
                            </div>
                          <FormControl><Slider min={1} max={40} step={1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">Investment Projection</h3>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Future Value</span>
                    <span className="text-2xl font-bold text-primary">{futureValue !== null ? formatCompactNumber(futureValue) : '-'}</span>
                </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Total Invested</span>
                    <span className="font-semibold">{totalInvested !== null ? formatCompactNumber(totalInvested) : '-'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated Gains</span>
                    <span className="font-semibold">{totalGains !== null ? formatCompactNumber(totalGains) : '-'}</span>
                </div>
            </div>
        </div>
    );
}

function IncomeTaxCalculator() {
    const { formatCurrency, formatCompactNumber } = useCurrency();
    const [totalTax, setTotalTax] = React.useState<number | null>(null);

    const form = useForm<z.infer<typeof taxSchema>>({
        resolver: zodResolver(taxSchema),
        defaultValues: { income: 60000 },
    });
    
    const watchedValues = useWatch({ control: form.control });

    React.useEffect(() => {
        const calculateTax = (values: z.infer<typeof taxSchema>) => {
            let income = values.income;
            let tax = 0;
            let lastBracketLimit = 0;

            for (const bracket of taxBrackets) {
                if (income > lastBracketLimit) {
                    const taxableInBracket = Math.min(income - lastBracketLimit, bracket.upTo - lastBracketLimit);
                    tax += taxableInBracket * bracket.rate;
                    lastBracketLimit = bracket.upTo;
                } else {
                    break;
                }
            }
            setTotalTax(tax);
        };
        calculateTax(watchedValues as z.infer<typeof taxSchema>);
    }, [watchedValues]);

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
                <form className="space-y-6">
                    <FormField control={form.control} name="income" render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between">
                                <FormLabel>Annual Income</FormLabel>
                                <span className="text-sm font-medium">{formatCurrency(field.value)}</span>
                            </div>
                            <FormControl><Input type="number" min={0} step={1000} {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                    <p className="text-xs text-muted-foreground">This is a simplified tax estimator for informational purposes only. Consult a tax professional for accurate advice.</p>
                </form>
            </Form>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">Estimated Tax Liability</h3>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="text-2xl font-bold text-primary">{totalTax !== null ? formatCompactNumber(totalTax) : '-'}</span>
                </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Effective Tax Rate</span>
                    <span className="font-semibold">{totalTax !== null && watchedValues.income > 0 ? `${((totalTax / watchedValues.income) * 100).toFixed(2)}%` : '0.00%'}</span>
                </div>
            </div>
        </div>
    );
}


function RetirementCalculator() {
    const { formatCurrency, formatCompactNumber } = useCurrency();
    const [futureValue, setFutureValue] = React.useState<number | null>(null);

    const form = useForm<z.infer<typeof retirementSchema>>({
        resolver: zodResolver(retirementSchema),
        defaultValues: { currentAge: 30, retirementAge: 65, currentSavings: 50000, monthlyContribution: 500, returnRate: 7 },
    });
    
    const watchedValues = useWatch({ control: form.control });

    React.useEffect(() => {
        const calculateRetirement = (values: z.infer<typeof retirementSchema>) => {
            const { currentAge, retirementAge, currentSavings, monthlyContribution, returnRate } = values;
            if (retirementAge <= currentAge) return;

            const yearsToGrow = retirementAge - currentAge;
            const monthsToGrow = yearsToGrow * 12;
            const monthlyRate = returnRate / 100 / 12;

            const finalCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsToGrow);
            
            const finalMonthlyContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToGrow) - 1) / monthlyRate);

            setFutureValue(finalCurrentSavings + finalMonthlyContributions);
        }
        calculateRetirement(watchedValues as z.infer<typeof retirementSchema>);
    }, [watchedValues]);

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="currentAge" render={({ field }) => (
                            <FormItem><FormLabel>Current Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="retirementAge" render={({ field }) => (
                            <FormItem><FormLabel>Retirement Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="currentSavings" render={({ field }) => (
                        <FormItem><FormLabel>Current Savings</FormLabel><FormControl><Input type="number" step={1000} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                        <FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl><Input type="number" step={100} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="returnRate" render={({ field }) => (
                        <FormItem>
                           <div className="flex justify-between">
                                <FormLabel>Expected Return Rate (% p.a.)</FormLabel>
                                <span className="text-sm font-medium">{field.value}%</span>
                            </div>
                          <FormControl><Slider min={0.1} max={30} step={0.1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>

            <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold mb-4">Estimated Retirement Corpus</h3>
                <span className="text-4xl font-bold text-primary">{futureValue !== null ? formatCompactNumber(futureValue) : '-'}</span>
                 <p className="text-sm text-muted-foreground mt-2">At age {form.getValues('retirementAge')}</p>
            </div>
        </div>
    );
}

function EmergencyFundCalculator() {
    const { formatCurrency, formatCompactNumber } = useCurrency();
    const form = useForm<z.infer<typeof emergencyFundSchema>>({
        resolver: zodResolver(emergencyFundSchema),
        defaultValues: { monthlyExpenses: 2000 },
    });
    
    const watchedValues = useWatch({ control: form.control });
    const { monthlyExpenses } = watchedValues;

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
                <form className="space-y-6">
                    <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Essential Expenses</FormLabel>
                            <FormControl><Input type="number" min={1} step={100} {...field} /></FormControl>
                             <FormDescription>Include rent/mortgage, utilities, food, transport, and insurance.</FormDescription>
                             <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">Your Emergency Fund Goal</h3>
                <div className="flex justify-between items-center text-center">
                    <div className="w-1/3">
                        <p className="text-muted-foreground text-sm">3 Months</p>
                        <p className="font-bold text-lg">{formatCompactNumber(monthlyExpenses * 3)}</p>
                    </div>
                     <div className="w-1/3 border-x">
                        <p className="text-muted-foreground text-sm">6 Months</p>
                        <p className="font-bold text-lg text-primary">{formatCompactNumber(monthlyExpenses * 6)}</p>
                         <p className="text-xs text-muted-foreground">(Recommended)</p>
                    </div>
                     <div className="w-1/3">
                        <p className="text-muted-foreground text-sm">9 Months</p>
                        <p className="font-bold text-lg">{formatCompactNumber(monthlyExpenses * 9)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function CalculatorsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Financial Calculators</h1>
      <Tabs defaultValue="loan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="loan">Loan & EMI</TabsTrigger>
          <TabsTrigger value="sip">SIP</TabsTrigger>
          <TabsTrigger value="tax">Income Tax</TabsTrigger>
          <TabsTrigger value="retirement">Retirement</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Fund</TabsTrigger>
        </TabsList>
        <TabsContent value="loan">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Loan & EMI Calculator</CardTitle>
                    <CardDescription>Estimate your monthly loan payments and total cost.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoanCalculator />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sip">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">SIP Calculator</CardTitle>
                    <CardDescription>Project the future value of your systematic investments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SipCalculator />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="tax">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Income Tax Calculator</CardTitle>
                    <CardDescription>Get a simplified estimate of your annual income tax.</CardDescription>
                </Header>
                <CardContent>
                    <IncomeTaxCalculator />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="retirement">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Retirement Calculator</CardTitle>
                    <CardDescription>Project your savings to see how much you'll have at retirement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RetirementCalculator />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="emergency">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Emergency Fund Calculator</CardTitle>
                    <CardDescription>Determine how much you should save for unexpected events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EmergencyFundCalculator />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
