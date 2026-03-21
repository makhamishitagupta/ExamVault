import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiUploadCloud } from 'react-icons/fi';

const UploadNote = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/subject/getAll`);
        const data = await res.json();
        setSubjects(data || []);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
        setError('Failed to load subjects. Please refresh the page.');
      }
    };
    fetchSubjects();
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to upload notes.');
        setLoading(false);
        return;
      }

      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('unit', parseInt(data.unit));
      formData.append('subject', data.subject,);
      formData.append('year', parseInt(data.unit));
      formData.append('avatar', data.file[0]);

      const response = await fetch(`${API_BASE}/notes/create`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Note uploaded successfully!');
        reset(); // Reset form
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(result.message || 'Failed to upload note. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <FiUploadCloud className="w-7 h-7 text-blue-400" />
        Upload Note
      </h1>
      
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  }
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
            {/* Unit Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unit *
              </label>
              <input
                type="number"
                {...register('unit', {
                  required: 'Unit is required',
                  min: {
                    value: 1,
                    message: 'Unit must be at least 1'
                  },
                  max: {
                    value: 20,
                    message: 'Unit cannot exceed 20'
                  }
                })}
                className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  errors.unit ? 'border-red-500/60' : 'border-gray-700'
                }`}
                placeholder="e.g., 1, 2, 3..."
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <select
                {...register('subject', { 
                  required: 'Subject is required',
                  validate: (value) => value !== '' || 'Please select a subject'
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

            {/* Year Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year *
              </label>
              <input
                type="number"
                {...register('year', {
                  required: 'Year is required',
                  min: {
                    value: 1,
                    message: 'Year must be 2000 or later'
                  },
                  max: {
                    value: 5,
                    message: "Notes can belong only from 1 to 4yrs"
                  }
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

          {/* PDF URL Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDF URL *
            </label>
            {/* <input
              type="url"
              {...register('pdfUrl', { 
                required: 'PDF URL is required',
                pattern: {
                  value: /^https?:\/\/.+\.(pdf|PDF)$/,
                  message: 'Please enter a valid PDF URL (must start with http:// or https:// and end with .pdf)'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pdfUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com/notes/unit1.pdf"
            /> */}
             <input 
              type="file"
              accept="application/pdf"
              {...register("file", {
                required: "PDF file is required",
              })}
              className={`w-full px-4 py-2.5 border rounded-xl bg-black/40 text-gray-100 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-200 file:px-3 file:py-1.5 ${
                errors.pdfUrl ? 'border-red-300' : 'border-gray-300'
              }`}
            />

            {errors.pdfUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.pdfUrl.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Selectfile within 200kb
            </p>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Uploading...' : 'Upload Note'}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setError('');
                setSuccess('');
              }}
              disabled={loading}
              className="bg-gray-800 text-gray-200 px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
