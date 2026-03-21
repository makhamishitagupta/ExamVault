import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiBook } from 'react-icons/fi';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/subject/getAll`);
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : (data.subjects || []));
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      setError('Failed to load subjects. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to delete subjects.');
        return;
      }
      const response = await fetch(`${API_BASE}/subject/deleteSubject/${subjectId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubjects(subjects.filter((s) => s._id !== subjectId));
        setDeleteConfirm(null);
      } else {
        setError(result.message || 'Failed to delete subject.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error. Please try again.');
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      String(s.year || '').includes(q)
    );
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 flex items-center justify-center min-h-[220px]">
        <div className="text-lg text-gray-300">Loading subjects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiBook className="w-7 h-7 text-blue-400" />
          Manage Subjects
        </h1>
        <Link
          to="/admin/subjects/create"
          className="inline-flex items-center justify-center bg-blue-600 !text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          + Create Subject
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 flex items-start justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-red-300 hover:text-red-200">
            ×
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
        <input
          type="text"
          placeholder="Search by name, code, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-black/40 border border-gray-700 text-gray-100 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            {searchQuery ? 'No subjects found matching your search.' : 'No subjects available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Lab
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-black/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/30">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {subject.year ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {subject.lab ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/subjects/edit/${subject._id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(subject._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this subject? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-800 text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
