#!/usr/bin/env python3
"""
Test script to verify backend setup
"""
import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    required_modules = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'python-multipart',
        'jose',  # python-jose package is imported as 'jose'
        'passlib',
        'dotenv',  # python-dotenv package is imported as 'dotenv'
        'feedparser',
        'transformers',
        'sentence-transformers'
    ]
    
    optional_modules = [
        'torch'
    ]
    
    missing_modules = []
    
    # Map package names to their actual import names
    import_mapping = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'sqlalchemy': 'sqlalchemy',
        'pydantic': 'pydantic',
        'python-multipart': 'multipart',
        'jose': 'jose',
        'passlib': 'passlib',
        'dotenv': 'dotenv',
        'feedparser': 'feedparser',
        'transformers': 'transformers',
        'sentence-transformers': 'sentence_transformers'
    }
    
    for module in required_modules:
        try:
            import_name = import_mapping.get(module, module)
            __import__(import_name)
            print(f"✓ {module}")
        except ImportError:
            print(f"✗ {module} - NOT FOUND")
            missing_modules.append(module)
    
    # Test optional modules
    print("\nOptional modules:")
    for module in optional_modules:
        try:
            __import__(module.replace('-', '_'))
            print(f"✓ {module}")
        except ImportError:
            print(f"⚠ {module} - NOT FOUND (optional)")
    
    if missing_modules:
        print(f"\nMissing required modules: {', '.join(missing_modules)}")
        print("Please install dependencies with: pip install -r requirements.txt")
        return False
    else:
        print("\nAll required modules are available!")
        return True

def test_database():
    """Test database connection"""
    try:
        from database import engine, User
        from sqlalchemy.orm import sessionmaker
        
        # Test database connection
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Test query
        users = db.query(User).all()
        print(f"✓ Database connection successful (found {len(users)} users)")
        
        db.close()
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_auth():
    """Test authentication utilities"""
    try:
        from auth import get_password_hash, verify_password
        
        # Test password hashing
        test_password = "test123"
        hashed = get_password_hash(test_password)
        
        # Test password verification
        if verify_password(test_password, hashed):
            print("✓ Password hashing and verification working")
            return True
        else:
            print("✗ Password verification failed")
            return False
    except Exception as e:
        print(f"✗ Authentication test failed: {e}")
        return False

def main():
    print("Testing Backend Setup...")
    print("=" * 40)
    
    # Test imports
    print("\n1. Testing module imports:")
    imports_ok = test_imports()
    
    if not imports_ok:
        print("\nSetup incomplete. Please install dependencies first.")
        return
    
    # Test database
    print("\n2. Testing database:")
    db_ok = test_database()
    
    # Test auth
    print("\n3. Testing authentication:")
    auth_ok = test_auth()
    
    # Summary
    print("\n" + "=" * 40)
    print("SETUP SUMMARY:")
    print(f"Imports: {'✓' if imports_ok else '✗'}")
    print(f"Database: {'✓' if db_ok else '✗'}")
    print(f"Authentication: {'✓' if auth_ok else '✗'}")
    
    if all([imports_ok, db_ok, auth_ok]):
        print("\n🎉 Backend setup is complete and ready to use!")
        print("\nTo start the server, run:")
        print("python start_server.py")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main() 