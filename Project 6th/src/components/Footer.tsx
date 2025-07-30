import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/outline';

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <footer className="bg-accent-600 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Kura-Kani News Summarizer. All rights reserved.</p>
      </div>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 bg-accent-700 text-white p-3 rounded-full shadow-lg hover:bg-accent-800 focus:outline-none"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer; 