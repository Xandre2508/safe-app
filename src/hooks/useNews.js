import { useEffect, useState } from 'react';

export function useNews() {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=pt&apiKey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}`);
        const data = await response.json();
        if (data.articles) setNews(data.articles.slice(0, 3));
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return { news, loadingNews };
}