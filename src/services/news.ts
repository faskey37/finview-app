
'use server';

import type { NewsArticle } from '@/lib/types';
import fetch from 'node-fetch';

export async function getFinancialNews(): Promise<NewsArticle[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error("NEWS_API_KEY is not set.");
        return [];
    }
    
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to fetch news:', response.statusText);
            return [];
        }
        const data: any = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching financial news:', error);
        return [];
    }
}
