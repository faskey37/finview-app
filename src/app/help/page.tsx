"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  Mail, 
  MessageCircle, 
  FileText, 
  Twitter, 
  Users,
  ChevronRight,
  ExternalLink,
  Zap,
  Shield,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Headphones,
  LifeBuoy,
  BookOpen,
  PlayCircle,
  Bot,
  Award
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

// Quick help categories
const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen, count: 8 },
  { id: "account", label: "Account", icon: Users, count: 12 },
  { id: "billing", label: "Billing", icon: Award, count: 6 },
  { id: "features", label: "Features", icon: Sparkles, count: 15 },
  { id: "security", label: "Security", icon: Shield, count: 5 },
];

// Popular articles
const popularArticles = [
  { title: "How to connect your bank account", views: "2.3k", href: "#" },
  { title: "Setting up your first budget", views: "1.8k", href: "#" },
  { title: "Understanding investment reports", views: "1.2k", href: "#" },
  { title: "Exporting transaction data", views: "956", href: "#" },
  { title: "Enabling two-factor authentication", views: "843", href: "#" },
];

// Contact options with Gmail links
const contactOptions = [
  {
    method: "Email Support",
    description: "Get a response within 24 hours",
    icon: Mail,
    action: "ecovest.help@gmail.com",
    href: "mailto:ecovest.help@gmail.com?subject=Help%20Request&body=Hello,%0A%0AI%20need%20help%20with...%0A%0AMy%20account%20email:%20%0A%0AThank%20you.",
    responseTime: "24h",
  },
  {
    method: "Gmail",
    description: "Open in Gmail",
    icon: Mail,
    action: "Open Gmail",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=ecovest.help@gmail.com&su=Help%20Request&body=Hello%2C%0A%0AI%20need%20help%20with...%0A%0AMy%20account%20email%3A%20%0A%0AThank%20you.",
    responseTime: "24h",
    external: true,
  },
  {
    method: "Live Chat",
    description: "Chat with our team",
    icon: MessageCircle,
    action: "Start chat",
    href: "#chat",
    responseTime: "5m",
  },
  {
    method: "Community",
    description: "Join the discussion",
    icon: Users,
    action: "Ask community",
    href: "/community",
    responseTime: "2h",
  },
  {
    method: "X (Twitter)",
    description: "Follow for updates",
    icon: Twitter,
    action: "@EcoVestHelp",
    href: "https://twitter.com/ecovesthelp",
    responseTime: "4h",
    external: true,
  },
];

// FAQ items
const faqItems = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a reset link.",
    category: "account",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for annual plans.",
    category: "billing",
  },
  {
    question: "How does the AI Assistant work?",
    answer: "Our AI analyzes your spending patterns to provide personalized insights and savings recommendations.",
    category: "features",
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, we use 256-bit encryption and never store your bank credentials. We're SOC 2 Type II certified.",
    category: "security",
  },
];

// Email templates for quick actions
const emailTemplates = [
  {
    subject: "Data Deletion Request",
    body: "Hello,%0A%0AI would like to request deletion of my personal data.%0A%0AMy account email: [your-email]%0A%0AThank you."
  },
  {
    subject: "Account Issue",
    body: "Hello,%0A%0AI'm experiencing an issue with my account.%0A%0AIssue description: %0A%0AMy email: [your-email]%0A%0AThank you."
  },
  {
    subject: "Billing Question",
    body: "Hello,%0A%0AI have a question about my billing.%0A%0ADetails: %0A%0AMy account email: [your-email]%0A%0AThank you."
  },
  {
    subject: "Feature Request",
    body: "Hello,%0A%0AI'd like to suggest a new feature.%0A%0AFeature idea: %0A%0AWhy it would be helpful: %0A%0AThank you for considering!"
  }
];

export default function HelpPage() {
  const { isPro } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  const openGmailWithTemplate = (subject: string, body: string) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=ecovest.help@gmail.com&su=${encodedSubject}&body=${encodedBody}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1.5">
              <LifeBuoy className="h-3.5 w-3.5 mr-2" />
              Help Center
            </Badge>
            
            <h1 className="text-4xl font-semibold tracking-tight">
              How can we help?
            </h1>
            
            <p className="text-muted-foreground">
              Search our knowledge base or browse by category
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories & Popular Articles */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Browse by category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === "all" 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  }`}
                >
                  <span>All topics</span>
                  <Badge variant="secondary" className="text-xs">
                    {faqItems.length}
                  </Badge>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {cat.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Popular articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularArticles.map((article) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className="block group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {article.views} views
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - FAQ */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frequently asked questions</CardTitle>
                <CardDescription>
                  {searchQuery 
                    ? `Search results for "${searchQuery}"`
                    : "Common questions and answers"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems
                  .filter(item => 
                    (selectedCategory === "all" || item.category === selectedCategory) &&
                    (searchQuery === "" || 
                      item.question.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{item.question}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.answer}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          Was this helpful?
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${
                              helpfulFeedback[item.question] === true 
                                ? "text-green-600" 
                                : ""
                            }`}
                            onClick={() => setHelpfulFeedback({ 
                              ...helpfulFeedback, 
                              [item.question]: true 
                            })}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Yes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${
                              helpfulFeedback[item.question] === false 
                                ? "text-red-600" 
                                : ""
                            }`}
                            onClick={() => setHelpfulFeedback({ 
                              ...helpfulFeedback, 
                              [item.question]: false 
                            })}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            No
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {faqItems.filter(item => 
                  selectedCategory === "all" || item.category === selectedCategory
                ).length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No questions found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Video tutorials</CardTitle>
                <CardDescription>Learn with step-by-step guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {["Getting Started", "Budgeting", "Investments", "Reports"].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      className="h-auto py-4 justify-start gap-3"
                      asChild
                    >
                      <Link href="#">
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{topic}</p>
                          <p className="text-xs text-muted-foreground">3 videos</p>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Templates Section */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Quick email templates</h2>
            <p className="text-muted-foreground">Choose a template to get started</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {emailTemplates.map((template, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                onClick={() => openGmailWithTemplate(template.subject, template.body)}
              >
                <CardContent className="p-4 text-center">
                  <div className="p-2 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{template.subject}</h3>
                  <p className="text-xs text-muted-foreground">
                    Click to open in Gmail
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-muted-foreground">Choose the best way to reach us</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link 
                  key={option.method} 
                  href={option.href}
                  target={option.external ? "_blank" : undefined}
                  rel={option.external ? "noopener noreferrer" : undefined}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 text-center">
                      <div className="p-2 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{option.method}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-primary">
                        <span>{option.action}</span>
                        {option.external && <ExternalLink className="h-3 w-3" />}
                      </div>
                      <Badge variant="outline" className="mt-2 text-[10px] px-1">
                        {option.responseTime} response
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pro Support Banner */}
        {isPro && (
          <div className="mt-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary">
                    <Headphones className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Priority Pro Support</p>
                    <p className="text-xs text-muted-foreground">
                      Get help in under 2 hours
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=ecovest.help@gmail.com&su=Priority%20Support%20Request%20(Pro%20Member)&body=Hello%2C%0A%0AI%20am%20a%20Pro%20member%20and%20need%20priority%20assistance.%0A%0AIssue%3A%20%0A%0AMy%20account%20email%3A%20%0A%0AThank%20you.', '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Priority Support
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="container max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              © 2024 EcoVest. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/security" className="text-xs text-muted-foreground hover:text-primary">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}