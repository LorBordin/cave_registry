import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { fetchCaveGeoJson } from '../api/caves';

// Fix for Leaflet default icon issues with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const CaveMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize base layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    });

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
    L.control.layers(baseMaps, {}, { position: 'topright' }).addTo(map);

    const clusterGroup = L.markerClusterGroup();
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

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
                  <a href="/caves/${registry_id}" class="text-teal-600 hover:text-teal-700 font-semibold text-xs transition-colors">Dettagli →</a>
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
      map.remove();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

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
  );
};

export default CaveMap;
