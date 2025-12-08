"use client"

import * as React from "react"
import { useNews } from "@/hooks/use-news"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  ExternalLink, 
  TrendingUp, 
  Newspaper, 
  Search, 
  Filter, 
  Clock, 
  Globe, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Building2,
  Target,
  Sparkles,
  RefreshCw,
  Calendar,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronDown
} from "lucide-react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useMemo, useEffect } from "react"

// Modern Card Component
function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border border-border bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {children}
    </Card>
  )
}

// Category badges for articles
function getCategoryBadge(category: string) {
  const categories: Record<string, { label: string; color: string; icon: React.ComponentType }> = {
    'business': { label: 'Business', color: 'bg-blue-500/20 text-blue-500 border-blue-500/20', icon: Building2 },
    'technology': { label: 'Tech', color: 'bg-purple-500/20 text-purple-500 border-purple-500/20', icon: TrendingUp },
    'finance': { label: 'Finance', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20', icon: DollarSign },
    'markets': { label: 'Markets', color: 'bg-amber-500/20 text-amber-500 border-amber-500/20', icon: BarChart3 },
    'economy': { label: 'Economy', color: 'bg-rose-500/20 text-rose-500 border-rose-500/20', icon: TrendingDown },
    'investing': { label: 'Investing', color: 'bg-violet-500/20 text-violet-500 border-violet-500/20', icon: Target },
  }
  
  return categories[category.toLowerCase()] || { 
    label: 'General', 
    color: 'bg-gray-500/20 text-gray-500 border-gray-500/20', 
    icon: Newspaper 
  }
}

// Featured News Card
function FeaturedNewsCard({ article }: { article: any }) {
  const category = getCategoryBadge(article.category || 'general')
  const IconComponent = category.icon
  
  return (
    <ModernCard className="col-span-1 md:col-span-2">
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-2/5 p-6 bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col justify-between">
          <div>
            <Badge className={`${category.color} border-0 mb-4`}>
              <IconComponent className="h-3 w-3 mr-1" />
              {category.label}
            </Badge>
            <CardTitle className="text-2xl font-bold mb-3 line-clamp-3">
              {article.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {article.description}
            </CardDescription>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Globe className="h-4 w-4" />
              <span>{article.source?.name}</span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>{format(new Date(article.publishedAt), "MMM d, h:mm a")}</span>
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full"
              >
                Read Full Article
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        
        <div className="md:w-3/5 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Insights</h3>
            <ul className="space-y-2">
              {article.content?.split('. ').slice(0, 3).map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{point}.</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        </div>
      </div>
    </ModernCard>
  )
}

// News Article Card
function NewsArticleCard({ article, compact = false }: { article: any; compact?: boolean }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const category = getCategoryBadge(article.category || 'general')
  const IconComponent = category.icon
  const publishedTime = new Date(article.publishedAt)
  const now = new Date()
  const hoursDiff = Math.abs(now.getTime() - publishedTime.getTime()) / 36e5
  
  let timeLabel = format(publishedTime, "MMM d")
  if (hoursDiff < 1) timeLabel = "Just now"
  else if (hoursDiff < 24) timeLabel = `${Math.floor(hoursDiff)}h ago`
  else if (hoursDiff < 48) timeLabel = "Yesterday"

  return (
    <ModernCard className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Badge className={`${category.color} border-0`}>
            <IconComponent className="h-3 w-3 mr-1" />
            {category.label}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-bold leading-tight mt-3 line-clamp-3`}>
          {article.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {article.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{article.source?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeLabel}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full border-border hover:bg-secondary" 
          size="sm"
          asChild
        >
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read More
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </ModernCard>
  )
}

// Quick Stats Bar
function NewsStats({ articles }: { articles: any[] }) {
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const todayArticles = articles.filter(article => 
      new Date(article.publishedAt) >= today
    )
    
    const categories = articles.reduce((acc: Record<string, number>, article) => {
      const category = article.category || 'general'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0] || ['general', 0]
    
    return {
      total: articles.length,
      today: todayArticles.length,
      topCategory: topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1),
      sources: new Set(articles.map(a => a.source?.name)).size
    }
  }, [articles])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-4 rounded-2xl bg-primary/5 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Articles</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Category</p>
            <p className="text-xl font-bold truncate">{stats.topCategory}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-violet-500/5 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Globe className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sources</p>
            <p className="text-2xl font-bold">{stats.sources}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const { articles, loading, error, refresh } = useNews()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [itemsToShow, setItemsToShow] = useState(8)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Extract categories from articles
  const categories = useMemo(() => {
    const cats = new Set<string>()
    articles.forEach(article => {
      if (article.category) {
        cats.add(article.category.toLowerCase())
      }
    })
    return Array.from(cats).map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1)
    )
  }, [articles])

  // Filter out invalid articles and apply filters
  const validArticles = useMemo(() => {
    let filtered = articles.filter(article => 
      article && 
      typeof article.url === 'string' && 
      article.url.trim() !== ''
    )

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.content?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(article =>
        article.category?.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      let cutoffDate = new Date()
      
      switch(timeFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(article =>
        new Date(article.publishedAt) >= cutoffDate
      )
    }

    return filtered
  }, [articles, searchQuery, categoryFilter, timeFilter])

  // Get featured article (first valid article)
  const featuredArticle = validArticles.length > 0 ? validArticles[0] : null

  // Get articles to display (excluding featured)
  const articlesToDisplay = validArticles.slice(1, itemsToShow + 1)

  // Handle Load More
  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 8)
  }

  // Handle Refresh - FIXED VERSION
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force a complete re-fetch
      await refresh()
      // Reset items to show when refreshing
      setItemsToShow(8)
      // Also reset filters
      setSearchQuery("")
      setCategoryFilter("all")
      setTimeFilter("all")
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      // Small delay to show the refreshing state
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }

  // Reset items to show when filters change
  useEffect(() => {
    setItemsToShow(8)
  }, [searchQuery, categoryFilter, timeFilter])

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            Financial News
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with the latest market news and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground cursor-pointer">
              Auto-refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-border hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && !error && validArticles.length > 0 && (
        <NewsStats articles={validArticles} />
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border bg-secondary"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] border-border bg-secondary">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px] border-border bg-secondary">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border border-border rounded-lg bg-secondary">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {searchQuery && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {validArticles.length} articles for "{searchQuery}"
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>

      {loading || isRefreshing ? (
        <div className="space-y-6">
          {/* Featured skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] rounded-2xl bg-secondary" />
            <Skeleton className="h-[300px] rounded-2xl bg-secondary" />
          </div>
          
          {/* Grid skeletons */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl bg-secondary" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ModernCard>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-destructive/10 mb-4">
              <Newspaper className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Error Loading News</h3>
            <p className="text-muted-foreground text-center mb-6">
              Could not load news. Please check your internet connection and try again.
            </p>
            <Button onClick={handleRefresh} className="bg-gradient-to-r from-primary to-cyan-500">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </ModernCard>
      ) : validArticles.length > 0 ? (
        <div className="space-y-6">
          {/* Featured Article */}
          {featuredArticle && (
            <FeaturedNewsCard article={featuredArticle} />
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Latest News</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Showing {Math.min(articlesToDisplay.length, itemsToShow)} of {validArticles.length - 1} articles</span>
            </div>
          </div>

          {/* News Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articlesToDisplay.map((article, index) => (
                <NewsArticleCard key={`${article.url}-${index}`} article={article} />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {articlesToDisplay.map((article, index) => (
                  <NewsArticleCard key={`${article.url}-${index}`} article={article} compact />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Load More Button */}
          {articlesToDisplay.length < validArticles.length - 1 && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="border-border hover:bg-secondary"
                onClick={handleLoadMore}
              >
                Load More Articles
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ModernCard>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Newspaper className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Articles Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery 
                ? `No articles found for "${searchQuery}". Try different keywords or clear your filters.`
                : "Could not retrieve any news articles at this time. Please try again later."
              }
            </p>
            <div className="flex gap-3">
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="border-border hover:bg-secondary"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              <Button 
                onClick={handleRefresh}
                className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh News
              </Button>
            </div>
          </CardContent>
        </ModernCard>
      )}
    </div>
  )
}