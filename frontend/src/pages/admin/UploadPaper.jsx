import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/auth';
import { FiUploadCloud } from 'react-icons/fi';

const UploadPaper = () => {
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
        setError('You must be logged in to upload papers.');
        setLoading(false);
        return;
      }

      // Prepare request body - only include year if provided
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('examType', data.examType);

      if (data.year && data.year !== '') {
        formData.append('year', data.year);
      }

      formData.append('avatar', data.file[0]);

      const response = await fetch(`${API_BASE}/paper/create`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          // Do not set Content-Type manually for FormData
        },
        body: formData,
      });

      const result = await response.json();
      // console.log(result);

      if (response.ok) {
        setSuccess('Paper uploaded successfully!');
        reset(); 
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(result.message || 'Failed to upload paper. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiUploadCloud className="w-7 h-7 text-blue-600" />
        Upload Paper
      </h1>
      
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

          {/* PDF URL Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF *
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
              placeholder="https://example.com/papers/exam.pdf"
            /> */}
            <input 
              type="file"
              accept="application/pdf"
              {...register("file", {
                required: "PDF file is required",
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pdfUrl ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.pdfUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.pdfUrl.message}</p>
            )}

            <p className="text-sm text-gray-500 mt-2">
              Select PDF file in 200kb.
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
              {loading ? 'Uploading...' : 'Upload Paper'}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setError('');
                setSuccess('');
              }}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPaper;
