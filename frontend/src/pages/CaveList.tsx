import { useState, useEffect } from 'react';
import { fetchCaves, type Cave, type PaginatedResponse } from '../api/caves';

const CaveList = () => {
  const [data, setData] = useState<PaginatedResponse<Cave> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('registry_id');
  const [page, setPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    const loadCaves = async () => {
      setLoading(true);
      try {
        const response = await fetchCaves({
          search: debouncedSearch,
          ordering,
          page,
        });
        if (!ignore) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError('Failed to load caves. Please try again later.');
          console.error(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCaves();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, ordering, page]);

  const handleSort = (field: string) => {
    if (ordering === field) {
      setOrdering(`-${field}`);
    } else {
      setOrdering(field);
    }
    setPage(1);
  };

  const renderSortArrow = (field: string) => {
    if (ordering === field) return ' ↑';
    if (ordering === `-${field}`) return ' ↓';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-teal-400">Caves Registry</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-sm uppercase tracking-wider">
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('registry_id')}
              >
                Registry ID{renderSortArrow('registry_id')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('name')}
              >
                Name{renderSortArrow('name')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('elevation')}
              >
                Elevation (m){renderSortArrow('elevation')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('length')}
              >
                Length (m){renderSortArrow('length')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('depth_positive')}
              >
                Depth↑ (m){renderSortArrow('depth_positive')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('depth_negative')}
              >
                Depth↓ (m){renderSortArrow('depth_negative')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-slate-900/50">
                  <td colSpan={6} className="px-6 py-4 h-12"></td>
                </tr>
              ))
            ) : data?.results.length ? (
              data.results.map((cave) => (
                <tr 
                  key={cave.id} 
                  className="bg-slate-900 odd:bg-slate-900/50 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-teal-300">{cave.registry_id}</td>
                  <td className="px-6 py-4 font-medium">{cave.name}</td>
                  <td className="px-6 py-4 text-slate-300">{cave.elevation ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-300">{cave.length ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-300">{cave.depth_positive ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-300">{cave.depth_negative ?? '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No caves found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between py-4">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-medium">{data.results.length}</span> of <span className="text-white font-medium">{data.count}</span> caves
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous || loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center px-4 bg-slate-900 rounded-lg border border-slate-800">
              Page {page}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next || loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaveList;
