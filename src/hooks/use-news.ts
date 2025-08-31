
import { useState, useEffect } from 'react';
import { getFinancialNews } from '@/services/news';
import type { NewsArticle } from '@/lib/types';

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchNews() {
        try {
            setLoading(true);
            const newsArticles = await getFinancialNews();
            setArticles(newsArticles);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }
    fetchNews();
  }, []);

  return { articles, loading, error };
}
