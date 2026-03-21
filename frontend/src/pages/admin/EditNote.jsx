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
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 flex items-center justify-center min-h-[220px]">
        <div className="text-lg text-gray-300">Loading note data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiEdit3 className="w-7 h-7 text-blue-400" />
          Edit Note
        </h1>
        <button
          onClick={() => navigate('/admin/manage-notes')}
          className="text-gray-400 hover:text-white"
        >
          ← Back to Manage Notes
        </button>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8">
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                })}
                className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  errors.title ? 'border-red-500/60' : 'border-gray-700'
                }`}
                placeholder="e.g., Data Structures Unit 1 Notes"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Unit *</label>
              <input
                type="number"
                {...register('unit', {
                  required: 'Unit is required',
                  min: { value: 1, message: 'Unit must be at least 1' },
                  max: { value: 20, message: 'Unit cannot exceed 20' },
                })}
                className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  errors.unit ? 'border-red-500/60' : 'border-gray-700'
                }`}
                placeholder="e.g., 1"
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
              <select
                {...register('subject', {
                  required: 'Subject is required',
                  validate: (value) => value !== '' || 'Please select a subject',
                })}
                className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  errors.subject ? 'border-red-500/60' : 'border-gray-700'
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
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
                className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  errors.year ? 'border-red-500/60' : 'border-gray-700'
                }`}
                placeholder="e.g., 2024"
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDF URL (Cannot be changed)
            </label>
            <input
              type="url"
              {...register('pdfUrl')}
              disabled
              className="w-full px-4 py-2.5 border border-gray-700 rounded-xl bg-gray-900 text-gray-500 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-2">
              PDF URL cannot be changed. To change the PDF, delete this note and upload a new one.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-medium transition-colors ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Note'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/manage-notes')}
              disabled={loading}
              className="bg-gray-800 text-gray-200 px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
