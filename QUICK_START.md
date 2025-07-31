# Quick Start Guide - News Aggregator with Authentication

Get your news aggregator with authentication system running in minutes!

## 🚀 Quick Setup

### 1. Backend Setup (2 minutes)

```bash
cd Kura_Kani-/Backend

# Option 1: Use the simple setup script (recommended)
./install_simple.sh

# Option 2: Use the full setup script
./install.sh
```

This will:
- Create a Python virtual environment
- Install all required dependencies (including PyTorch CPU version)
- Test the setup
- Handle missing dependencies gracefully

### 2. Frontend Setup (1 minute)

```bash
cd Kura_Kani-/Project\ 6th

# Option 1: Use the setup script
./setup_frontend.sh

# Option 2: Manual setup
npm install
npm start
```

## 🎯 What You Get

### Backend Features
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Secure password hashing
- ✅ User profile management
- ✅ SQLite database (auto-created)
- ✅ RESTful API endpoints

### Frontend Features
- ✅ Beautiful login/registration forms
- ✅ Account management dashboard
- ✅ Responsive design
- ✅ Real-time authentication status
- ✅ Automatic token management

## 🔗 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 👤 Test User

After setup, you can:

1. **Register**: Go to http://localhost:3000/signup
2. **Login**: Go to http://localhost:3000/login
3. **Manage Account**: Click "Account" in the navbar

## 🛠️ Manual Setup (if needed)

### Backend Manual Setup
```bash
cd Kura_Kani-/Backend
python3 -m venv venv
source venv/bin/activate

# Install core dependencies
pip install fastapi uvicorn feedparser pydantic sentence-transformers transformers

# Install PyTorch (CPU version)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install auth dependencies
pip install sqlalchemy python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv

python start_server.py
```

### Frontend Manual Setup
```bash
cd Kura_Kani-/Project\ 6th
npm install
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **PyTorch installation fails**
   ```bash
   # Try installing PyTorch manually
   pip install torch --index-url https://download.pytorch.org/whl/cpu
   
   # Or skip PyTorch for basic functionality
   # The app will work without summarization features
   ```

2. **Port already in use**
   - Backend: Change port in `config.env`
   - Frontend: Use `npm start -- --port 3001`

3. **Dependencies not found**
   - Backend: Run `./install_simple.sh` again
   - Frontend: Delete `node_modules` and run `npm install`

4. **Database errors**
   - Delete `news_app.db` and restart the server

5. **Node.js not found**
   ```bash
   # Install Node.js using nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
   source ~/.bashrc  # or ~/.zshrc
   nvm install node
   ```

### Need Help?

- Check the detailed README: `README_AUTH_SETUP.md`
- View API docs: http://localhost:8000/docs
- Check console logs for errors

## 🎉 You're Ready!

Your news aggregator with authentication is now running! Users can register, login, and manage their accounts while browsing news articles.

---

**Next Steps:**
- Customize the UI design
- Add more user features
- Deploy to production
- Add email verification 