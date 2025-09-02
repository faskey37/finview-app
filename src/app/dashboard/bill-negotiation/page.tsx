
"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Zap, UploadCloud, Bot, FileText, Speech, AlertTriangle, Loader2, Lightbulb } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { negotiateBill, type NegotiateBillOutput } from "@/ai/flows/negotiate-bill"
import { useCurrency } from "@/hooks/use-currency"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function BillNegotiationPage() {
    const { isPro } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const { formatCurrency } = useCurrency()
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const [fileName, setFileName] = React.useState<string | null>(null)
    const [billImage, setBillImage] = React.useState<string | null>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [analysis, setAnalysis] = React.useState<NegotiateBillOutput | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 5MB." })
            return;
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setFileName(file.name)
            setBillImage(reader.result as string)
            setAnalysis(null)
        }
        reader.readAsDataURL(file)
    }

    const handleNegotiate = async () => {
        if (!billImage) {
            toast({ variant: "destructive", title: "No file selected", description: "Please upload your bill first." })
            return
        }
        setIsGenerating(true)
        setError(null)
        setAnalysis(null)
        try {
            const result = await negotiateBill({ billImage })
            setAnalysis(result)
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Failed to generate negotiation script. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    if (!isPro) {
        return (
             <div className="flex flex-col gap-8 items-center">
                <div className="text-center max-w-2xl">
                    <Badge variant="secondary" className="bg-accent/20 text-accent border border-accent/30 mb-4">Pro Feature</Badge>
                    <h1 className="text-3xl font-bold tracking-tight">Lower Your Bills, Automatically</h1>
                    <p className="text-muted-foreground mt-2">Stop overpaying on your monthly bills. Let our AI analyze your bill and generate a negotiation script for you.</p>
                </div>
                 <Button size="lg" onClick={() => router.push('/dashboard/upgrade')}>
                    Upgrade to Pro to Start Saving
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">AI Bill Negotiator</h1>
                <p className="text-muted-foreground mt-2">Upload your bill, and our AI will create a personalized script to help you negotiate a lower rate.</p>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UploadCloud /> Upload Your Bill</CardTitle>
                    <CardDescription>Upload a clear PDF or image of your bill. (Max 5MB)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div 
                        className="flex justify-center w-full rounded-md border-2 border-dashed border-muted-foreground/30 px-6 pt-5 pb-6 cursor-pointer hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="space-y-1 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="flex text-sm text-muted-foreground">
                                <span className="relative rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <span>Upload a file</span>
                                </span>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, PDF up to 5MB</p>
                            <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif, application/pdf" />
                        </div>
                    </div>
                    {fileName && <p className="text-sm text-center text-muted-foreground">Selected file: {fileName}</p>}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleNegotiate} disabled={!billImage || isGenerating} className="w-full">
                        {isGenerating ? <><Loader2 className="animate-spin" />Analyzing Bill...</> : <><Bot /> Generate Script</>}
                    </Button>
                </CardFooter>
            </Card>

            {isGenerating && (
                 <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader><CardTitle>Generating Analysis...</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="w-full max-w-2xl mx-auto border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                 <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Speech/> Your Negotiation Plan</CardTitle>
                        <CardDescription>
                           Here is the AI-generated analysis and script for your <span className="font-bold">{analysis.provider}</span> bill.
                           Your current estimated monthly cost is <span className="font-bold">{formatCurrency(analysis.currentMonthlyCost)}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <h3 className="font-semibold text-lg mb-2">Negotiation Script</h3>
                             <div className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:my-3 bg-muted/50 rounded-lg p-4">
                                {analysis.negotiationScript.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                             </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Key Talking Points</h3>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                {analysis.talkingPoints.map((point, index) => <li key={index}>{point}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
