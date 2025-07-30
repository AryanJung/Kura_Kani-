
# KURA-KANI 🗞️

**KURA-KANI** is a modern news aggregation web application that fetches, categorizes, and summarizes news articles from the BBC RSS feed. It features a beautiful React + Tailwind CSS frontend and a robust FastAPI backend. The app supports article clustering, real-time search, and category filtering.

## 🔥 Features

- 📰 **News Feed**: Displays articles in a responsive 320px card grid with a flip effect.
- 🔍 **Search**: Real-time search by keywords (e.g., "crime", "movie") with AI-generated summaries.
- 🧠 **Category Filters**: Toggle categories (Entertainment, Sports, Crime, Politics) via a Sidebar.
  - ✅ *Entertainment* and *Crime* are enabled by default.
- 🧩 **Clusters**: Grouped articles by category at `/clusters` (4 clusters, 5–6 articles each).
- 📱 **Responsive UI**:
  - Navbar
  - Centered Sidebar checkboxes
  - Footer
  - 600px-wide Search bar

## 🛠️ Prerequisites

- Node.js: v16 or later (tested with v22.16.0)
- Python: 3.8 or later
- Git: For cloning the repository
- Docker: Optional, for containerized backend

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/kura-kani.git
cd kura-kani
```

### 2. Backend Setup

Navigate to backend directory (if separate, else stay in root):

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install fastapi uvicorn feedparser pydantic sentence-transformers transformers torch
```

For CPU-only systems, use:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Verify main.py: Ensure `main.py` is in the backend directory with endpoints (`/api/news`, `/api/search`, `/api/clusters`, `/summarize`).

### 3. Frontend Setup

Navigate to frontend directory (if separate, else stay in root):

```bash
cd frontend
```

Install Node.js dependencies:

```bash
npm install
```

Key packages:

- react, react-dom, react-router-dom
- axios, react-query
- tailwindcss

Configure Tailwind CSS: Ensure `tailwind.config.js` and `src/index.css` include:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Set up proxy: In `frontend/package.json`, add:

```json
"proxy": "http://localhost:8000"
```

## 🧪 Running the Application

### Start the backend:

```bash
uvicorn main:app --reload
```

Verify at [http://localhost:8000/docs](http://localhost:8000/docs) (FastAPI Swagger UI).

Test endpoints:

```bash
curl "http://localhost:8000/api/news?categories=crime,entertainment"
curl "http://localhost:8000/api/search?q=crime"
curl -X POST "http://localhost:8000/summarize" -H "Content-Type: application/json" -d '{"texts":["Sample text"]}'
```

### Start the frontend:

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

Verify: Navbar, centered search bar (600px), Sidebar (Entertainment/Crime checked), Footer, 5–6 320px cards with flip effect.

## 📁 Project Structure

```
kura-kani/
├── backend/
│   ├── main.py              # FastAPI backend with news and search endpoints
│   ├── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component with search bar
│   │   ├── pages/
│   │   │   ├── Home.tsx     # News feed with search and filters
│   │   │   ├── Clusters.tsx # Article clusters
│   │   │   ├── Search.tsx   # Search page
│   │   ├── components/
│   │   │   ├── Navbar.tsx   # Navigation bar
│   │   │   ├── Sidebar.tsx  # Category filters
│   │   │   ├── Footer.tsx   # Footer
│   │   │   ├── NewsCard.tsx # Article card with flip effect
│   │   ├── index.css        # Tailwind CSS
│   ├── package.json         # Node.js dependencies
├── README.md                # This file
```

## 📦 Dependencies

### Backend:

- fastapi
- uvicorn
- feedparser
- pydantic
- sentence-transformers
- transformers
- torch

### Frontend:

- react, react-dom, react-router-dom
- axios
- react-query
- tailwindcss

## ⚠️ Notes

- Ensure http://localhost:8000 is running before starting the frontend.
- The app fetches up to 100 articles from https://feeds.bbci.co.uk/news/rss.xml.
- Search results are capped at 6 articles per page for performance.
- For persistent issues with large cards, check `NewsCard.tsx` styles or contact the repository owner.
