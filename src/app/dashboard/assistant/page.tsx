
"use client"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Send, BrainCircuit, Bot, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { chatWithAssistant } from "@/ai/flows/chat-with-assistant"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
    role: "user" | "assistant";
    content: string;
}

const welcomeMessage: Message = {
    role: "assistant",
    content: "Hello! I'm your personal financial assistant. How can I help you today? You can ask me about your recent spending, budget status, or any general finance questions."
}

export default function AssistantPage() {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = React.useState<Message[]>([welcomeMessage]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

     React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const assistantResponse = await chatWithAssistant(input);
            const assistantMessage: Message = { role: "assistant", content: assistantResponse };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error chatting with assistant:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "There was an error communicating with the assistant. Please try again."
            })
            setMessages(prev => prev.slice(0, -1)); // Remove the user message on error
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 flex flex-col gap-8">
                 <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                    <p className="text-muted-foreground">Your personal AI-powered financial guide.</p>
                </div>
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Chat with EcoVest AI</CardTitle>
                            <CardDescription>Ask about your finances, spending, or general questions.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                             <div className="space-y-6">
                                {messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'assistant' && (
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                    )}
                                    <div className={`rounded-lg p-3 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    )}
                                </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg p-3 bg-muted flex items-center">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
                            <Input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your last transaction..." 
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
