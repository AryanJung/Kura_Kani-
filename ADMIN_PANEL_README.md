# 🛡️ Admin Panel - Kura-Kani News Application

This document describes the admin panel functionality added to the Kura-Kani news application.

## 🚀 Features

### Admin Authentication
- **Role-based access control**: Only users with `is_admin=True` can access admin features
- **Protected routes**: `/admin` route requires admin privileges
- **JWT token validation**: Admin status is included in authentication tokens

### Admin Dashboard
- **Statistics Overview**: 
  - Total users count
  - Active users count
  - Verified users count
  - Admin users count
  - Total articles from RSS feed

### User Management
- **User List**: Paginated view of all registered users
- **User Details**: Display username, email, full name, status, and admin privileges
- **User Actions**:
  - Toggle user active/inactive status
  - Grant/revoke admin privileges
  - Delete user accounts
- **Safety Features**:
  - Admins cannot modify their own status
  - Admins cannot delete their own account
  - Confirmation dialogs for destructive actions

## 🔧 Setup Instructions

### 1. Backend Setup

The admin functionality is already integrated into the existing backend. No additional setup required.

### 2. Create Admin User

Run the admin user creation script:

```bash
cd Backend
python create_admin.py
```

This will create an admin user with these default credentials:
- **Username**: `admin`
- **Email**: `admin@kurakani.com`
- **Password**: `admin123`
- **Full Name**: `System Administrator`

### 3. Access Admin Panel

1. Start the backend server:
   ```bash
   cd Backend
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd "Project 6th"
   npm start
   ```

3. Log in with admin credentials at `http://localhost:3000/login`

4. Access the admin panel at `http://localhost:3000/admin`

## 📋 API Endpoints

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin` | Admin panel main endpoint | Admin |
| GET | `/api/admin/stats` | Get admin statistics | Admin |
| GET | `/api/admin/users` | Get paginated user list | Admin |
| PUT | `/api/admin/users/{id}/toggle-admin` | Toggle user admin status | Admin |
| PUT | `/api/admin/users/{id}/toggle-active` | Toggle user active status | Admin |
| DELETE | `/api/admin/users/{id}` | Delete user account | Admin |

### Authentication

All admin endpoints require:
- Valid JWT token in Authorization header
- User must have `is_admin=True`

## 🎨 Frontend Features

### Admin Navigation
- Admin link appears in navbar for admin users
- Responsive design for mobile and desktop
- Icon-based navigation with CogIcon

### Admin Dashboard UI
- **Statistics Cards**: Color-coded metrics display
- **User Management Table**: Sortable and paginated
- **Action Buttons**: Contextual actions for each user
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth loading indicators

### Security Features
- **Access Control**: Non-admin users see "Access Denied" page
- **Route Protection**: Admin routes are protected at component level
- **Token Validation**: Automatic token refresh and validation

## 🔒 Security Considerations

### Backend Security
- **Role-based middleware**: `get_current_admin_user()` function
- **Database constraints**: Admin field in User model
- **Input validation**: Pydantic models for all endpoints
- **Error handling**: Proper HTTP status codes and messages

### Frontend Security
- **Route protection**: Admin routes check user permissions
- **Token management**: Automatic token refresh and logout
- **UI feedback**: Clear indication of admin status

## 🐛 Troubleshooting

### Common Issues

1. **"Access Denied" Error**
   - Ensure user has `is_admin=True` in database
   - Check JWT token is valid and includes admin status
   - Verify user is logged in

2. **Admin Link Not Showing**
   - Check user object includes `is_admin: true`
   - Verify AuthContext is properly updated after login
   - Clear browser cache and localStorage

3. **API Errors**
   - Check backend server is running
   - Verify CORS settings allow frontend origin
   - Check database connection and user table structure

### Database Issues

If you need to manually set admin status:

```sql
-- SQLite
UPDATE users SET is_admin = 1 WHERE username = 'your_username';

-- PostgreSQL
UPDATE users SET is_admin = true WHERE username = 'your_username';
```

## 📝 Development Notes

### Adding New Admin Features

1. **Backend**: Add new endpoint with `get_current_admin_user()` dependency
2. **Frontend**: Add new API function in `adminAPI` object
3. **UI**: Create new component or extend AdminPage
4. **Testing**: Test with both admin and non-admin users

### Database Schema

The User model includes:
```python
is_admin = Column(Boolean, default=False)
```

### Token Structure

JWT tokens now include admin status:
```json
{
  "sub": "username",
  "is_admin": true,
  "exp": 1234567890
}
```

## 🤝 Contributing

When adding new admin features:
1. Follow existing code patterns
2. Add proper error handling
3. Include security checks
4. Update this documentation
5. Test with different user roles

---

**Note**: This admin panel is designed for development and testing purposes. For production use, consider implementing additional security measures such as audit logging, rate limiting, and more granular permissions. 