import { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { apiFetch } from '../utils/auth';
import { FiSmile } from 'react-icons/fi';

const Favorites = () => {
  const [activeTab, setActiveTab] = useState('papers');
  const [favoritePapers, setFavoritePapers] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch("/favorite");
        if (!res.ok) return;
        const data = await res.json();
        const favList = Array.isArray(data?.favorites) ? data.favorites : [];

        setFavoritePapers(favList.filter(f => f.itemType === "Paper").map(f => f.item));
        setFavoriteNotes(favList.filter(f => f.itemType === "Notes").map(f => f.item));
      } catch (err) {
        // server offline — keep empty arrays, no crash
      }
    };
    fetchFavorites();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiSmile className="w-7 h-7 text-blue-600" />
          Favorites
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'papers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Papers ({favoritePapers.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Notes ({favoriteNotes.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'papers' ? (
          <div>
            {favoritePapers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No favorite papers yet</p>
                <p className="text-gray-400 text-sm mt-2">Start favoriting papers to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritePapers.map((paper) => (
                  <ResourceCard key={paper._id} item={paper} type="paper" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {favoriteNotes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No favorite notes yet</p>
                <p className="text-gray-400 text-sm mt-2">Start favoriting notes to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteNotes.map((note) => (
                  <ResourceCard key={note._id} item={note} type="notes" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

