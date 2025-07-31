import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name?: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
  summary?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  admin_users: number;
  total_articles: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth API functions
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/update', userData);
    return response.data;
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  }): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },
};

// Admin API functions
export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (page: number = 1, limit: number = 10): Promise<UserListResponse> => {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data;
  },

  toggleAdminStatus: async (userId: number): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${userId}/toggle-admin`);
    return response.data;
  },

  toggleUserActive: async (userId: number): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${userId}/toggle-active`);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// News API functions
export const newsAPI = {
  getNews: async (params?: {
    categories?: string;
    page?: number;
    limit?: number;
  }): Promise<NewsResponse> => {
    const response = await api.get('/news', { params });
    return response.data;
  },

  searchNews: async (query: string, page: number = 1, limit: number = 10): Promise<NewsResponse> => {
    const response = await api.get('/search', { 
      params: { q: query, page, limit } 
    });
    return response.data;
  },

  getClusters: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/clusters', { params: { page, limit } });
    return response.data;
  },
};

// Local storage helpers
export const storage = {
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};

// User Preferences helpers
export function getUserPreferences(username: string): string[] {
  const raw = localStorage.getItem(`preferences_${username}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setUserPreferences(username: string, categories: string[]) {
  localStorage.setItem(`preferences_${username}`, JSON.stringify(categories));
}

export default api; 