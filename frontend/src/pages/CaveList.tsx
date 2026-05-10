import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
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
          setError('Errore nel caricamento delle grotte. Riprova più tardi.');
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

  const renderSortIcon = (field: string) => {
    if (ordering === field) return <ChevronUpIcon className="w-4 h-4 ml-1 inline" />;
    if (ordering === `-${field}`) return <ChevronDownIcon className="w-4 h-4 ml-1 inline" />;
    return null;
  };

  const totalPages = data ? Math.ceil(data.count / 50) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Elenco Grotte</h1>
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cerca per nome o catasto..."
            className="block w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('registry_id')}
              >
                Catasto {renderSortIcon('registry_id')}
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('name')}
              >
                Nome {renderSortIcon('name')}
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
                onClick={() => handleSort('elevation')}
              >
                Quota (m) {renderSortIcon('elevation')}
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
                onClick={() => handleSort('length')}
              >
                Sviluppo {renderSortIcon('length')}
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
                onClick={() => handleSort('depth_positive')}
              >
                Dislivello+ {renderSortIcon('depth_positive')}
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
                onClick={() => handleSort('depth_negative')}
              >
                Dislivello- {renderSortIcon('depth_negative')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="animate-pulse odd:bg-slate-900 even:bg-slate-800">
                  <td colSpan={6} className="px-4 py-4 h-12"></td>
                </tr>
              ))
            ) : data?.results.length ? (
              data.results.map((cave) => (
                <tr 
                  key={cave.id} 
                  className="odd:bg-slate-900 even:bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <td className="px-4 py-3 font-mono">
                    <Link 
                      to={`/caves/${cave.registry_id}`} 
                      className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                    >
                      {cave.registry_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {cave.name}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{cave.elevation ?? <span className="text-slate-500">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{cave.length ?? <span className="text-slate-500">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{cave.depth_positive ?? <span className="text-slate-500">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{cave.depth_negative ?? <span className="text-slate-500">—</span>}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Nessuna grotta trovata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <p className="text-slate-400 text-sm">
            Pagina <span className="text-white font-medium">{page}</span> di <span className="text-white font-medium">{totalPages}</span> — <span className="text-white font-medium">{data.count}</span> grotte totali
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous || loading}
              className="px-6 py-2 border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next || loading}
              className="px-6 py-2 border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaveList;
