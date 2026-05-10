import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchCaves } from '../api/caves';

const Landing = () => {
  const [stats, setStats] = useState<{ count: number | null }>({ count: null });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchCaves({ page: 1 });
        setStats({ count: response.count });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    loadStats();
  }, []);

  const scrollToContent = () => {
    const statsSection = document.getElementById('stats-bar');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1505159947324-47d0f943a1f8?q=80&w=1600&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/70 z-10" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Catasto Grotte del <br className="hidden md:block" />
            <span className="text-teal-400">Trentino-Alto Adige</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Il registro ufficiale delle grotte della regione, consultabile pubblicamente e aggiornato dai membri autorizzati.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/map" 
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3 rounded-lg transition-all"
            >
              Esplora la mappa
            </Link>
            <Link 
              to="/caves" 
              className="w-full sm:w-auto border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all"
            >
              Sfoglia l'elenco
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-slate-400 hover:text-white animate-bounce transition-colors"
          aria-label="Scroll to stats"
        >
          <ChevronDownIcon className="w-8 h-8" />
        </button>
      </section>

      {/* Stats Bar */}
      <section id="stats-bar" className="bg-slate-800 py-16 border-y border-slate-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-teal-400 mb-2">
                {stats.count !== null ? stats.count : '—'}
              </div>
              <div className="text-sm font-medium uppercase tracking-widest text-slate-400">
                Grotte censite
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-teal-400 mb-2">
                {stats.count !== null ? stats.count : '—'}
              </div>
              <div className="text-sm font-medium uppercase tracking-widest text-slate-400">
                Grotte pubblicate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center mt-auto">
        <p className="text-slate-500 text-sm">
          Catasto Grotte Trentino-Alto Adige
        </p>
      </footer>
    </div>
  );
};

export default Landing;
