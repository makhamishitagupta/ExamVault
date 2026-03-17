import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import { API_BASE, apiFetch, fetchWithRetry } from '../utils/auth';
import { FiBookOpen, FiSearch, FiX } from 'react-icons/fi';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  /* =====================
     FILTER DATA
  ====================== */
  const years = [...new Set(notes.map(n => n.year))].sort((a, b) => b - a);
  const units = [...new Set(notes.map(n => n.unit))].sort((a, b) => a - b);

  const subjects = Array.from(
    new Map(
      notes
        .filter(n => n.subject)
        .map(n => [n.subject._id, n.subject])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

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

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchQuery !== '';

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 dark:from-gray-950 to-white dark:to-black border-b border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
              <FiBookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Study Notes
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Access comprehensive study notes organized by subject and unit
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                <FiX className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Unit
              </label>
              <select
                value={filters.unit}
                onChange={(e) => handleFilterChange('unit', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="">All Units</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>Unit {unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found <span className="font-bold text-gray-900 dark:text-white">{filteredNotes.length}</span> note{filteredNotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <ResourceCard
                key={note._id}
                item={note}
                isFavorite={favoriteIds.has(note._id)}
                type="notes"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <FiBookOpen className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notes found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
