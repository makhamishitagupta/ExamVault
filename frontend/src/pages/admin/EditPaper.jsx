import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiEdit3 } from 'react-icons/fi';

const EditPaper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch subjects and paper data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsRes = await fetch(`${API_BASE}/subject/getAll`);
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData || []);

        // Fetch paper data
        const token = localStorage.getItem('token');
        const paperRes = await fetch(`${API_BASE}/paper/view/${id}`, {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!paperRes.ok) {
          throw new Error('Failed to fetch paper data');
        }

        const paperData = await paperRes.json();
        
        // Pre-fill form with paper data
        setValue('title', paperData.title || '');
        setValue('subject', paperData.subject?._id || '');
        setValue('examType', paperData.examType || '');
        setValue('pdfUrl', paperData.pdfUrl || '');
        if (paperData.year) {
          setValue('year', paperData.year);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load paper data. Please try again.');
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
        setError('You must be logged in to edit papers.');
        setLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        title: data.title,
        subject: data.subject,
        examType: data.examType,
      };
      
      // Include year (can be empty to clear it)
      if (data.year && data.year !== '') {
        requestBody.year = parseInt(data.year);
      } else {
        requestBody.year = null; // Send null to clear year
      }

      const response = await fetch(`${API_BASE}/paper/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Paper updated successfully!');
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/admin/manage-papers');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update paper. Please try again.');
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
        <div className="text-lg text-gray-600">Loading paper data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiEdit3 className="w-7 h-7 text-blue-600" />
          Edit Paper
        </h1>
        <button
          onClick={() => navigate('/admin/manage-papers')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Manage Papers
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Data Structures Mid Term Exam"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                {...register('subject', { 
                  required: 'Subject is required',
                  validate: (value) => value !== '' || 'Please select a subject'
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

            {/* Year Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year (Optional)
              </label>
              <input
                type="number"
                {...register('year', { 
                  min: {
                    value: 2000,
                    message: 'Year must be 2000 or later'
                  },
                  max: {
                    value: new Date().getFullYear() + 1,
                    message: `Year cannot be later than ${new Date().getFullYear() + 1}`
                  }
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

            {/* Exam Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type *
              </label>
              <select
                {...register('examType', { 
                  required: 'Exam type is required',
                  validate: (value) => value !== '' || 'Please select an exam type'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.examType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Exam Type</option>
                <option value="Mid1">Mid 1</option>
                <option value="Mid2">Mid 2</option>
                <option value="Sem">Semester</option>
                <option value="Other">Other</option>
              </select>
              {errors.examType && (
                <p className="text-red-500 text-sm mt-1">{errors.examType.message}</p>
              )}
            </div>
          </div>

          {/* PDF URL Field (Read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF URL (Cannot be changed)
            </label>
            <input
              type="url"
              {...register('pdfUrl')}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="PDF URL"
            />
            <p className="text-sm text-gray-500 mt-2">
              PDF URL cannot be changed. To change the PDF, delete this paper and upload a new one.
            </p>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Updating...' : 'Update Paper'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/manage-papers')}
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

export default EditPaper;
