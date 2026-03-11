import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import { API_BASE, apiFetch, fetchWithRetry } from '../utils/auth';
import { FiFileText } from 'react-icons/fi';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    subject: '',
    examType: ''
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch("/favorite");
        if (!res.ok) return; // not logged in (or token expired) -> no favorites
        const data = await res.json();
  
        const ids = new Set(
          data.favorites
            .filter(f => f.itemType === "Paper")
            .map(f => f.item._id)
        );
  
        setFavoriteIds(ids);
      } catch {
        // backend offline, ignore (favorites are optional for browsing)
      }
    };
  
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetchWithRetry(`${API_BASE}/paper`);
        const data = await res.json();
        // Guard: data.papers may be undefined if server returns error object
        setPapers(Array.isArray(data?.papers) ? data.papers : []);
      } catch (err) {
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  if (loading) return <div>Loading papers...</div>;

  const years = [...new Set(papers.map(p => p.year))];
  const examTypes = [...new Set(papers.map(p => p.examType))];
  const subjects = Array.from(
    new Map(
      papers
        .filter(p => p.subject)
        .map(p => [p.subject._id, p.subject])
    ).values()
  );

  const filteredPapers = papers.filter(paper => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      paper.title?.toLowerCase().includes(q) ||
      paper.subject?.name?.toLowerCase().includes(q);

    const matchesSubject =
      !filters.subject || paper.subject?.name === filters.subject;

    const matchesExamType =
      !filters.examType || paper.examType === filters.examType;

    return matchesSearch && matchesSubject && matchesExamType;
  });


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      subject: '',
      examType: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiFileText className="w-7 h-7 text-blue-600" />
          Papers
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search papers by subject, college, or branch..."
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>


            <select
              value={filters.examType}
              onChange={(e) => handleFilterChange('examType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Exam Types</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredPapers.length}</span> papers
          </p>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <ResourceCard key={paper._id} item={paper} type = 'paper' isFavorite={favoriteIds.has(paper._id)}/>
          ))}
        </div>

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No papers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Papers;

