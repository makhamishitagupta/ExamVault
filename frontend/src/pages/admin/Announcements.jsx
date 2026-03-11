import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiBell, FiX } from 'react-icons/fi';
import { API_BASE } from '../../utils/auth';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      important: false
    }
  });

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/announcements/viewAll`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError('Authentication token not found. Please login first.');
        setLoading(false);
        return;
      }

      if (editingId) {
        // Update announcement
        const response = await fetch(`${API_BASE}/announcements/update/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to update announcement');
        const result = await response.json();
        
        setAnnouncements(announcements.map(a =>
          a._id === editingId ? result.announcement : a
        ));
        setSuccessMessage('Announcement updated successfully');
        setEditingId(null);
      } else {
        // Create announcement
        const response = await fetch(`${API_BASE}/announcements/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create announcement');
        const result = await response.json();
        
        setAnnouncements([result.announcement, ...announcements]);
        setSuccessMessage('Announcement created successfully');
      }

      reset();
      setShowForm(false);
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setValue('important', announcement.important);
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError('Authentication token not found. Please login first.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/announcements/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      setAnnouncements(announcements.filter(a => a._id !== id));
      setSuccessMessage('Announcement deleted successfully');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiBell className="w-7 h-7 text-blue-600" />
          Announcements
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showForm ? 'Cancel' : 'Create Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter announcement title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                {...register('content', { required: 'Message is required' })}
                disabled={loading}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter announcement message"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('important')}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Important</span>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : editingId ? 'Update' : 'Create'} Announcement
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                announcement.important ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    {announcement.important && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{announcement.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    disabled={loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;

