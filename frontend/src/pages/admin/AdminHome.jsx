import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiBarChart2, FiBell, FiBook, FiClipboard, FiDownload, FiFileText, FiUsers } from 'react-icons/fi';

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

  const stats = [
    {
      title: 'Total Papers',
      value: Number(totalPapers).toLocaleString(),
      Icon: FiFileText,
      iconClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Total Notes',
      value: Number(totalNotes).toLocaleString(),
      Icon: FiBook,
      iconClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Downloads',
      value: Number(totalDownloads).toLocaleString(),
      Icon: FiDownload,
      iconClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Total Users',
      value: Number(totalUsers).toLocaleString(),
      Icon: FiUsers,
      iconClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
  ];

  const quickActions = [
    { to: '/admin/manage-papers', label: 'Manage Papers', Icon: FiFileText },
    { to: '/admin/manage-notes', label: 'Manage Notes', Icon: FiClipboard },
    { to: '/admin/manage-subjects', label: 'Manage Subjects', Icon: FiBook },
    { to: '/admin/announcements', label: 'Manage Announcements', Icon: FiBell },
    { to: '/admin/analytics', label: 'View Analytics', Icon: FiBarChart2 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of platform resources and activity.</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 flex items-center justify-center">
          <div className="text-gray-300">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of platform resources and activity.</p>
        </div>
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 px-5 py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of platform resources and activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 hover:border-blue-500/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-5">
              <p className="text-sm font-medium text-gray-400">{stat.title}</p>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${stat.iconClass}`}>
                <stat.Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 md:p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <span className="text-xs uppercase tracking-wider text-gray-500">Admin Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-xl border border-gray-800 bg-black/30 hover:bg-blue-600/10 hover:border-blue-500/40 px-5 py-4 transition-all"
            >
              <action.Icon className="w-6 h-6 text-blue-400 mb-3" />
              <p className="font-semibold text-gray-100 group-hover:text-white">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">Open</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminHome;

