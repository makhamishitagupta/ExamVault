import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getAuthUser, logout } from '../utils/auth';
import { FiUser, FiX } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', username: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const authUser = await getAuthUser();
        if (!authUser) {
          navigate("/login");
        } else {
          setUser(authUser);
          setEditData({ name: authUser.name, username: authUser.username });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);
      const response = await apiFetch('/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      setUser(data.user);
      setSuccess('Profile updated successfully');
      setIsEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error updating profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      const response = await apiFetch('/user/delete-profile', { method: 'DELETE' });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to delete profile');
        setIsDeleting(false);
        return;
      }

      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error deleting profile');
      setIsDeleting(false);
      console.error('Error deleting profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex justify-between items-center animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-red-100">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-xl flex justify-between items-center animate-fadeIn">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-200 hover:text-green-100">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              Profile
            </h1>
          </div>
          <div className="flex gap-3">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-full border-2 border-red-500/50 text-red-300 font-semibold hover:bg-red-500/10 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-5xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info or Edit Form */}
            <div className="flex-1 w-full">
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                      placeholder="Your username"
                    />
                  </div>

                  {/* Edit Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditData({ name: user.name, username: user.username });
                      }}
                      className="px-6 py-3 rounded-full border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-600 hover:text-gray-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-gray-400 text-lg mb-3">@{user.username}</p>
                  <p className="text-gray-300 text-sm mb-4">{user.email}</p>
                  <div className="flex gap-2">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/50 text-blue-300 text-sm rounded-full capitalize font-medium">
                      {user.role}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delete Button */}
          {!isEditMode && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="px-6 py-3 rounded-full border-2 border-red-500/50 text-red-300 font-semibold hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;