#!/usr/bin/env python3
"""
Startup script for the News Aggregator Backend
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("config.env")

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"Starting News Aggregator Backend on {host}:{port}")
    print(f"Reload mode: {reload}")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    ) 