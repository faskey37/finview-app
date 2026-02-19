"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Sparkles, 
  Lightbulb,
  Bug,
  Rocket,
  Heart,
  Send,
  CheckCircle,
  AlertCircle,
  Award,
  Zap,
  Smile,
  Frown,
  Meh,
  Camera,
  Paperclip,
  X,
  TrendingUp,
  Users,
  Shield,
  Mail
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Feedback types - keep this as it's UI structure
const feedbackTypes = [
  { id: "feature", label: "Feature Request", icon: Rocket, description: "Suggest a new feature or improvement" },
  { id: "bug", label: "Bug Report", icon: Bug, description: "Report something that isn't working" },
  { id: "feedback", label: "General Feedback", icon: MessageSquare, description: "Share your thoughts about the app" },
  { id: "praise", label: "Praise", icon: Heart, description: "Tell us what you love" },
];

// Rating options - keep this as it's UI structure
const ratings = [
  { value: 5, label: "Excellent", icon: Smile, color: "text-green-500" },
  { value: 4, label: "Good", icon: Smile, color: "text-green-400" },
  { value: 3, label: "Average", icon: Meh, color: "text-yellow-500" },
  { value: 2, label: "Poor", icon: Frown, color: "text-orange-500" },
  { value: 1, label: "Terrible", icon: Frown, color: "text-red-500" },
];

