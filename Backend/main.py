from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import feedparser
from typing import List, Optional
from pydantic import BaseModel
import uuid
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import logging
from sqlalchemy.orm import Session
from datetime import timedelta

# Import our custom modules
from database import get_db, User
from auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    get_current_admin_user,
    get_password_hash,
    get_user_by_email,
    get_user_by_username,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from models import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordChange

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

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    admin_users: int
    total_articles: int

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    totalPages: int

# Initialize ML models
try:
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("ML models loaded successfully")
except Exception as e:
    logger.warning(f"Failed to load ML models: {e}")
    logger.warning("News summarization features will be disabled")
    summarizer = None
    embedder = None

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@app.put("/api/auth/update", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user information."""
    if user_update.email and user_update.email != current_user.email:
        if get_user_by_email(db, user_update.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/api/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    if password_data.new_password != password_data.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

# Admin endpoints
@app.get("/admin")
async def admin_panel(current_user: User = Depends(get_current_admin_user)):
    """Admin panel main endpoint."""
    return {"message": "Welcome to the admin panel!", "user": current_user.username}

@app.get("/api/admin/stats", response_model=AdminStats)
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin statistics."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    
    # Get total articles from RSS feed
    try:
        feed = feedparser.parse("https://feeds.bbci.co.uk/news/rss.xml")
        total_articles = len(feed.entries[:100])  # Limit to 100 articles
    except:
        total_articles = 0
    
    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        admin_users=admin_users,
        total_articles=total_articles
    )

@app.get("/api/admin/users", response_model=UserListResponse)
async def get_users(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    total = db.query(User).count()
    total_pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    
    users = db.query(User).offset(start).limit(limit).all()
    
    return UserListResponse(
        users=users,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )

@app.put("/api/admin/users/{user_id}/toggle-admin")
async def toggle_admin_status(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle admin status for a user."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    
    return {"message": f"Admin status {'enabled' if user.is_admin else 'disabled'} for user {user.username}"}

@app.put("/api/admin/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle active status for a user."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own active status"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return {"message": f"Active status {'enabled' if user.is_active else 'disabled'} for user {user.username}"}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.username} deleted successfully"}

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
    if summarizer:
        for text in texts:
            try:
                summary = summarizer(text, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
                summaries.append(summary)
            except Exception as e:
                logger.error(f"Error summarizing text: {str(e)}")
                summaries.append("Summary not available")
    else:
        # If summarizer is not available, use truncated text
        for text in texts:
            summaries.append(text[:100] + "..." if len(text) > 100 else text)

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
    if not summarizer:
        raise HTTPException(
            status_code=503, 
            detail="Summarization service is not available. Please install PyTorch and transformers."
        )
    
    try:
        results = []
        for text in request.texts:
            summary = summarizer(text, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
            results.append({"summary": summary})
        return SummarizeResponse(results=results)
    except Exception as e:
        logger.error(f"Error in summarize endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))