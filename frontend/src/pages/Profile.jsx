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

  useEffect(() => {
    const loadProfile = async () => {
      const authUser = await getAuthUser();
      if (!authUser) {
        navigate("/login");
      } else {
        setUser(authUser);
        setEditData({ name: authUser.name, username: authUser.username });
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

  if (!user) return null;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiUser className="w-7 h-7 text-blue-600" />
            Profile
          </h1>
          <div className="flex space-x-2">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your username"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateProfile}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditData({ name: user.name, username: user.username });
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.username}</p>
                  <p className="text-gray-600">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full capitalize">
                    {user.role}
                  </span>
                </>
              )}
            </div>
          </div>

          {!isEditMode && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

