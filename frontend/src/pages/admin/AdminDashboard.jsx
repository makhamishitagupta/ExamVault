import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser, logout } from '../../utils/auth';
import { FiBarChart2, FiBell, FiBook, FiClipboard, FiFileText, FiHome, FiLogOut, FiUploadCloud } from 'react-icons/fi';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">EV</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500">{user.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

