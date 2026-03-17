import { useEffect, useState, useRef } from 'react';
import { API_BASE, getAuthUser, fetchWithRetry } from '../utils/auth';
import { FiBell } from 'react-icons/fi';

const AnnouncementSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4"></div>
    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full mb-3"></div>
    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6 mb-3"></div>
    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
  </div>
);

const Home = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    getAuthUser().then(setUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        const res = await fetchWithRetry(`${API_BASE}/announcements/viewAll`);
        if (cancelled) return;

        if (res && res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setAnnouncements(Array.isArray(data) ? data : []);
          }
        } else {
          if (!cancelled) setAnnouncements([]);
        }
      } catch {
        if (!cancelled) setAnnouncements([]);
      } finally {
        if (!cancelled) setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Welcome back, <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {user?.name || "Learner"}!
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Continue your learning journey with ExamVault. Access study materials, practice papers, and notes all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="/papers"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 !text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-center"
              >
                Browse Papers
              </a>
              <a
                href="/notes"
                className="px-8 py-3 rounded-full border-2 border-blue-400 text-blue-300 font-semibold hover:bg-blue-500/10 transition-all duration-300 text-center"
              >
                View Notes
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Resources</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1000+</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Content</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Latest Updates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:pb-24 md:pt-10 relative z-10">
        {/* Announcements Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FiBell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Important Updates</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
            Latest Announcements
          </h2>

          {loadingAnnouncements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnnouncementSkeleton />
              <AnnouncementSkeleton />
              <AnnouncementSkeleton />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
              <FiBell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No announcements at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className={`group bg-white dark:bg-gray-900 rounded-2xl border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    announcement.important
                      ? "border-red-400 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                      {announcement.title}
                    </h3>
                    {announcement.important && (
                      <span className="ml-3 flex-shrink-0 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold uppercase tracking-wider">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
