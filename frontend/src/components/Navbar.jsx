import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getAuthUser, logout } from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const adminLinks = user && user.role === 'admin'
    ? [
      { path: '/admin', label: 'Admin Dashboard' }
    ]
    : [];

  return (
    <nav className="bg-black border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">ExamVault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[...navLinks, ...studentLinks, ...adminLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 relative group ${
                  isActive(link.path)
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ${
                  isActive(link.path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-white hidden md:block">{user.name.split(' ')[0]}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 py-2 z-50">
                    <div className="px-5 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-blue-400 mt-1 uppercase tracking-wider font-medium">{user.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 !text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {[...navLinks, ...studentLinks, ...adminLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center hover:shadow-lg transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-3 border-t border-gray-800 md:hidden space-y-2">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="block w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-left"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

