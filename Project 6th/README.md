# News Aggregator Frontend

A modern news aggregator web application built with React, TypeScript, and Tailwind CSS. This application aggregates news from multiple sources, implements topic clustering, and provides article summaries.

## Features

- Responsive design with Tailwind CSS
- News article aggregation from multiple sources
- Topic clustering using Sentence-BERT
- Article summarization using BART
- Advanced search functionality with filters
- Modern and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd news-aggregator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
REACT_APP_NEWS_API_KEY=your_news_api_key
REACT_APP_BACKEND_URL=your_backend_url
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Development

- The application uses TypeScript for type safety
- Tailwind CSS for styling
- React Query for data fetching and caching
- React Router for navigation

## Deployment

The application is configured for deployment on Vercel. To deploy:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 