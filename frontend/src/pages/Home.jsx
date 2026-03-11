import { useEffect, useState, useRef } from 'react';
import { API_BASE, getAuthUser, fetchWithRetry } from '../utils/auth';
import { FiBell } from 'react-icons/fi';

const AnnouncementSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-5/6 mb-4"></div>
    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
  </div>
);

const Home = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    // getAuthUser already uses fetchWithRetry internally — no errors shown
    getAuthUser().then(setUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        // fetchWithRetry silently retries on 503 (Render cold start) every few seconds
        const res = await fetchWithRetry(`${API_BASE}/announcements/viewAll`);
        if (cancelled) return;

        if (res && res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setAnnouncements(Array.isArray(data) ? data : []);
          }
        } else {
          // Gave up retrying — show empty state quietly
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "Guest"}!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey with ExamVault
          </p>
        </div>

        {/* Announcements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiBell className="w-6 h-6 text-blue-600" />
            Announcements
          </h2>

          {loadingAnnouncements ? (
            // Skeleton shimmer while server wakes up — no error shown to user
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnnouncementSkeleton />
              <AnnouncementSkeleton />
              <AnnouncementSkeleton />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-gray-500 text-sm">No announcements at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${
                    announcement.important
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    {announcement.important && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{announcement.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
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