export default function FeedbackPage() {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("give-feedback");
  const [feedbackType, setFeedbackType] = useState("feature");
  const [rating, setRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Placeholder data - replace with your actual data from LinkedIn/backend
  const feedbackStats = {
    totalResponses: 0,
    implemented: 0,
    inProgress: 0,
  };

  const recentFeedbackList: any[] = []; // Empty array - add your data later

  const roadmapData: any[] = []; // Empty array - add your data later

  const trendingData = {
    mostVoted: [] as any[],
    recentActivity: [] as any[],
    statusBreakdown: {
      underReview: 0,
      inProgress: 0,
      completed: 0,
    },
  };

  // Function to send feedback via API
  const sendFeedbackEmail = async (formData: any) => {
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send feedback');
      }

      return data;
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare feedback data
      const feedbackData = {
        type: feedbackType,
        rating: rating,
        title: title,
        description: description,
        userEmail: includeEmail ? email : null,
        userName: user?.displayName || 'Anonymous User',
        userId: user?.uid || null,
        isPro: isPro,
        timestamp: new Date().toISOString(),
        attachments: attachments.map(f => f.name),
      };

      // Send to our email endpoint
      await sendFeedbackEmail(feedbackData);

      // Show success message
      toast({
        title: "Feedback sent!",
        description: "Thank you for helping us improve EcoVest. Our team will review your feedback.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setRating(null);
      setAttachments([]);
      
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files!)].slice(0, 3));
    }
  };

  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4">
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Feedback
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight mb-3">
              Help shape the future of EcoVest
            </h1>
            <p className="text-muted-foreground">
              Your feedback helps us build a better financial tool for everyone.
              Share your ideas, report bugs, or tell us what you love.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="give-feedback">Give Feedback</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Give Feedback Tab */}
          <TabsContent value="give-feedback" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feedback Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Share your feedback</CardTitle>
                    <CardDescription>
                      Your input directly influences our product decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Feedback Type */}
                      <div className="space-y-3">
                        <Label>What type of feedback do you have?</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {feedbackTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setFeedbackType(type.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                                  feedbackType === type.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-accent/30"
                                }`}
                              >
                                <div className={`p-2 rounded-full ${
                                  feedbackType === type.id
                                    ? "bg-primary text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{type.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {type.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rating (for general feedback) */}
                      {feedbackType === "feedback" && (
                        <div className="space-y-3">
                          <Label>How would you rate your experience?</Label>
                          <div className="flex items-center gap-2">
                            {ratings.map((r) => {
                              const Icon = r.icon;
                              return (
                                <button
                                  key={r.value}
                                  type="button"
                                  onClick={() => setRating(r.value)}
                                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                                    rating === r.value
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:bg-accent/30"
                                  }`}
                                >
                                  <Icon className={`h-5 w-5 ${
                                    rating === r.value ? r.color : "text-muted-foreground"
                                  }`} />
                                  <span className={`text-xs ${
                                    rating === r.value ? r.color : "text-muted-foreground"
                                  }`}>
                                    {r.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          {feedbackType === "bug" ? "Issue title" : "Feedback title"}
                        </Label>
                        <Input
                          id="title"
                          placeholder={
                            feedbackType === "bug"
                              ? "e.g., Transactions not syncing"
                              : feedbackType === "feature"
                              ? "e.g., Add dark mode support"
                              : "e.g., Love the new design!"
                          }
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          {feedbackType === "bug"
                            ? "Steps to reproduce"
                            : "Detailed description"}
                        </Label>
                        <Textarea
                          id="description"
                          placeholder={
                            feedbackType === "bug"
                              ? "1. Go to transactions page\n2. Click sync\n3. Nothing happens"
                              : "Please provide as much detail as possible..."
                          }
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>

                      {/* Attachments */}
                      <div className="space-y-2">
                        <Label>Attachments (optional, max 3)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="relative"
                            onClick={() => document.getElementById("file-upload")?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Add files
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*,.pdf,.txt"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {attachments.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {attachments.length}/3 files
                            </span>
                          )}
                        </div>
                        {attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {attachments.map((file, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                <span className="text-xs truncate max-w-[150px]">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="ml-2 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-email"
                            checked={includeEmail}
                            onCheckedChange={(checked) => setIncludeEmail(checked as boolean)}
                          />
                          <Label htmlFor="include-email" className="text-sm font-normal">
                            Keep me updated on this feedback
                          </Label>
                        </div>
                        {includeEmail && (
                          <Input
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        )}
                      </div>

                      {/* Email notification badge */}
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Mail className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">
                          Your feedback will be sent to {' '}
                          <span className="font-medium text-primary">ecovest.help@gmail.com</span>
                          {' '}from <span className="font-medium">no-reply@ecovest.app</span>
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit feedback
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Feedback stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm">Total responses</span>
                      </div>
                      <span className="font-semibold">{feedbackStats.totalResponses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-green-500/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm">Implemented</span>
                      </div>
                      <span className="font-semibold">{feedbackStats.implemented}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-500/10">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="text-sm">In progress</span>
                      </div>
                      <span className="font-semibold">{feedbackStats.inProgress}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Email Card */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">Feedback Email</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          All feedback is sent directly to:
                        </p>
                        <a 
                          href="mailto:ecovest.help@gmail.com"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          ecovest.help@gmail.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pro Tip */}
                {isPro && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Pro Member</p>
                          <p className="text-xs text-muted-foreground">
                            Your feedback gets priority review and a personal response from our team.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity - Empty State */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentFeedbackList.length === 0 ? (
                      <div className="text-center py-6">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No feedback yet</p>
                        <p className="text-xs text-muted-foreground/70">Be the first to share your thoughts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentFeedbackList.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.user} • {item.date}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.votes} votes
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product roadmap</CardTitle>
                <CardDescription>
                  See what we're building and what's coming next
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roadmapData.length === 0 ? (
                  <div className="text-center py-12">
                    <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Roadmap coming soon</h3>
                    <p className="text-sm text-muted-foreground">
                      We're planning exciting new features. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {roadmapData.map((quarter) => (
                      <div key={quarter.quarter}>
                        <h3 className="font-semibold text-sm mb-4">{quarter.quarter}</h3>
                        <div className="space-y-3">
                          {quarter.items.map((item: any) => (
                            <div
                              key={item.title}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.status === "in-progress"
                                    ? "bg-blue-500"
                                    : item.status === "planned"
                                    ? "bg-yellow-500"
                                    : "bg-purple-500"
                                }`} />
                                <span className="text-sm">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {item.votes} votes
                                </Badge>
                                <Badge
                                  className={
                                    item.status === "in-progress"
                                      ? "bg-blue-500/10 text-blue-600"
                                      : item.status === "planned"
                                      ? "bg-yellow-500/10 text-yellow-600"
                                      : "bg-purple-500/10 text-purple-600"
                                  }
                                >
                                  {item.status === "in-progress"
                                    ? "In progress"
                                    : item.status === "planned"
                                    ? "Planned"
                                    : "Under review"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Most Voted */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    Most voted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingData.mostVoted.length === 0 ? (
                    <div className="text-center py-6">
                      <ThumbsUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No votes yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trendingData.mostVoted.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.votes} votes
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              #{item.votes}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Recent activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingData.recentActivity.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trendingData.recentActivity.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {item.user?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.user} • {item.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Status breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Under review</span>
                      <span className="text-sm font-medium">{trendingData.statusBreakdown.underReview}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${trendingData.statusBreakdown.underReview}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">In progress</span>
                      <span className="text-sm font-medium">{trendingData.statusBreakdown.inProgress}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${trendingData.statusBreakdown.inProgress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{trendingData.statusBreakdown.completed}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${trendingData.statusBreakdown.completed}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="container max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Your feedback helps us build a better product.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:ecovest.help@gmail.com"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                ecovest.help@gmail.com
              </a>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}