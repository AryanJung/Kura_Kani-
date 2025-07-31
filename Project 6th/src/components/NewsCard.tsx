import React from 'react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  cluster?: number;
  imageUrl?: string;
}

interface NewsCardProps {
  article: NewsArticle;
  highlightSummary?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, highlightSummary }) => {
  return (
    <div
      className="w-full h-80 relative bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow border border-blue-100"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{article.title}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">{article.source}</span>
          <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        {highlightSummary && article.summary && (
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded relative">
            <span className="absolute -top-3 left-2 bg-blue-400 text-white text-xs px-2 py-0.5 rounded shadow">Summary</span>
            <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{article.summary}</p>
          </div>
        )}
        {!highlightSummary && article.summary && (
          <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{article.summary}</p>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold"
        >
          Read More
        </a>
      </div>
    </div>
  );
};

// Add CSS for hover effect in a style tag
const styles = `
  .news-card-inner:hover {
    transform: rotateY(180deg);
  }
`;

// Inject styles into the document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default NewsCard;