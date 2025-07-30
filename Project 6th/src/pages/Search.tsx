import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { SearchIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

// Mock data for development
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Search Result 1',
    description: 'This is a sample search result for development purposes.',
    url: 'https://example.com/news/1',
    source: 'CNN',
    publishedAt: new Date().toISOString(),
    summary: 'A brief summary of the search result.',
  },
  {
    id: '2',
    title: 'Search Result 2',
    description: 'Another sample search result for development.',
    url: 'https://example.com/news/2',
    source: 'BBC',
    publishedAt: new Date().toISOString(),
    summary: 'A brief summary of another search result.',
  },
];

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const { data: articles, isLoading, error } = useQuery<NewsArticle[]>(
    ['search', searchQuery, selectedSource, dateRange],
    async () => {
      try {
        // TODO: Replace with actual API endpoint
        const response = await axios.get('/api/search', {
          params: {
            q: searchQuery,
            source: selectedSource !== 'all' ? selectedSource : undefined,
            dateRange,
          },
        });
        return response.data;
      } catch (error) {
        // For development, return mock data if API fails
        console.warn('Using mock data due to API error:', error);
        return mockArticles;
      }
    },
    {
      enabled: searchQuery.length > 0,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const sources = [
    'all',
    'CNN',
    'BBC',
    'Reuters',
    'The Guardian',
    'New York Times',
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const renderContent = () => {
    if (!searchQuery) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Search News</h2>
          <p className="text-gray-600">
            Enter a search term to find news articles.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            Error loading search results. Please try again later.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!articles || articles.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600">
            Try adjusting your search criteria or try a different search term.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600"
                >
                  {article.title}
                </a>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {article.source} • {format(new Date(article.publishedAt), 'MMM d, yyyy')}
              </p>
              <p className="text-gray-700 mb-4">{article.description}</p>
              {article.summary && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 italic">{article.summary}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Search; 