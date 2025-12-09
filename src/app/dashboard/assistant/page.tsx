"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Send, BrainCircuit, Bot, User, Loader2, Sparkles, Zap, Shield, ChevronRight, X, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAIAssistant } from "@/ai/flows/chat-with-assistant"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Message = {
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
}

const suggestedQuestions = [
    "What were my top spending categories last month?",
    "How am I doing with my budget?",
    "Show me my recent transactions",
    "Any savings recommendations?",
    "What's my investment portfolio performance?",
    "Help me plan for retirement"
]

const capabilities = [
    { icon: "📊", text: "Budget Analysis" },
    { icon: "💰", text: "Investment Insights" },
    { icon: "📈", text: "Trend Forecasting" },
    { icon: "🛡️", text: "Risk Assessment" }
]

export default function AssistantPage() {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const { chat, isAvailable } = useAIAssistant();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [showInfoPanel, setShowInfoPanel] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Create welcome message based on auth state
    const welcomeMessage: Message = React.useMemo(() => user ? {
        role: "assistant" as const,
        content: `Hello ${user.displayName || user.email?.split('@')[0] || 'there'}! I'm EcoVest AI, your personal financial assistant. I can see your financial accounts and help you with personalized advice. How can I assist you today?`,
        timestamp: new Date()
    } : {
        role: "assistant" as const,
        content: "Hello! I'm EcoVest AI, your financial assistant. Please sign in to get personalized financial advice based on your accounts. You can still ask general finance questions!",
        timestamp: new Date()
    }, [user]);

    // Initialize messages with welcome message
    React.useEffect(() => {
        if (messages.length === 0) {
            setMessages([welcomeMessage]);
        }
    }, [welcomeMessage, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

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
            const assistantResponse = await chat(input);
            
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
        inputRef.current?.focus();
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    const clearChat = () => {
        setMessages([welcomeMessage]);
        toast({
            title: "Chat cleared",
            description: "Starting fresh conversation"
        });
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
            {/* Fixed Header */}
            <div className="h-16 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="h-full px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 border border-primary/30 shadow-lg group-hover:scale-105 transition-transform duration-200">
                                <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 animate-pulse">
                                <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                EcoVest AI
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Financial Assistant
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="gap-1.5 border border-primary/20 bg-primary/5 text-xs">
                                        <Zap className="h-3 w-3" />
                                        AI Powered
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Real-time financial analysis & insights</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowInfoPanel(!showInfoPanel)}
                            className="h-8 w-8 rounded-full border border-border"
                        >
                            {showInfoPanel ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <MessageSquare className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0">
                {/* Chat Container */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Welcome Suggestions */}
                    {messages.length === 1 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-3xl px-4">
                            <div className="bg-background/95 backdrop-blur-xl border rounded-2xl p-6 shadow-2xl">
                                <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                                    Quick suggestions to get started
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {suggestedQuestions.map((question, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="rounded-xl px-4 py-3 h-auto text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02]"
                                            onClick={() => handleSuggestionClick(question)}
                                        >
                                            <span className="text-sm font-normal">{question}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Chat Messages */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="min-h-full px-4 md:px-8 lg:px-12 xl:px-16 py-4">
                            <div className="max-w-3xl mx-auto space-y-6 pb-4">
                                {messages.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={cn(
                                            "flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300",
                                            message.role === 'user' ? 'flex-row-reverse' : ''
                                        )}
                                    >
                                        <Avatar className={cn(
                                            "h-8 w-8 border shadow-lg transition-transform duration-200 hover:scale-110 flex-shrink-0",
                                            message.role === 'assistant' 
                                                ? 'border-primary/30 bg-primary/5' 
                                                : 'border-blue-500/30 bg-blue-500/5'
                                        )}>
                                            {message.role === 'assistant' ? (
                                                <AvatarFallback className="bg-transparent">
                                                    <Bot className="h-4 w-4 text-primary" />
                                                </AvatarFallback>
                                            ) : (
                                                <>
                                                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                                                    <AvatarFallback className="bg-transparent">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        
                                        <div className={cn(
                                            "flex flex-col gap-1 max-w-[85%]",
                                            message.role === 'user' ? 'items-end' : 'items-start'
                                        )}>
                                            <div className={cn(
                                                "rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl",
                                                message.role === 'user' 
                                                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-primary/30"
                                                    : "bg-card/90 border rounded-bl-md shadow-sm"
                                            )}>
                                                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
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
                                    <div className="flex gap-3 animate-in fade-in">
                                        <Avatar className="h-8 w-8 border border-primary/30 bg-primary/5">
                                            <AvatarFallback className="bg-transparent">
                                                <Bot className="h-4 w-4 text-primary animate-pulse" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1 max-w-[85%]">
                                            <div className="rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm bg-card/90 border shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        Thinking...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Fixed Input Area */}
                    <div className="shrink-0 border-t bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-xl p-4">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                <div className="flex-1 relative">
                                    <Input
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={user ? "Ask about your finances, investments, or get personalized advice..." : "Sign in to get personalized financial advice..."}
                                        className="w-full px-5 py-5 text-base rounded-2xl border-2 shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-background"
                                        disabled={isLoading || !user}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={isLoading || !input.trim() || !user}
                                            className={cn(
                                                "h-9 w-9 rounded-full shadow-lg transition-all duration-200",
                                                isLoading || !input.trim() || !user
                                                    ? "bg-muted text-muted-foreground"
                                                    : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 hover:scale-110"
                                            )}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                            
                            <div className="flex items-center justify-between mt-3 px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Capabilities:</span>
                                    <div className="flex items-center gap-1">
                                        {capabilities.map((cap, index) => (
                                            <Badge 
                                                key={index} 
                                                variant="secondary"
                                                className="text-xs border bg-muted/50 px-2 py-0.5"
                                            >
                                                <span className="mr-1">{cap.icon}</span>
                                                {cap.text}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearChat}
                                    className="text-xs text-muted-foreground hover:text-foreground h-7"
                                >
                                    Clear chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                {showInfoPanel && (
                    <div className={cn(
                        "fixed inset-y-0 right-0 w-80 border-l bg-gradient-to-b from-background to-background/95 backdrop-blur-xl z-50 animate-in slide-in-from-right duration-300 shadow-2xl",
                        "lg:relative lg:block lg:w-80 lg:shadow-none lg:shrink-0"
                    )}>
                        <div className="h-full flex flex-col">
                            <div className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Secure Financial Assistant
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                        <p className="text-sm text-muted-foreground">
                                            EcoVest AI provides intelligent financial guidance based on your data. Always verify important decisions with certified professionals.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Your Data</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Encryption</span>
                                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                                    Active
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Privacy Mode</span>
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                                    Enabled
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-6 border-t">
                                <h4 className="font-semibold mb-3">Recent Analysis</h4>
                                <div className="space-y-3">
                                    {["Spending Trends", "Portfolio Health", "Risk Assessment", "Savings Opportunities"].map((item, index) => (
                                        <div 
                                            key={index}
                                            className="p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer hover:border-primary/30 hover:bg-primary/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{item}</span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="p-6 border-t">
                                <p className="text-xs text-center text-muted-foreground">
                                    EcoVest AI • Version 2.0 • 
                                    <span className="text-green-500 ml-1">●</span> System Active
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}