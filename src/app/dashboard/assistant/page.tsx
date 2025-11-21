"use client"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Send, BrainCircuit, Bot, User, Loader2, Sparkles, Zap, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { chatWithAssistant } from "@/ai/flows/chat-with-assistant"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips"

type Message = {
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
}

const welcomeMessage: Message = {
    role: "assistant",
    content: "Hello! I'm your personal financial assistant. How can I help you today? You can ask me about your recent spending, budget status, or any general finance questions.",
    timestamp: new Date()
}

const suggestedQuestions = [
    "What were my top spending categories last month?",
    "How am I doing with my budget?",
    "Show me my recent transactions",
    "Any savings recommendations?"
]

export default function AssistantPage() {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = React.useState<Message[]>([welcomeMessage]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { 
            role: "user", 
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const assistantResponse = await chatWithAssistant(input);
            const assistantMessage: Message = { 
                role: "assistant", 
                content: assistantResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error chatting with assistant:", error);
            toast({
                variant: "destructive",
                title: "Connection Error",
                description: "Unable to reach the assistant. Please check your connection and try again."
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSuggestionClick = (question: string) => {
        setInput(question);
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container max-w-6xl mx-auto p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/70 border shadow-sm">
                                    <BrainCircuit className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    EcoVest AI
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                    Your intelligent financial companion
                                    <Badge variant="secondary" className="text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Secure
                                    </Badge>
                                </p>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        Powered by AI
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Real-time financial insights and analysis</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Fixed Content Area */}
            <div className="flex-1 container max-w-6xl mx-auto p-6 flex flex-col">
                <Card className="flex-1 flex flex-col shadow-lg border-0 bg-gradient-to-br from-background to-muted/20 min-h-0">
                    <CardHeader className="flex-shrink-0 pb-4 space-y-0 border-b bg-gradient-to-r from-muted/30 to-muted/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        Financial Assistant
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                    </CardTitle>
                                    <CardDescription>
                                        Ask me anything about your finances, spending, or investments
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                        {/* Suggested Questions - Fixed */}
                        {messages.length === 1 && (
                            <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedQuestions.map((question, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full text-xs h-8 hover:bg-primary/10 hover:text-primary transition-all"
                                            onClick={() => handleSuggestionClick(question)}
                                        >
                                            {question}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scrollable Chat Area */}
                        <ScrollArea className="flex-1 px-6 py-4">
                            <div className="space-y-6">
                                {messages.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <Avatar className={`h-8 w-8 border-2 ${message.role === 'assistant' ? 'border-primary/20' : 'border-blue-500/20'}`}>
                                            {message.role === 'assistant' ? (
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    <Bot className="h-4 w-4" />
                                                </AvatarFallback>
                                            ) : (
                                                <>
                                                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                                                    <AvatarFallback className="bg-blue-500/10 text-blue-600">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        
                                        <div className={`flex flex-col gap-1 max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                message.role === 'user' 
                                                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md' 
                                                    : 'bg-muted border rounded-bl-md'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                    {message.content}
                                                </p>
                                            </div>
                                            {message.timestamp && (
                                                <p className="text-xs text-muted-foreground px-1">
                                                    {formatTime(message.timestamp)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {isLoading && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1">
                                            <div className="rounded-2xl px-4 py-3 bg-muted border rounded-bl-md shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Fixed Input Area */}
                        <div className="flex-shrink-0 border-t bg-background/50 backdrop-blur-sm p-4">
                            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <Input 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about your finances, budget, or investments..." 
                                        className="pr-12 resize-none min-h-[48px] rounded-2xl border-2 focus:border-primary/30 transition-colors"
                                        disabled={isLoading}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                    />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                type="submit" 
                                                size="icon" 
                                                className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-200 hover:scale-105"
                                                disabled={isLoading || !input.trim()}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Send className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Send message</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </form>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                EcoVest AI provides financial guidance. Always verify important decisions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}