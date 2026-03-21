import { useEffect, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import { apiFetch } from "../utils/auth";
import { FiBookmark } from "react-icons/fi";

const Favorites = () => {
  const [activeTab, setActiveTab] = useState("papers");
  const [favoritePapers, setFavoritePapers] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/favorite");
        if (!res.ok) return;

        const data = await res.json();
        const favList = Array.isArray(data?.favorites)
          ? data.favorites
          : [];

        setFavoritePapers(
          favList.filter((f) => f.itemType === "Paper").map((f) => f.item)
        );
        setFavoriteNotes(
          favList.filter((f) => f.itemType === "Notes").map((f) => f.item)
        );
      } catch {
        // ignore errors
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const displayItems =
    activeTab === "papers" ? favoritePapers : favoriteNotes;

  const itemCount =
    activeTab === "papers"
      ? favoritePapers.length
      : favoriteNotes.length;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header (MATCHES PAPERS) */}
      <div className="bg-gradient-to-br from-blue-50 dark:from-gray-950 to-white dark:to-black border-b border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
              <FiBookmark className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Favorites
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your saved papers and notes
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Tabs (MATCH STYLE) */}
        {!loading && (
          <div className="flex gap-4 mb-10">
            <button
              onClick={() => setActiveTab("papers")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                activeTab === "papers"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Papers ({favoritePapers.length})
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                activeTab === "notes"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Notes ({favoriteNotes.length})
            </button>
          </div>
        )}

        {/* Loading (MATCH PAPERS STYLE) */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading favorites...
              </p>
            </div>
          </div>
        ) : itemCount === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <FiBookmark className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No favorite {activeTab} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start adding favorites to see them here.
            </p>
          </div>
        ) : (
          /* Grid SAME AS PAPERS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item) => (
              <ResourceCard
                key={item._id}
                item={item}
                type={activeTab === "papers" ? "paper" : "notes"}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;



// import { useEffect, useState } from 'react';
// import ResourceCard from '../components/ResourceCard';
// import { apiFetch } from '../utils/auth';
// import { FiSmile } from 'react-icons/fi';

// const Favorites = () => {
//   const [activeTab, setActiveTab] = useState('papers');
//   const [favoritePapers, setFavoritePapers] = useState([]);
//   const [favoriteNotes, setFavoriteNotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [favoriteIds, setFavoriteIds] = useState(new Set());

//   useEffect(() => {
//     const fetchFavorites = async () => {
//       try {
//         setLoading(true);
//         const res = await apiFetch("/favorite");
//         if (!res.ok) return;
//         const data = await res.json();
//         const favList = Array.isArray(data?.favorites) ? data.favorites : [];

//         setFavoritePapers(favList.filter(f => f.itemType === "Paper").map(f => f.item));
//         setFavoriteNotes(favList.filter(f => f.itemType === "Notes").map(f => f.item));
//       } catch (err) {
//         // server offline — keep empty arrays, no crash
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFavorites();
//   }, []);

//   const displayItems = activeTab === 'papers' ? favoritePapers : favoriteNotes;
//   const itemCount = activeTab === 'papers' ? favoritePapers.length : favoriteNotes.length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//         {/* Header */}
//         <div className="mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//               <FiSmile className="w-6 h-6 text-white" />
//             </div>
//             Favorites
//           </h1>
//           <p className="text-gray-400">Your curated collection of papers and notes</p>
//         </div>

//         {/* Tab Buttons */}
//         {!loading && (
//           <div className="flex gap-3 mb-12">
//             <button
//               onClick={() => setActiveTab('papers')}
//               className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 uppercase tracking-wider text-sm ${
//                 activeTab === 'papers'
//                   ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
//                   : 'border-2 border-gray-700 text-gray-300 hover:border-blue-500/50 hover:text-white'
//               }`}
//             >
//               Papers
//               <span className="text-gray-300 ml-2">({favoritePapers.length})</span>
//             </button>
//             <button
//               onClick={() => setActiveTab('notes')}
//               className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 uppercase tracking-wider text-sm ${
//                 activeTab === 'notes'
//                   ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
//                   : 'border-2 border-gray-700 text-gray-300 hover:border-blue-500/50 hover:text-white'
//               }`}
//             >
//               Notes
//               <span className="text-gray-300 ml-2">({favoriteNotes.length})</span>
//             </button>
//           </div>
//         )}

//         {/* Loading State */}
//         {loading && (
//           <div className="min-h-96 flex items-center justify-center">
//             <div className="text-center">
//               <div className="inline-block">
//                 <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
//               </div>
//               <p className="mt-4 text-gray-400">Loading favorites...</p>
//             </div>
//           </div>
//         )}

//         {/* Content */}
//         {!loading && (itemCount === 0 ? (
//           <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-16 text-center">
//             <div className="w-16 h-16 bg-linear-to-br from-blue-500/20 to-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
//               <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//               </svg>
//             </div>
//             <p className="text-gray-200 text-lg font-semibold">No favorite {activeTab} yet</p>
//             <p className="text-gray-400 text-sm mt-2">Start favoriting {activeTab} to see them here</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
//             {displayItems.map((item) => (
//               <ResourceCard
//                 key={item._id}
//                 item={item}
//                 type={activeTab === 'papers' ? 'paper' : 'notes'}
//                 isFavorite={true}
//                 onFavoriteChange={(isFav) => {
//                   setFavoriteIds((prev) => {
//                     const newSet = new Set(prev);
//                     if (isFav) {
//                       newSet.add(item._id);
//                     } else {
//                       newSet.delete(item._id);
//                     }
//                     return newSet;
//                   });
//                 }}
//               />
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Favorites;

