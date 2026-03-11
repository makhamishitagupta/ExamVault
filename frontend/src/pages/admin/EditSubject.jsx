import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiEdit3 } from 'react-icons/fi';

const EditSubject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(`${API_BASE}/subject/getSuject/${id}`);
        if (!res.ok) throw new Error('Failed to fetch subject');
        const data = await res.json();
        const subject = Array.isArray(data) ? data[0] : data;
        if (!subject) throw new Error('Subject not found');
        setValue('name', subject.name || '');
        setValue('code', subject.code || '');
        setValue('year', subject.year ?? '');
        setValue('lab', subject.lab ?? false);
      } catch (err) {
        console.error('Failed to fetch subject', err);
        setError('Failed to load subject. Please try again.');
      } finally {
        setFetching(false);
      }
    };
    fetchSubject();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit subjects.');
        setLoading(false);
        return;
      }
      const body = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
      };
      if (data.year !== '' && data.year != null) body.year = parseInt(data.year);
      body.lab = !!data.lab;

      const response = await fetch(`${API_BASE}/subject/updateSubject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccess('Subject updated successfully!');
        setTimeout(() => navigate('/admin/manage-subjects'), 1500);
      } else {
        setError(result.message || 'Failed to update subject.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading subject...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiEdit3 className="w-7 h-7 text-blue-600" />
          Edit Subject
        </h1>
        <button
          onClick={() => navigate('/admin/manage-subjects')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Manage Subjects
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Data Structures"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
            <input
              type="text"
              {...register('code', {
                required: 'Code is required',
                minLength: { value: 2, message: 'Code must be at least 2 characters' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., CS101"
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year (Optional)</label>
            <input
              type="number"
              {...register('year', {
                min: { value: 1, message: 'Year must be at least 1' },
                max: { value: 10, message: 'Year cannot exceed 10' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.year ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 2"
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="lab"
              {...register('lab')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="lab" className="ml-2 text-sm text-gray-700">
              Has lab
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Subject'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/manage-subjects')}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubject;
