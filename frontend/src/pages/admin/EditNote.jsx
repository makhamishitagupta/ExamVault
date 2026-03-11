import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiEdit3 } from 'react-icons/fi';

const EditNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsRes = await fetch(`${API_BASE}/subject/getAll`);
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData || []);

        const noteRes = await fetch(`${API_BASE}/notes/view/${id}`);

        if (!noteRes.ok) {
          throw new Error('Failed to fetch note data');
        }

        const noteData = await noteRes.json();

        setValue('title', noteData.title || '');
        setValue('unit', noteData.unit ?? '');
        setValue('subject', noteData.subject?._id || '');
        setValue('year', noteData.year ?? '');
        setValue('pdfUrl', noteData.pdfUrl || '');
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load note data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to edit notes.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/notes/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          title: data.title.trim(),
          unit: parseInt(data.unit),
          subject: data.subject,
          year: parseInt(data.year),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Note updated successfully!');
        setTimeout(() => {
          navigate('/admin/manage-notes');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update note. Please try again.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading note data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiEdit3 className="w-7 h-7 text-blue-600" />
          Edit Note
        </h1>
        <button
          onClick={() => navigate('/admin/manage-notes')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Manage Notes
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Data Structures Unit 1 Notes"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <input
                type="number"
                {...register('unit', {
                  required: 'Unit is required',
                  min: { value: 1, message: 'Unit must be at least 1' },
                  max: { value: 20, message: 'Unit cannot exceed 20' },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.unit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 1"
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                {...register('subject', {
                  required: 'Subject is required',
                  validate: (value) => value !== '' || 'Please select a subject',
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="number"
                {...register('year', {
                  required: 'Year is required',
                  min: { value: 2000, message: 'Year must be 2000 or later' },
                  max: {
                    value: new Date().getFullYear() + 1,
                    message: `Year cannot be later than ${new Date().getFullYear() + 1}`,
                  },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 2024"
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF URL (Cannot be changed)
            </label>
            <input
              type="url"
              {...register('pdfUrl')}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-2">
              PDF URL cannot be changed. To change the PDF, delete this note and upload a new one.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Note'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/manage-notes')}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNote;
