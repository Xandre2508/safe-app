// src/hooks/useNews.js
// Hook para captar as últimas notícias da NewsAPI

import { useEffect, useState } from 'react';

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // A tua chave da NewsAPI
        const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;
        
        // Endpoint para as principais notícias dos EUA (Top Headlines)
        // Usamos pageSize=5 para não sobrecarregar o ecrã da dashboard
        const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        // A NewsAPI devolve o estado do pedido
        if (data.status === 'ok' && data.articles) {
          setNews(data.articles);
        } else {
          console.error("Erro da API:", data.message);
        }
      } catch (error) {
        console.error("Erro no fetch das notícias:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  return { news, loadingNews };
};