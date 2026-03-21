import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] bg-white dark:bg-black flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
          Error 404
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 !text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;