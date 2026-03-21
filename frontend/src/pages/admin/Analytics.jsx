import { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/auth';
import { FiBarChart2, FiBookOpen, FiDownload, FiFileText, FiUsers } from 'react-icons/fi';

const Analytics = () => {
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
          setError('You must be logged in to view analytics.');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/analytics`, {
          headers: { 'x-auth-token': token },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || 'Failed to load analytics.');
          setLoading(false);
          return;
        }
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 flex items-center justify-center min-h-[220px]">
        <div className="text-lg text-gray-300">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiBarChart2 className="w-7 h-7 text-blue-400" />
          Analytics Dashboard
        </h1>
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  const totalPapers = analytics?.totalPapers ?? 0;
  const totalNotes = analytics?.totalNotes ?? 0;
  const totalDownloads = analytics?.totalDownloads ?? 0;
  const totalUsers = analytics?.totalUsers ?? 0;
  const totalResources = totalPapers + totalNotes;
  const avgDownloadsPerUser = totalUsers > 0 ? (totalDownloads / totalUsers).toFixed(1) : '0';
  const avgDownloadsPerResource = totalResources > 0 ? (totalDownloads / totalResources).toFixed(0) : '0';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <FiBarChart2 className="w-7 h-7 text-blue-400" />
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Papers</h3>
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalPapers}</div>
          <p className="text-sm text-gray-500">Active papers in system</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Notes</h3>
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalNotes}</div>
          <p className="text-sm text-gray-500">Study notes available</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 hover:border-violet-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Downloads</h3>
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
              <FiDownload className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {Number(totalDownloads).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">All-time downloads</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Users</h3>
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {Number(totalUsers).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Registered users</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Additional Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-black/30 border border-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">{avgDownloadsPerUser}</div>
            <div className="text-sm text-gray-400">Avg Downloads per User</div>
          </div>
          <div className="text-center p-4 bg-black/30 border border-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">{totalResources}</div>
            <div className="text-sm text-gray-400">Total Resources</div>
          </div>
          <div className="text-center p-4 bg-black/30 border border-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">{avgDownloadsPerResource}</div>
            <div className="text-sm text-gray-400">Avg Downloads per Resource</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
