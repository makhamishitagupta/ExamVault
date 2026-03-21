import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiBookOpen } from 'react-icons/fi';

const ManageNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notes`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
      setError('Failed to load notes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to delete notes.');
        return;
      }

      const response = await fetch(`${API_BASE}/notes/delete/${noteId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== noteId));
        setDeleteConfirm(null);
      } else {
        setError(result.message || `Failed to delete note${response.status === 403 ? ': you can only delete notes you uploaded.' : '.'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error. Please try again.');
    }
  };

  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(q) ||
      note.subject?.name?.toLowerCase().includes(q) ||
      note.subject?.code?.toLowerCase().includes(q) ||
      String(note.unit).includes(q) ||
      String(note.year).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 flex items-center justify-center min-h-[220px]">
        <div className="text-lg text-gray-300">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiBookOpen className="w-7 h-7 text-blue-400" />
          Manage Notes
        </h1>
        <Link
          to="/admin/upload-note"
          className="inline-flex items-center justify-center bg-blue-600 !text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          + Upload New Note
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
          placeholder="Search by title, subject, unit, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-black/40 border border-gray-700 text-gray-100 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 overflow-hidden">
        {filteredNotes.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            {searchQuery ? 'No notes found matching your search.' : 'No notes available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredNotes.map((note) => (
                  <tr key={note._id} className="hover:bg-black/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-100 max-w-xs truncate" title={note.title}>
                        {note.title || `${note.subject?.name} - Unit ${note.unit}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">
                        {note.subject?.name} ({note.subject?.code})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/30">
                        Unit {note.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {note.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {note.downloadCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/edit-note/${note._id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(note._id)}
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
              Are you sure you want to delete this note? This action cannot be undone.
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

export default ManageNotes;
