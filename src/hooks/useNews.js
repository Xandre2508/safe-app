import { useEffect, useState } from 'react';

const FALLBACK_NEWS = [
  {
    title: 'Autoridade Nacional de Emergência e Proteção Civil em Alerta Laranja',
    description: 'Reforço preventivo de meios operacionais e vigilância ativa nas zonas com maior risco.',
    source: { name: 'ANEPC Notícias' },
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Linha SNS 24 em Prontidão Reforçada para Apoio a Vítimas',
    description: 'Em caso de emergência ou necessidade de triagem médica não urgente, ligue 808 24 24 24.',
    source: { name: 'Serviço Nacional de Saúde' },
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Aviso Meteorológico: Rajadas Fortes e Descida da Humidade',
    description: 'Condições meteorológicas exigem cautela reforçada junto de áreas florestais e vias públicas.',
    source: { name: 'IPMA - Instituto Português do Mar e da Atmosfera' },
    publishedAt: new Date().toISOString(),
  },
];

export const useNews = () => {
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;

      if (!apiKey) {
        if (isMounted) setLoadingNews(false);
        return;
      }

      try {
        const url = `https://newsapi.org/v2/top-headlines?country=pt&pageSize=5&apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (isMounted && data.status === 'ok' && data.articles && data.articles.length > 0) {
          setNews(data.articles);
        }
      } catch (error) {
        console.warn('[useNews] Erro ao carregar feed da NewsAPI, mantendo alertas locais:', error);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return { news, loadingNews };
};
