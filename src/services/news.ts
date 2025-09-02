
'use server';

import type { NewsArticle } from '@/lib/types';
import fetch from 'node-fetch';

/**
 * Fetches top business news headlines from newsapi.org.
 *
 * @returns {Promise<NewsArticle[]>} A promise that resolves to an array of news articles.
 */
export async function getFinancialNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    console.error("News API key is missing. Please set NEXT_PUBLIC_NEWS_API_KEY in your .env file.");
    return [];
  }

  const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch news from newsapi.org. Status: ${response.status}`, errorData);
      return [];
    }

    const data: any = await response.json();

    if (data.articles && Array.isArray(data.articles)) {
      return data.articles
        .filter((article: any) => article.url && article.title) // Ensure essential data is present
        .map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: {
            name: article.source.name,
          },
          publishedAt: article.publishedAt,
        }));
    }
    
    return [];
  } catch (error) {
    console.error('An unexpected error occurred while fetching financial news:', error);
    return [];
  }
}
