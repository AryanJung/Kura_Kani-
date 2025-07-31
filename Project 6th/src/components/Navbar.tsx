import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, SearchIcon, ViewGridIcon, MenuIcon, XIcon, UserCircleIcon, LogoutIcon, CogIcon } from '@heroicons/react/outline';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Search', path: '/search', icon: SearchIcon },
    { name: 'Clusters', path: '/clusters', icon: ViewGridIcon },
  ];

  return (
<header className="bg-orange-600 shadow-lg text-white">
  <div className="container mx-auto px-4">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          Kura-Kani : News Summarizer
        </Link>
      </div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Welcome, {user.username}!</span>
                <Link to="/account" className="flex items-center space-x-2 hover:text-orange-200">
                  <UserCircleIcon className="h-8 w-8" />
                  <span>Account</span>
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className="flex items-center space-x-2 hover:text-orange-200">
                    <CogIcon className="h-8 w-8" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-white text-accent-600 hover:bg-gray-100">
                  Sign Up
                </Link>
              </>
            )}
            {children}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-orange-200">
                    Welcome, {user.username}!
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-6 w-6 mr-2" />
                    Account
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CogIcon className="h-6 w-6 mr-2" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-accent-700"
                  >
                    <LogoutIcon className="h-6 w-6 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 