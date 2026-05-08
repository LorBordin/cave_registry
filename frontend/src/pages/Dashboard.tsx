import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as cavesApi from '../api/caves';
import type { Cave } from '../api/caves';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard Amministrativa</h1>
        <Link
          to="/dashboard/caves/new"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-bold transition-colors"
        >
          + Aggiungi grotta
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Totale grotte</h2>
          <p className="text-4xl font-bold mt-2">{totalCaves}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Non pubblicate</h2>
          <p className="text-4xl font-bold mt-2 text-orange-400">{unpublishedCaves}</p>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200">
          {deleteError}
        </div>
      )}

      {/* Cave Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Codice Catasto</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Nome</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Quota (m)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Stato</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {caves.map((cave) => (
              <tr key={cave.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{cave.registry_id}</td>
                <td className="px-6 py-4 font-medium">{cave.name}</td>
                <td className="px-6 py-4 text-slate-300">{cave.elevation ?? '-'}</td>
                <td className="px-6 py-4">
                  {cave.is_published ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-500/50">
                      Pubblicata
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900/50 text-slate-400 border border-slate-700">
                      Bozza
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    to={`/dashboard/caves/${encodeURIComponent(cave.registry_id)}/edit`}
                    className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={() => handleDelete(cave.registry_id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
            {caves.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nessuna grotta trovata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
