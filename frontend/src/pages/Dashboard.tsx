import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as cavesApi from '../api/caves';
import type { Cave } from '../api/caves';
import { PlusIcon } from '@heroicons/react/20/solid';

const Dashboard: React.FC = () => {
  const [caves, setCaves] = useState<Cave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadCaves = async () => {
      try {
        const data = await cavesApi.fetchAllCaves();
        setCaves(data);
      } catch (err) {
        console.error('Error loading caves:', err);
        setError('Errore durante il caricamento delle grotte.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCaves();
  }, []);

  const handleDelete = async (registryId: string) => {
    if (!window.confirm("Eliminare questa grotta? L'operazione non può essere annullata.")) {
      return;
    }

    try {
      await cavesApi.deleteCave(registryId);
      setCaves(caves.filter(c => c.registry_id !== registryId));
      setDeleteError(null);
    } catch (err) {
      console.error('Error deleting cave:', err);
      setDeleteError('Errore durante l\'eliminazione della grotta.');
    }
  };

  const totalCaves = caves.length;
  const unpublishedCaves = caves.filter(c => !c.is_published).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link
          to="/dashboard/caves/new"
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-teal-500/10"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nuova grotta</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-3xl font-bold text-teal-400">{totalCaves}</div>
          <div className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">Grotte censite</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-3xl font-bold text-teal-400">{unpublishedCaves}</div>
          <div className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">Grotte non pubblicate</div>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 shadow-sm">
          {deleteError}
        </div>
      )}

      {/* Cave Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Catasto</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Quota (m)</th>
                <th className="px-6 py-4">Stato</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {caves.map((cave) => (
                <tr key={cave.id} className="odd:bg-slate-900 even:bg-slate-800 hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-300">{cave.registry_id}</td>
                  <td className="px-6 py-4 font-medium text-white">{cave.name}</td>
                  <td className="px-6 py-4 text-slate-300">{cave.elevation ?? <span className="text-slate-500">—</span>}</td>
                  <td className="px-6 py-4">
                    {cave.is_published ? (
                      <span className="bg-teal-900/50 text-teal-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        Pubblicata
                      </span>
                    ) : (
                      <span className="bg-slate-700/50 text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-600/30">
                        Bozza
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <Link
                      to={`/dashboard/caves/${encodeURIComponent(cave.registry_id)}/edit`}
                      className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      Modifica
                    </Link>
                    <button
                      onClick={() => handleDelete(cave.registry_id)}
                      className="text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
              {caves.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Nessuna grotta trovata nel database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
