import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import NewsCard from '../components/NewsCard';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  category?: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface HomeProps {
  filters: {
    entertainment: boolean;
    sports: boolean;
    crime: boolean;
    politics: boolean;
  };
  searchQuery?: string;
}

const Home: React.FC<HomeProps> = ({ filters, searchQuery }) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery<NewsResponse>(
    ['news', filters, page, searchQuery],
    async () => {
      const activeFilters = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      const response = await axios.get('http://localhost:8000/api/news', {
        params: {
          categories: activeFilters.length > 0 ? activeFilters.join(',') : undefined,
          page,
          limit,
        },
      });
      const originalArticles = response.data.articles;

      // Log fetched articles
      console.log(`Fetched ${originalArticles.length} articles for page ${page}, filters: ${activeFilters.join(',') || 'none'}`);

      // Handle empty response
      if (!originalArticles || originalArticles.length === 0) {
        return {
          articles: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      // Prepare texts for summarization
      const articleTexts = originalArticles.map((article: NewsArticle) => 
        article.description !== "No description available" ? article.description : article.title
      );
      const res = await axios.post('http://localhost:8000/summarize', {
        texts: articleTexts,
      });

      const summaryResults = res.data.results || [];
      const articlesWithSummaries = originalArticles.map((article: NewsArticle, idx: number) => ({
        ...article,
        summary: summaryResults[idx]?.summary || "Unable to generate summary",
      }));

      console.log(`Rendered ${articlesWithSummaries.length} articles with summaries`);
      return {
        ...response.data,
        articles: articlesWithSummaries,
      };
    },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  const filteredArticles = data?.articles || [];

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '16rem',
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid #e0f2fe',
          borderTop: '4px solid #1d4ed8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || filteredArticles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        paddingTop: '3rem',
        paddingBottom: '3rem',
      }}>
        <div style={{
          color: '#374151',
          marginBottom: '1rem',
          fontSize: '1.25rem',
        }}>
          {error ? "Error loading news or summaries. Please try again later." : "No articles found for the selected filters."}
        </div>
        <button onClick={() => window.location.reload()} style={{
          backgroundColor: '#1d4ed8',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '2rem',
      }}>
        Latest News
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {filteredArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '2rem',
      }}>
        <button
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
          }}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span style={{ lineHeight: '2rem' }}>
          Page {data?.page || 1} of {data?.totalPages || 1}
        </span>
        <button
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: page === (data?.totalPages || 1) ? 'not-allowed' : 'pointer',
            opacity: page === (data?.totalPages || 1) ? 0.5 : 1,
          }}
          disabled={page === (data?.totalPages || 1)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;