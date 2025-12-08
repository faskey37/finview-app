// /hooks/use-news.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'

export function useNews() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  const fetchNews = useCallback(async (forceRefresh = false) => {
    // Don't fetch too frequently (min 30 seconds between fetches unless forceRefresh)
    if (!forceRefresh && lastFetchTime) {
      const timeSinceLastFetch = Date.now() - lastFetchTime.getTime()
      if (timeSinceLastFetch < 30000) { // 30 seconds
        return
      }
    }

    setLoading(true)
    setError(null)
    
    try {
      // Use the API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY
      
      if (!apiKey) {
        throw new Error('News API key is not configured')
      }

      // Try to fetch from NewsAPI
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=50&apiKey=${apiKey}`,
        {
          headers: {
            'User-Agent': 'FinancialNewsApp/1.0'
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API Error: ${response.status} ${errorData.message || response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        // Process and categorize articles
        const processedArticles = data.articles
          .filter((article: any) => 
            article.title && 
            article.title !== '[Removed]' && 
            article.url &&
            article.description
          )
          .map((article: any, index: number) => {
            // Assign categories based on keywords in title/description
            const content = `${article.title} ${article.description}`.toLowerCase()
            let category = 'general'
            
            if (content.includes('stock') || content.includes('market') || content.includes('invest')) {
              category = 'markets'
            } else if (content.includes('fed') || content.includes('interest') || content.includes('rate') || content.includes('economy')) {
              category = 'economy'
            } else if (content.includes('tech') || content.includes('ai') || content.includes('software') || content.includes('digital')) {
              category = 'technology'
            } else if (content.includes('bank') || content.includes('financial') || content.includes('earnings') || content.includes('profit')) {
              category = 'finance'
            } else if (content.includes('business') || content.includes('corporate') || content.includes('company')) {
              category = 'business'
            }
            
            return {
              ...article,
              category,
              publishedAt: article.publishedAt || new Date().toISOString(),
              source: article.source || { name: 'Unknown Source' }
            }
          })
        
        setArticles(processedArticles)
        setLastFetchTime(new Date())
      } else {
        throw new Error('No articles found in the response')
      }
    } catch (err: any) {
      console.error('Error fetching news:', err)
      setError(err.message || 'Failed to fetch news articles')
      
      // Keep existing articles if we have them, don't clear on error
      if (articles.length === 0) {
        setArticles([])
      }
    } finally {
      setLoading(false)
    }
  }, [lastFetchTime, articles.length])

  const refresh = useCallback(async () => {
    // Force refresh by bypassing the 30-second cooldown
    await fetchNews(true)
  }, [fetchNews])

  useEffect(() => {
    // Initial fetch
    fetchNews()
  }, [fetchNews])

  return {
    articles,
    loading,
    error,
    refresh,
    lastFetchTime
  }
}