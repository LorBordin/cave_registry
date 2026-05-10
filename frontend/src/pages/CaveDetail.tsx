import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCave, type Cave } from '../api/caves';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

const CaveDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [cave, setCave] = useState<Cave | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadCave = async () => {
      setLoading(true);
      try {
        const data = await fetchCave(id);
        setCave(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cave:', err);
        setError('Grotta non trovata.');
      } finally {
        setLoading(false);
      }
    };

    loadCave();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !cave) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{error || 'Errore imprevisto.'}</h2>
        <Link to="/caves" className="text-teal-400 hover:text-teal-300 font-medium flex items-center justify-center space-x-2">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Torna all'elenco</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/caves" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8">
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Torna all'elenco</span>
      </Link>

      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-700 pb-8">
          <div>
            <div className="text-teal-400 font-mono text-sm mb-2 uppercase tracking-widest">Catasto: {cave.registry_id}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{cave.name}</h1>
          </div>
          <div className="bg-slate-900 rounded-xl px-6 py-4 border border-slate-700">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Quota</div>
            <div className="text-2xl font-bold text-white">{cave.elevation ? `${cave.elevation} m s.l.m.` : '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Sviluppo</div>
            <div className="text-xl font-semibold text-white">{cave.length ? `${cave.length} m` : '—'}</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Dislivello +</div>
            <div className="text-xl font-semibold text-white">{cave.depth_positive ? `${cave.depth_positive} m` : '—'}</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Dislivello -</div>
            <div className="text-xl font-semibold text-white">{cave.depth_negative ? `${cave.depth_negative} m` : '—'}</div>
          </div>
        </div>

        <div className="bg-teal-900/20 border border-teal-500/30 rounded-xl p-8 text-center">
          <div className="text-teal-400 text-3xl mb-4">⚒️</div>
          <h3 className="text-xl font-bold text-white mb-2">Pagina di dettaglio in costruzione</h3>
          <p className="text-slate-300 max-w-lg mx-auto">
            Stiamo lavorando per visualizzare qui tutte le informazioni tecniche, la galleria fotografica e i rilievi scaricabili. Disponibile nella prossima versione.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaveDetail;
