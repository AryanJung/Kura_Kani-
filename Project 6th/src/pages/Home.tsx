import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import { useAuth } from '../contexts/AuthContext';
import { getUserPreferences } from '../services/api';
import PreferencesModal from '../components/PreferencesModal';

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

const Home: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [showPreferences, setShowPreferences] = useState(false);
  const limit = 10;

  // Get user preferences or empty array
  const preferences = user ? getUserPreferences(user.username) : [];

  // If user is logged in and has no preferences, prompt for them
  useEffect(() => {
    if (user && preferences.length === 0) {
      setShowPreferences(true);
    }
  }, [user, preferences]);

  const { data, isLoading, error } = useQuery<NewsResponse>(
    ['news', preferences, page],
    async () => {
      const response = await axios.get('http://localhost:8000/api/news', {
        params: {
          categories: preferences.length > 0 ? preferences.join(',') : undefined,
          page,
          limit,
        },
      });
      const originalArticles = response.data.articles;
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
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || filteredArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-700 mb-4 text-xl">
          {error ? "Error loading news or summaries. Please try again later." : "No articles found for your preferences."}
        </div>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {filteredArticles.map((article) => (
          <NewsCard key={article.id} article={article} highlightSummary />
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          className={`bg-gray-200 text-gray-700 px-4 py-2 rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="leading-8">Page {data?.page || 1} of {data?.totalPages || 1}</span>
        <button
          className={`bg-gray-200 text-gray-700 px-4 py-2 rounded ${page === (data?.totalPages || 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
          disabled={page === (data?.totalPages || 1)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      {user && showPreferences && (
        <PreferencesModal onClose={() => setShowPreferences(false)} />
      )}
    </div>
  );
};

export default Home;