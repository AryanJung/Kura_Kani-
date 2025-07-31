# News Aggregator with Authentication System

This project includes a complete authentication system with user registration, login, and account management features.

## Features

### Backend (FastAPI)
- **User Authentication**: JWT-based authentication with secure password hashing
- **User Registration**: Email and username validation
- **User Management**: Profile updates, password changes
- **Database Integration**: SQLite database with SQLAlchemy ORM
- **Security**: Password hashing with bcrypt, JWT tokens
- **API Endpoints**: RESTful API for all authentication operations

### Frontend (React + TypeScript)
- **Login Page**: Username/password authentication
- **Registration Page**: User account creation with validation
- **Account Management**: Profile editing and account information
- **Authentication Context**: Global state management for user sessions
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd Kura_Kani-/Backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   - The `config.env` file is already created with default values
   - For production, update the `SECRET_KEY` with a strong secret

5. **Start the backend server:**
   ```bash
   python start_server.py
   ```
   
   Or alternatively:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The server will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd Kura_Kani-/Project\ 6th
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/update` - Update user profile
- `POST /api/auth/change-password` - Change password

### News Endpoints (Existing)

- `GET /api/news` - Get news articles
- `GET /api/search` - Search news
- `GET /api/clusters` - Get news clusters

## Database Schema

The application uses SQLite with the following user table:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### User Registration
1. Navigate to `/signup`
2. Fill in the registration form:
   - Full Name (optional)
   - Email (required)
   - Username (required)
   - Password (required)
   - Confirm Password (required)
3. Submit the form to create an account

### User Login
1. Navigate to `/login`
2. Enter your username and password
3. Click "Sign in" to authenticate

### Account Management
1. After logging in, click "Account" in the navbar
2. View your profile information
3. Click "Edit" to modify your profile
4. Save changes to update your information

### Logout
1. Click the "Logout" button in the navbar
2. You will be logged out and redirected to the home page

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for frontend communication
- **Error Handling**: Comprehensive error handling and user feedback

## File Structure

```
Kura_Kani-/
├── Backend/
│   ├── main.py              # Main FastAPI application
│   ├── database.py          # Database configuration and models
│   ├── auth.py              # Authentication utilities
│   ├── models.py            # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   ├── config.env           # Environment configuration
│   └── start_server.py      # Server startup script
└── Project 6th/
    ├── src/
    │   ├── services/
    │   │   └── api.ts       # API service functions
    │   ├── contexts/
    │   │   └── AuthContext.tsx  # Authentication context
    │   ├── pages/
    │   │   ├── LoginPage.tsx    # Login component
    │   │   ├── SignUpPage.tsx   # Registration component
    │   │   └── AccountPage.tsx  # Account management
    │   ├── components/
    │   │   └── Navbar.tsx       # Navigation with auth status
    │   └── App.tsx              # Main app with AuthProvider
    └── package.json
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure SQLite is available
   - Check file permissions for database creation

2. **CORS Errors**
   - Verify the frontend is running on `http://localhost:3000`
   - Check CORS configuration in `main.py`

3. **Authentication Errors**
   - Ensure the backend is running on port 8000
   - Check that JWT tokens are being properly stored

4. **Frontend Build Errors**
   - Run `npm install` to install dependencies
   - Check for TypeScript compilation errors

### Development Tips

- Use the browser's developer tools to monitor API requests
- Check the backend console for detailed error logs
- Use the browser's Network tab to debug authentication issues
- Clear browser storage if experiencing authentication problems

## Production Deployment

For production deployment:

1. **Update Security Settings:**
   - Change the `SECRET_KEY` in `config.env`
   - Use a production database (PostgreSQL recommended)
   - Configure proper CORS origins

2. **Environment Variables:**
   - Set `DATABASE_URL` for production database
   - Configure `ALLOWED_ORIGINS` for production domain

3. **Security Headers:**
   - Add HTTPS configuration
   - Configure proper session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Kura-Kani News Aggregator system. 