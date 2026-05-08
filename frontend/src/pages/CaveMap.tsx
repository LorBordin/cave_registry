import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { fetchCaveGeoJson } from '../api/caves';
import { Link } from 'react-router-dom';

// Fix for Leaflet default icon issues with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([46.07, 11.12], 9);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
            const { name, registry_id, elevation } = feature.properties;
            
            const popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-lg text-slate-900">${name}</h3>
                <p class="text-sm text-slate-600">ID: ${registry_id}</p>
                <p class="text-sm text-slate-600">Elevation: ${elevation ?? '—'} m</p>
                <div class="mt-2 pt-2 border-t border-slate-100">
                  <span class="text-slate-400 text-xs italic">Dettagli → (Phase 5)</span>
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
        setError('Failed to load map data.');
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
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      {/* Navbar overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex space-x-2">
        <Link 
          to="/" 
          className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-slate-700 shadow-xl hover:bg-slate-800 transition-all text-sm font-medium"
        >
          ← Home
        </Link>
        <Link 
          to="/caves" 
          className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-slate-700 shadow-xl hover:bg-slate-800 transition-all text-sm font-medium"
        >
          List View
        </Link>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-medium">Loading caves...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="bg-red-900/90 border border-red-500 text-red-100 px-6 py-3 rounded-lg shadow-2xl">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaveMap;
