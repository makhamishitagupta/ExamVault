import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiBarChart2, FiBell, FiBook, FiClipboard, FiDownload, FiFileText, FiUploadCloud, FiUsers } from 'react-icons/fi';

const AdminHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view the dashboard.');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/analytics`, {
          headers: { 'x-auth-token': token },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || 'Failed to load dashboard stats.');
          setLoading(false);
          return;
        }
        setAnalytics(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalPapers = analytics?.totalPapers ?? 0;
  const totalNotes = analytics?.totalNotes ?? 0;
  const totalDownloads = analytics?.totalDownloads ?? 0;
  const totalUsers = analytics?.totalUsers ?? 0;

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Papers</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalPapers}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Notes</h3>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalNotes}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Downloads</h3>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiDownload className="w-6 h-6 text-purple-700" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{Number(totalDownloads).toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Users</h3>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{Number(totalUsers).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* <Link
            to="/admin/upload-paper"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiUploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Upload Paper</span>
          </Link> */}
          <Link
            to="/admin/manage-papers"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiFileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Manage Papers</span>
          </Link>
          {/* <Link
            to="/admin/upload-note"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiUploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Upload Note</span>
          </Link> */}
          <Link
            to="/admin/manage-notes"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiClipboard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Manage Notes</span>
          </Link>
          <Link
            to="/admin/manage-subjects"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiBook className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Manage Subjects</span>
          </Link>
          <Link
            to="/admin/announcements"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiBell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Manage Announcements</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiBarChart2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </Link>
          {/* <Link
            to="/admin/create-admin"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
          >
            <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">Create Admin</span>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

