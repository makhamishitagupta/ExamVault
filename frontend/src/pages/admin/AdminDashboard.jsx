import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser, logout } from '../../utils/auth';
import { FiBarChart2, FiBell, FiBook, FiClipboard, FiFileText, FiHome, FiLogOut, FiMenu, FiUploadCloud, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authUser = await getAuthUser();
      if (!authUser || authUser.role !== 'admin') {
        navigate('/login');
      } else {
        setUser(authUser);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { path: '/admin', label: 'Dashboard', Icon: FiHome },
    { path: '/admin/upload-paper', label: 'Upload Papers', Icon: FiUploadCloud },
    { path: '/admin/manage-papers', label: 'Manage Papers', Icon: FiFileText },
    { path: '/admin/upload-note', label: 'Upload Notes', Icon: FiUploadCloud },
    { path: '/admin/manage-notes', label: 'Manage Notes', Icon: FiClipboard },
    { path: '/admin/manage-subjects', label: 'Manage Subjects', Icon: FiBook },
    { path: '/admin/announcements', label: 'Announcements', Icon: FiBell },
    { path: '/admin/analytics', label: 'Analytics', Icon: FiBarChart2 },
    // { path: '/admin/create-admin', label: 'Create Admin', Icon: FiUsers }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const currentSection = sidebarItems.find((item) => isActive(item.path))?.label || 'Dashboard';

  const initials = (user?.name || user?.email || '')
    .split(' ')
    .map((part) => part[0])
    .join('');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">EV</span>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">ExamVault</p>
                <p className="text-lg font-bold text-white leading-tight">Admin Panel</p>
              </div>
            </Link>
            <button
              type="button"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setShowSidebar(false)}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-5 overflow-y-auto">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                        : 'border-transparent text-gray-300 hover:text-white hover:bg-gray-900 hover:border-gray-700'
                    }`}
                  >
                    <item.Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 mb-3">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <p className="text-xs text-blue-400 mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-black/90 backdrop-blur px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
                onClick={() => setShowSidebar(true)}
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Admin</p>
                <h1 className="text-xl font-bold text-white">{currentSection}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-gray-300 font-medium">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 bg-gradient-to-b from-black via-gray-950 to-black min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

