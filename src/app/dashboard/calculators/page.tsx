
"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useCurrency } from "@/hooks/use-currency"

const loanSchema = z.object({
  principal: z.coerce.number().min(1000, "Must be at least 1,000"),
  interestRate: z.coerce.number().min(0.1, "Must be at least 0.1%").max(30, "Cannot exceed 30%"),
  years: z.coerce.number().min(1, "Must be at least 1 year").max(40, "Cannot exceed 40 years"),
})

export default function CalculatorsPage() {
    const { formatCurrency } = useCurrency();
    const [monthlyPayment, setMonthlyPayment] = React.useState<number | null>(null)
    const [totalPayment, setTotalPayment] = React.useState<number | null>(null)
    const [totalInterest, setTotalInterest] = React.useState<number | null>(null)

    const form = useForm<z.infer<typeof loanSchema>>({
        resolver: zodResolver(loanSchema),
        defaultValues: { principal: 50000, interestRate: 5, years: 10 },
    });

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
    
    React.useEffect(() => {
        calculateLoan(form.getValues());
        const subscription = form.watch(() => calculateLoan(form.getValues()));
        return () => subscription.unsubscribe();
    }, [form]);


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Calculators</h1>
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Loan & EMI Calculator</CardTitle>
            <CardDescription>Estimate your monthly loan payments and total cost.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
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
                      <FormControl><Slider min={0.1} max={30} step={0.1} defaultValue={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                    <FormItem>
                       <div className="flex justify-between">
                            <FormLabel>Loan Term (Years)</FormLabel>
                            <span className="text-sm font-medium">{field.value} years</span>
                        </div>
                      <FormControl><Slider min={1} max={40} step={1} defaultValue={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
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
                    <span className="font-semibold">{totalPayment !== null ? formatCurrency(totalPayment) : '-'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Interest Paid</span>
                    <span className="font-semibold">{totalInterest !== null ? formatCurrency(totalInterest) : '-'}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
