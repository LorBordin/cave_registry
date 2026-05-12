import React, { useEffect, useState } from 'react';

interface TnLegendItem {
  label: string;
  imageData: string;
  contentType: string;
}

interface TnLegendLayer {
  layerId: string | number;
  layerName: string;
  legend: TnLegendItem[];
}

interface TnLegendData {
  layers: TnLegendLayer[];
}

interface BzLegendRule {
  title: string;
  symbolizers: Array<{
    Polygon?: { fill: string };
    Line?: { stroke: string };
    Point?: { fill: string };
  }>;
}

interface BzLegendData {
  Legend: Array<{
    layerName: string;
    rules: BzLegendRule[];
  }>;
}

interface GeologyLegendProps {
  activeLayer: string | null;
}

const GeologyLegend: React.FC<GeologyLegendProps> = ({ activeLayer }) => {
  const [tnData, setTnData] = useState<TnLegendData | null>(null);
  const [bzData, setBzData] = useState<BzLegendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegends = async () => {
      try {
        const [tnRes, bzRes] = await Promise.all([
          fetch('https://geoservices.provincia.tn.it/agol/rest/services/geologico/BDG12_Geologia/MapServer/legend?f=pjson'),
          fetch('https://geoservices1.civis.bz.it/geoserver/p_bz-Geology/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=application/json&layer=GeologicalUnitsOverview')
        ]);

        if (!tnRes.ok || !bzRes.ok) throw new Error('Fallito il caricamento della legenda');

        const [tnJson, bzJson] = await Promise.all([tnRes.json(), bzRes.json()]);
        setTnData(tnJson);
        setBzData(bzJson);
      } catch (err) {
        console.error(err);
        setError('Errore nel caricamento della legenda.');
      } finally {
        setLoading(false);
      }
    };

    fetchLegends();
  }, []);

  const formatLabel = (label: string) => {
    if (!label) return '';
    // Handle Bolzano format "German - Italian"
    if (label.includes(' - ') && !/^[A-Z0-9]+\s*-\s*/.test(label)) {
      const parts = label.split(' - ');
      label = parts.length > 1 ? parts[1] : label;
    }
    const clean = label.replace(/^[A-Z0-9]+\s*-\s*/, ''); // Remove codes
    const lower = clean.toLowerCase();
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

  if (error || !tnData || !bzData) {
    return <div className="p-4 text-xs text-red-500 font-medium">{error || 'Dati della legenda non disponibili'}</div>;
  }

  // Map Bolzano rules
  const bzRules = bzData.Legend?.[0]?.rules || [];

  // AGGREGATION for Trentino
  const tnCategories = [
    {
      title: "Rocce Carbonatiche (Carsificabili)",
      description: "Calcari e dolomie ad alta potenzialità carsica.",
      color: "bg-blue-500",
      items: (tnData.layers.find(l => l.layerName === "SUBSTRATO")?.legend?.filter(i => /calcari|dolom|carbonat/i.test(i.label)) || [])
    },
    {
      title: "Rocce Magmatiche e Vulcaniche",
      description: "Porfidi, graniti e lave (non carsificabili).",
      color: "bg-red-500",
      items: (tnData.layers.find(l => l.layerName === "SUBSTRATO")?.legend?.filter(i => /vulc|pluton|granit|porfidi/i.test(i.label)) || [])
    },
    {
      title: "Rocce Metamorfiche",
      description: "Gneiss, micascisti e filladi.",
      color: "bg-purple-500",
      items: (tnData.layers.find(l => l.layerName === "SUBSTRATO")?.legend?.filter(i => /metam|gneiss|scisti|fillad/i.test(i.label)) || [])
    },
    {
      title: "Coperture Quaternarie",
      description: "Alluvioni, detriti e depositi glaciali.",
      color: "bg-yellow-500",
      items: (tnData.layers.find(l => l.layerName === "DEPOSITI QUATERNARI")?.legend || [])
    }
  ];

  // AGGREGATION for Bolzano
  const bzCategories = [
    {
      title: "Rocce Carbonatiche (Carsificabili)",
      description: "Successioni sedimentarie a prevalenza carbonatica.",
      color: "bg-blue-500",
      rules: bzRules.filter(r => /sedimentaria|elvetiche|calcaree/i.test(r.title))
    },
    {
      title: "Rocce Magmatiche e Vulcaniche",
      description: "Plutoni e complessi vulcanici (non carsificabili).",
      color: "bg-red-500",
      rules: bzRules.filter(r => /plutoni|vulcaniti|vulcanoclastiti/i.test(r.title))
    },
    {
      title: "Rocce Metamorfiche",
      description: "Basamento cristallino, gneiss e filladi.",
      color: "bg-purple-500",
      rules: bzRules.filter(r => !/sedimentaria|elvetiche|calcaree|plutoni|vulcaniti|vulcanoclastiti|quaternari|molassa/i.test(r.title))
    },
    {
      title: "Coperture Quaternarie",
      description: "Depositi glaciali, alluvionali e molassa.",
      color: "bg-yellow-500",
      rules: bzRules.filter(r => /quaternari|molassa/i.test(r.title))
    }
  ];

  return (
    <div className="space-y-10">
      {!activeLayer && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">Legenda non attiva</p>
          <p className="text-xs text-slate-400 mt-2 px-6">
            Seleziona un livello geologico dal menu in alto a destra per esplorarne i dettagli.
          </p>
        </div>
      )}

      {activeLayer === "Geologia Regionale (Macro)" && (
        <div className="space-y-10">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[11px] text-slate-300 leading-relaxed shadow-sm">
            <strong className="text-white">Dettaglio Bolzano (Semplificato):</strong> Le unità regionali sono raggruppate per tipologia litologica.
          </div>

          {bzCategories.map((cat, idx) => (
            cat.rules.length > 0 && (
              <section key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-4">
                  <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-widest flex items-center">
                    <span className={`w-3 h-3 ${cat.color} rounded-sm mr-2 shadow-sm`}></span>
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 italic">{cat.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-y-3 pl-5 border-l-2 border-slate-100">
                  {cat.rules.map((rule, ridx) => {
                    const fillColor = rule.symbolizers?.[0]?.Polygon?.fill || '#CCC';
                    return (
                      <div key={ridx} className="flex items-start group">
                        <div className="shrink-0 mr-3 pt-0.5">
                          <div 
                            className="w-5 h-5 rounded-sm shadow-sm border border-slate-200"
                            style={{ backgroundColor: fillColor }}
                          />
                        </div>
                        <div className="text-[13px] leading-snug text-slate-600 group-hover:text-slate-900 transition-colors">
                          {formatLabel(rule.title)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )
          ))}
        </div>
      )}

      {activeLayer === "Geologia Provincia di Trento" && (
        <div className="space-y-10">
          <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg text-[11px] text-teal-800 leading-relaxed shadow-sm">
            <strong>Dettaglio Trento:</strong> Le unità sono aggregate per facilitare l'identificazione delle aree carsificabili.
          </div>

          {tnCategories.map((cat, idx) => (
            cat.items.length > 0 && (
              <section key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-4">
                  <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-widest flex items-center">
                    <span className={`w-3 h-3 ${cat.color} rounded-sm mr-2 shadow-sm`}></span>
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 italic">{cat.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-y-3 pl-5 border-l-2 border-slate-100">
                  {Array.from(new Map(cat.items.map(item => [item.label, item])).values()).map((item, iidx) => (
                    <div key={iidx} className="flex items-start group">
                      <div className="shrink-0 mr-3 pt-0.5">
                        <img
                          src={`data:${item.contentType};base64,${item.imageData}`}
                          alt={item.label}
                          className="w-5 h-5 object-contain shadow-sm rounded-sm"
                        />
                      </div>
                      <div className="text-[13px] leading-snug text-slate-600 group-hover:text-slate-900 transition-colors">
                        {formatLabel(item.label)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default GeologyLegend;
