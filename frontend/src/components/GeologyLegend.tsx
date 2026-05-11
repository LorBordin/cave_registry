import React, { useEffect, useState } from 'react';

interface LegendItem {
  label: string;
  imageData: string;
  contentType: string;
  height: number;
  width: number;
}

interface LegendLayer {
  layerId: number;
  layerName: string;
  legend: LegendItem[];
}

interface LegendData {
  layers: LegendLayer[];
}

const TARGET_LAYERS = [28, 26, 24, 5, 4];

const GeologyLegend: React.FC = () => {
  const [data, setData] = useState<LegendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegend = async () => {
      try {
        const response = await fetch(
          'https://geoservices.provincia.tn.it/agol/rest/services/geologico/BDG00_ALL/MapServer/legend?f=pjson'
        );
        if (!response.ok) throw new Error('Fallito il caricamento della legenda');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError('Errore nel caricamento della legenda.');
      } finally {
        setLoading(false);
      }
    };

    fetchLegend();
  }, []);

  const formatLabel = (label: string) => {
    if (!label) return '';
    // Basic title case: lowercase all, then capitalize first letter of each word
    // (or just first letter of sentence for better geological naming)
    const lower = label.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-xs text-slate-500">Caricamento legenda...</span>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-4 text-xs text-red-500 font-medium">{error || 'Dati non disponibili'}</div>;
  }

  const filteredLayers = data.layers
    .filter((l) => TARGET_LAYERS.includes(l.layerId))
    .sort((a, b) => TARGET_LAYERS.indexOf(a.layerId) - TARGET_LAYERS.indexOf(b.layerId));

  return (
    <div className="space-y-8">
      {filteredLayers.map((layer) => (
        <section key={layer.layerId} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-100 pb-2 flex items-center">
            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
            {layer.layerName}
          </h4>
          <div className="space-y-4">
            {layer.legend.map((item, idx) => (
              <div key={idx} className="flex items-start group">
                <div className="shrink-0 mr-4 pt-0.5">
                  <img
                    src={`data:${item.contentType};base64,${item.imageData}`}
                    alt={item.label}
                    className="w-6 h-6 object-contain shadow-sm rounded-sm group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="text-[14px] leading-relaxed text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                  {formatLabel(item.label)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default GeologyLegend;
