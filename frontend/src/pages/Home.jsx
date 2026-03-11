import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE, getAuthUser } from '../utils/auth';
import { FiBell, FiSmile } from 'react-icons/fi';

const Home = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  // const recentPapers = papers.slice(0, 3);
  // const recentNotes = notes.slice(0, 3);

  useEffect(() => {
    const loadProfile = async () => {
      const authUser = await getAuthUser();
      setUser(authUser); // can be null or user
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/announcements/viewAll`);
        const data = await res.json();
        // Guard: server may return an error object (e.g. 500) instead of an array
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else {
          console.error("Unexpected announcements response:", data?.message || data);
          setAnnouncements([]);
        }
      } catch (error) {
        console.error("Failed to fetch announcements", error);
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="inline-flex items-center gap-2">
              Welcome back, {user?.name || "Guest"}!
            </span>
          </h1>
          <p className="text-gray-600">
            Continue your learning journey with ExamVault
          </p>
        </div>

        {/* Notice Board / Announcements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiBell className="w-6 h-6 text-blue-600" />
            Announcements
          </h2>
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
        </div>

        {/* Recent Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Papers */}
          {/* <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Papers</h2>
              <Link
                to="/papers"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{paper.subject}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {paper.college} • {paper.branch}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{paper.year} • {paper.semester}</span>
                    <span>{paper.examType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Recent Notes */}
          {/* <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Notes</h2>
              <Link
                to="/notes"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{note.subject}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {note.college} • {note.branch}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{note.year} • {note.semester}</span>
                    <span>{note.examType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Home;

