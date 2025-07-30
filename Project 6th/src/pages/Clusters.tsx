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

interface Cluster {
  id: string;
  name: string;
  articles: NewsArticle[];
}

interface ClusterResponse {
  clusters: Cluster[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Clusters: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery<ClusterResponse>(
    ['clusters', page],
    async () => {
      const response = await axios.get('http://localhost:8000/api/clusters', {
        params: { page, limit },
      });
      console.log(`Fetched ${response.data.clusters.length} clusters for page ${page}`);
      response.data.clusters.forEach((cluster: Cluster) => {
        console.log(`Cluster ${cluster.name}: ${cluster.articles.length} articles`);
      });
      return response.data;
    },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

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

  if (error || !data?.clusters?.length) {
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
          {error ? "Error loading clusters. Please try again later." : "No clusters found."}
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
        News Clusters
      </h2>
      {data.clusters.map((cluster) => (
        <div key={cluster.id} style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem',
          }}>
            {cluster.name}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {cluster.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ))}
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

export default Clusters;