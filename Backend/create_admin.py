#!/usr/bin/env python3
"""
Script to create an admin user for the Kura-Kani news application.
Run this script to create an admin user that can access the admin panel.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, User
from auth import get_password_hash

def create_admin_user(username: str, email: str, password: str, full_name: str = None):
    """Create an admin user in the database."""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print(f"User with username '{username}' or email '{email}' already exists.")
            if existing_user.is_admin:
                print("This user is already an admin.")
            else:
                # Make existing user an admin
                existing_user.is_admin = True
                db.commit()
                print(f"Made existing user '{username}' an admin.")
            return
        
        # Create new admin user
        hashed_password = get_password_hash(password)
        admin_user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=True,
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user '{username}' created successfully!")
        print(f"   Email: {email}")
        print(f"   Full Name: {full_name or 'Not provided'}")
        print(f"   Admin Status: {admin_user.is_admin}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Kura-Kani Admin User Creator")
    print("=" * 40)
    
    # Default admin credentials (you can change these)
    default_username = "admin"
    default_email = "admin@kurakani.com"
    default_password = "admin123"
    default_full_name = "System Administrator"
    
    print(f"Creating admin user with default credentials:")
    print(f"Username: {default_username}")
    print(f"Email: {default_email}")
    print(f"Password: {default_password}")
    print(f"Full Name: {default_full_name}")
    print()
    
    create_admin_user(
        username=default_username,
        email=default_email,
        password=default_password,
        full_name=default_full_name
    )
    
    print("\n📝 You can now log in with these credentials to access the admin panel.")
    print("   Visit: http://localhost:3000/admin") 