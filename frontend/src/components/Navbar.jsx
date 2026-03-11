import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getAuthUser, logout } from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const authUser = await getAuthUser();
      setUser(authUser);
    };

    loadUser();
  }, [location]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.email || "")
    .split(" ")
    .map(n => n[0])
    .join("");


  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/papers', label: 'Papers' },
    { path: '/notes', label: 'Notes' },
  ];

  const studentLinks = user && user.role === 'student'
    ? [
      { path: '/favorites', label: 'Favorites' },
      { path: '/profile', label: 'Profile' }
    ]
    : [];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">EV</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ExamVault</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {[...navLinks, ...studentLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {initials}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600 mt-1 capitalize">{user.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          <div className="md:hidden">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {[...navLinks, ...studentLinks].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                Login
              </Link>
              <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

