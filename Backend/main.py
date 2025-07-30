from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import feedparser
from typing import List, Optional
from pydantic import BaseModel
import uuid
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import logging

app = FastAPI()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsArticle(BaseModel):
    id: str
    title: str
    description: str
    url: str
    source: str
    publishedAt: str
    category: Optional[str] = None
    summary: Optional[str] = None

class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    page: int
    limit: int
    totalPages: int

class Cluster(BaseModel):
    id: str
    name: str
    articles: List[NewsArticle]

class ClusterResponse(BaseModel):
    clusters: List[Cluster]
    total: int
    page: int
    limit: int
    totalPages: int

class SummarizeRequest(BaseModel):
    texts: List[str]

class SummarizeResponse(BaseModel):
    results: List[dict]

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

def categorize_article(text: str) -> Optional[str]:
    text = text.lower()
    categories = {
        "entertainment": [
            "movie", "film", "music", "concert", "festival", "actor", "actress", "tv", 
            "television", "show", "celebrity", "premiere", "award", "drama", "comedy", 
            "entertainment", "cinema", "theatre", "album", "streaming", "hollywood", 
            "musical", "band", "performance", "red carpet", "oscars", "grammy", 
            "netflix", "series", "director", "screenplay"
        ],
        "sports": [
            "sport", "football", "cricket", "tennis", "athlete", "game", "match", 
            "tournament", "olympics", "soccer", "basketball", "rugby", "championship", 
            "team", "player", "coach", "league", "score", "stadium", "training"
        ],
        "crime": [
            "murder", "theft", "assault", "robbery", "fraud", "arrest", "police", "crime", 
            "homicide", "burglary", "court", "trial", "investigation", "suspect", "criminal", 
            "law enforcement", "offence", "felony", "misdemeanor", "scandal", "corruption", 
            "gang", "violence", "prosecution", "detective", "evidence", "jail"
        ],
        "politics": [
            "election", "government", "policy", "minister", "parliament", "vote", 
            "politician", "law", "brexit", "president", "prime minister", "congress", 
            "senate", "legislation", "campaign", "debate", "diplomacy", "bill", 
            "reform", "cabinet"
        ],
    }
    for category, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            logger.info(f"Article categorized as {category}: {text[:100]}...")
            return category
    logger.info(f"Article not categorized: {text[:100]}...")
    return None

@app.get("/api/news", response_model=NewsResponse)
async def get_news(categories: Optional[str] = None, page: int = 1, limit: int = 10):
    feed = feedparser.parse("https://feeds.bbci.co.uk/news/rss.xml")
    entries = feed.entries[:100]  # Fetch up to 100 articles
    articles = []
    
    for entry in entries:
        description = entry.get("description", "No description available")
        category = categorize_article(entry.title + " " + description)
        articles.append(NewsArticle(
            id=str(uuid.uuid4()),
            title=entry.title,
            description=description,
            url=entry.link,
            source="BBC",
            publishedAt=entry.get("published", ""),
            category=category
        ))

    # Filter articles by category if provided
    if categories:
        category_list = categories.lower().split(",")
        filtered_articles = [
            article for article in articles if article.category in category_list
        ]
        logger.info(f"Filtered {len(filtered_articles)} articles for categories: {category_list}")
    else:
        filtered_articles = articles
        logger.info(f"No category filter applied, returning {len(filtered_articles)} articles")

    total = len(filtered_articles)
    total_pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated_articles = filtered_articles[start:end]

    logger.info(f"Returning page {page} with {len(paginated_articles)} articles")
    return NewsResponse(
        articles=paginated_articles,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@app.get("/api/clusters", response_model=ClusterResponse)
async def get_clusters(page: int = 1, limit: int = 10):
    feed = feedparser.parse("https://feeds.bbci.co.uk/news/rss.xml")
    entries = feed.entries[:100]
    articles = [
        NewsArticle(
            id=str(uuid.uuid4()),
            title=entry.title,
            description=entry.get("description", "No description available"),
            url=entry.link,
            source="BBC",
            publishedAt=entry.get("published", ""),
            category=categorize_article(entry.title + " " + entry.get("description", "No description available"))
        ) for entry in entries
    ]

    # Summarize articles
    texts = [article.description if article.description != "No description available" else article.title for article in articles]
    summaries = []
    for text in texts:
        try:
            summary = summarizer(text, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
            summaries.append(summary)
        except Exception as e:
            logger.error(f"Error summarizing text: {str(e)}")
            summaries.append("Summary not available")

    # Assign summaries to articles
    for article, summary in zip(articles, summaries):
        article.summary = summary

    # Group articles by category as clusters
    cluster_dict = {
        "entertainment": [],
        "sports": [],
        "crime": [],
        "politics": []
    }
    for article in articles:
        if article.category in cluster_dict:
            cluster_dict[article.category].append(article)

    # Log article counts per cluster
    for category, arts in cluster_dict.items():
        logger.info(f"Cluster {category}: {len(arts)} articles")

    # Create clusters, only include non-empty ones
    cluster_list = [
        Cluster(id=category, name=category.capitalize(), articles=articles)
        for category, articles in cluster_dict.items()
        if articles
    ]

    logger.info(f"Created {len(cluster_list)} clusters: {[c.name for c in cluster_list]}")

    total = len(cluster_list)
    total_pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated_clusters = cluster_list[start:end]

    return ClusterResponse(
        clusters=paginated_clusters,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@app.get("/api/search", response_model=NewsResponse)
async def search_news(q: str, page: int = 1, limit: int = 10):
    feed = feedparser.parse("https://feeds.bbci.co.uk/news/rss.xml")
    entries = feed.entries[:100]
    articles = [
        NewsArticle(
            id=str(uuid.uuid4()),
            title=entry.title,
            description=entry.get("description", "No description available"),
            url=entry.link,
            source="BBC",
            publishedAt=entry.get("published", ""),
            category=categorize_article(entry.title + " " + entry.get("description", "No description available"))
        ) for entry in entries
    ]

    filtered_articles = [
        article for article in articles
        if q.lower() in article.title.lower() or q.lower() in article.description.lower()
    ]

    logger.info(f"Search for '{q}' returned {len(filtered_articles)} articles")
    return NewsResponse(
        articles=filtered_articles,
        total=len(filtered_articles),
        page=page,
        limit=limit,
        totalPages=(len(filtered_articles) + limit - 1) // limit
    )

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    try:
        results = []
        for text in request.texts:
            summary = summarizer(text, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
            results.append({"summary": summary})
        return SummarizeResponse(results=results)
    except Exception as e:
        logger.error(f"Error in summarize endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))