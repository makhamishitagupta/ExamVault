import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import { API_BASE, apiFetch, fetchWithRetry } from '../utils/auth';
import { FiBookOpen } from 'react-icons/fi';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    subject: '',
    unit: ''
  });

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch("/favorite");
        if (!res.ok) return;
        const data = await res.json();
        const favList = Array.isArray(data?.favorites) ? data.favorites : [];
        const ids = new Set(favList.filter(f => f.itemType === "Notes").map(f => f.item._id));
        setFavoriteIds(ids);
      } catch {
        // backend offline, ignore
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetchWithRetry(`${API_BASE}/notes`);
        const data = await res.json();
        setNotes(Array.isArray(data?.notes) ? data.notes : []);
      } catch (err) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) return <div>Loading notes...</div>;

  const likeNotes = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/notes/like/${id}`, {
      method: "POST",
      headers: {
        "x-auth-token": token
      }
    });
  };

  const downloadNotes = async (id) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/notes/download/${id}`, {
      headers: {
        "x-auth-token": token
      }
    });

    const data = await res.json();
    const makeAbsolute = (u) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u)) return u;
      if (u.startsWith('/')) return `${API_BASE}${u}`;
      return `${API_BASE}/${u}`;
    };

    window.open(makeAbsolute(data.pdfUrl));
  };

  /* =====================
     FILTER DATA
  ====================== */
  const years = [...new Set(notes.map(n => n.year))];
  const units = [...new Set(notes.map(n => n.unit))];

  const subjects = Array.from(
    new Map(
      notes
        .filter(n => n.subject)
        .map(n => [n.subject._id, n.subject])
    ).values()
  );

  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      note.title?.toLowerCase().includes(q) ||
      note.subject?.name?.toLowerCase().includes(q) ||
      note.year?.toString().includes(q) ||
      note.unit?.toString().includes(q);

    const matchesSubject =
      !filters.subject || note.subject?.name === filters.subject;

    const matchesYear =
      !filters.year || note.year?.toString() === filters.year;

    const matchesUnit =
      !filters.unit || note.unit?.toString() === filters.unit;

    return matchesSearch && matchesSubject && matchesYear && matchesUnit;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      subject: '',
      unit: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiBookOpen className="w-7 h-7 text-blue-600" />
          Notes
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes by subject, year, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Units</option>
              {units.map(unit => (
                <option key={unit} value={unit}>Unit {unit}</option>
              ))}
            </select>

          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredNotes.length}</span> notes
          </p>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <ResourceCard
              key={note._id}
              item={note}
              isFavorite={favoriteIds.has(note._id)}
              type="notes"
              onLike={() => likeNotes(note._id)}
              onDownload={() => downloadNotes(note._id)}
            />
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No notes found matching your criteria.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Notes;
