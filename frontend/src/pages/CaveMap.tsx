import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { fetchCaveGeoJson } from '../api/caves';
import { fixLeafletIcon } from '../utils/leafletIconFix';
import GeologyLegend from '../components/GeologyLegend';

fixLeafletIcon();

const CaveMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const geologiaWmsRef = useRef<L.TileLayer.WMS | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize base layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    });

    const geologiaWms = L.tileLayer.wms('https://geoservices.provincia.tn.it/agol/services/geologico/BDG00_ALL/MapServer/WMSServer?', {
      layers: '1,3,5,23,24',
      format: 'image/png',
      transparent: true,
      opacity: 0.7,
      attribution: '&copy; Provincia Autonoma di Trento'
    });
    geologiaWmsRef.current = geologiaWms;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      layers: [osm],
      center: [46.07, 11.12],
      zoom: 9
    });
    mapRef.current = map;

    // Layer control
    const baseMaps = {
      "OpenStreetMap": osm,
      "Satellite (Esri)": esri
    };

    const overlayMaps = {
      "Geologia PAT": geologiaWms
    };

    L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

    const clusterGroup = L.markerClusterGroup();
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    // Dynamic Opacity based on Base Layer
    map.on('baselayerchange', (e: L.LayersControlEvent) => {
      if (!geologiaWmsRef.current) return;
      
      if (e.name === "Satellite (Esri)") {
        geologiaWmsRef.current.setOpacity(0.5);
      } else {
        geologiaWmsRef.current.setOpacity(0.7);
      }
    });

    // Identify Hover Logic
    let lastRequestTime = 0;
    const identifyThrottle = 400; // ms

    const onMouseMove = async (e: L.LeafletMouseEvent) => {
      if (!geologiaWmsRef.current || !map.hasLayer(geologiaWmsRef.current)) {
        setHoverInfo(null);
        return;
      }

      if (map.getZoom() < 12) {
        setHoverInfo(null);
        return;
      }

      const now = Date.now();
      if (now - lastRequestTime < identifyThrottle) return;
      lastRequestTime = now;

      const point = map.latLngToContainerPoint(e.latlng);
      const size = map.getSize();
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const url = `https://geoservices.provincia.tn.it/agol/services/geologico/BDG00_ALL/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=1,3,5,23,24&LAYERS=1,3,5,23,24&INFO_FORMAT=application/geojson&I=${Math.floor(point.x)}&J=${Math.floor(point.y)}&WIDTH=${size.x}&HEIGHT=${size.y}&CRS=EPSG:4326&BBOX=${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const text = props.NOME || props.DESCRIZIONE || props.SIGLACARTOGRAFICA;
          if (text) {
            setHoverInfo({
              text,
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY
            });
          } else {
            setHoverInfo(null);
          }
        } else {
          setHoverInfo(null);
        }
      } catch (err) {
        console.error('Error fetching feature info:', err);
        setHoverInfo(null);
      }
    };

    map.on('mousemove', onMouseMove);

    // Fetch and load GeoJSON data
    const loadData = async () => {
      setLoading(true);
      try {
        const geojson = await fetchCaveGeoJson();
        
        const geoJsonLayer = L.geoJSON(geojson, {
          pointToLayer: (feature, latlng) => {
            const marker = L.marker(latlng);
            const { name, registry_id, elevation, length, depth_positive, depth_negative } = feature.properties;
            
            const popupContent = `
              <div class="p-1">
                <div class="font-bold text-base mb-1 text-slate-900">${name}</div>
                <div class="text-xs text-slate-600 mb-0.5">Catasto: <span class="font-mono">${registry_id}</span></div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600 mt-2">
                  <div>Quota: <span class="font-semibold text-slate-800">${elevation ? elevation + ' m' : '—'}</span></div>
                  <div>Sviluppo: <span class="font-semibold text-slate-800">${length ? length + ' m' : '—'}</span></div>
                  <div>Dislivello+: <span class="font-semibold text-slate-800">${depth_positive ? depth_positive + ' m' : '—'}</span></div>
                  <div>Dislivello-: <span class="font-semibold text-slate-800">${depth_negative ? depth_negative + ' m' : '—'}</span></div>
                </div>
                <div class="pt-2 mt-2 border-t border-slate-200">
                  <a href="/caves/${registry_id}" style="color: #2dd4bf;" class="font-semibold text-xs hover:underline transition-colors">Dettagli →</a>
                </div>
              </div>
            `;
            
            marker.bindPopup(popupContent);
            return marker;
          }
        });

        clusterGroup.addLayer(geoJsonLayer);
        setError(null);
      } catch (err) {
        setError('Errore nel caricamento dei dati.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      map.off('mousemove', onMouseMove);
      map.remove();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900 flex">
      {/* Map Area */}
      <div className="relative flex-1 h-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>

        {/* Legend Toggle Button */}
        {!isLegendOpen && (
          <div className="absolute bottom-6 right-6 z-[1000]">
            <button
              onClick={() => setIsLegendOpen(true)}
              className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
              title="Mostra Legenda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-bold text-sm">Legenda Geologica</span>
            </button>
          </div>
        )}

        {/* Hover Tooltip */}
        {hoverInfo && (
          <div 
            className="fixed z-[3000] pointer-events-none bg-slate-900/90 text-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 text-xs font-semibold backdrop-blur-sm max-w-xs animate-in fade-in duration-200"
            style={{ 
              left: hoverInfo.x + 15, 
              top: hoverInfo.y + 15
            }}
          >
            {hoverInfo.text}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">Caricamento grotte...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-red-950/20 backdrop-blur-sm">
            <div className="bg-slate-900 border border-red-500/50 px-8 py-6 rounded-xl shadow-2xl text-center">
              <div className="text-red-400 text-3xl mb-2 font-bold">!</div>
              <div className="text-white font-semibold text-lg">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
              >
                Riprova
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Legend Panel */}
      <div 
        className={`fixed top-16 right-0 bottom-0 w-80 md:w-96 bg-slate-50 border-l border-slate-200 flex flex-col shadow-2xl z-[1001] transition-transform duration-300 ease-in-out ${
          isLegendOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Legenda Geologica
            </h3>
            <p className="text-[10px] text-slate-500 italic mt-1 uppercase tracking-tight">Fonte: Servizio Geologico PAT</p>
          </div>
          <button 
            onClick={() => setIsLegendOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-white">
          <GeologyLegend />
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 leading-normal">
          Passa il mouse sulla mappa per identificare le aree geologiche.
        </div>
      </div>
    </div>
  );
};

export default CaveMap;
