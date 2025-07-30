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
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '320px', // Increased for longer summaries
        position: 'relative',
        perspective: '1000px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transition: 'transform 0.6s ease-in-out',
          transformStyle: 'preserve-3d',
        }}
        className="news-card-inner"
      >
        {/* Front of the card: Shows headline */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.15)')}
          onMouseOut={(e) => (e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)')}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            {article.title}
          </h3>
        </div>
        {/* Back of the card: Shows summary and Read More link */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            transform: 'rotateY(180deg)',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem', // Slightly smaller for longer text
              color: '#374151',
              textAlign: 'center',
              marginBottom: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 6, // Increased to 6 lines
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.5',
            }}
          >
            {article.summary || 'Unable to generate summary'}
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1d4ed8',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              padding: '10px 20px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            Read More
          </a>
        </div>
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