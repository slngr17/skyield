import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, Navigation, Layers, Loader2, Sparkles } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Controls map view transitions programmatically
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onLocationSelect({ lat, lng });
        },
      }}
    />
  );
}

export default function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [targetView, setTargetView] = useState(null);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'streets'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleLocationSelect = useCallback(
    (loc) => {
      setPosition([loc.lat, loc.lng]);
      onLocationSelect(loc);
    },
    [onLocationSelect]
  );

  // Address search via Nominatim
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setTargetView({ center: [lat, lon], zoom: 17 });
        handleLocationSelect({ lat, lng: lon });
      } else {
        setSearchError('Location not found. Try a city or address.');
      }
    } catch {
      setSearchError('Search request failed. Please drop a pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // IP-based geolocation fallback
  const ipGeoFallback = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('IP geolocation failed');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setTargetView({ center: [data.latitude, data.longitude], zoom: 14 });
        handleLocationSelect({ lat: data.latitude, lng: data.longitude });
        setSearchError('GPS unavailable — showing approximate location via IP.');
      } else {
        throw new Error('No coordinates');
      }
    } catch {
      setSearchError('Could not determine your location. Try searching for an address instead.');
    } finally {
      setIsSearching(false);
    }
  };

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setTargetView({ center: [latitude, longitude], zoom: 18 });
        handleLocationSelect({ lat: latitude, lng: longitude });
        setIsSearching(false);
      },
      (err) => {
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setSearchError('Location permission denied. Please allow location access in your browser settings.');
            setIsSearching(false);
            break;
          case 2: // POSITION_UNAVAILABLE
            // GPS/hardware failed — try IP-based fallback
            ipGeoFallback();
            break;
          case 3: // TIMEOUT
            setSearchError('Location request timed out. Trying approximate location...');
            ipGeoFallback();
            break;
          default:
            setSearchError('An unknown location error occurred.');
            setIsSearching(false);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Search and Quick Action Toolbar */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, city, or neighborhood..."
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 pl-9 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
          {isSearching && (
            <Loader2 size={15} className="absolute right-3 text-emerald-400 animate-spin" />
          )}
        </form>

        <button
          type="button"
          onClick={handleLocateMe}
          title="Use current GPS location"
          className="bg-white/5 hover:bg-white/15 border border-white/15 px-3 py-2 rounded-xl text-gray-300 hover:text-emerald-400 flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <Navigation size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">My Location</span>
        </button>

        <button
          type="button"
          onClick={() => setMapType(mapType === 'satellite' ? 'streets' : 'satellite')}
          className="bg-white/5 hover:bg-white/15 border border-white/15 px-3 py-2 rounded-xl text-gray-300 hover:text-emerald-400 flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <Layers size={14} className="text-amber-400" />
          <span>{mapType === 'satellite' ? '🛰️ Satellite' : '🗺️ Streets'}</span>
        </button>
      </div>

      {/* Quick Demo Location Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
        <span className="text-gray-500 shrink-0 text-[11px] font-medium flex items-center gap-1">
          <Sparkles size={12} className="text-emerald-400" /> Demo:
        </span>
        {[
          { name: '☀️ Lagos', lat: 6.5244, lng: 3.3792 },
          { name: '🌱 Nairobi', lat: -1.2921, lng: 36.8219 },
          { name: '⚡ Phoenix', lat: 33.4484, lng: -112.0740 },
          { name: '🌧️ London', lat: 51.5074, lng: -0.1278 },
          { name: '🌴 São Paulo', lat: -23.5505, lng: -46.6333 },
        ].map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setTargetView({ center: [preset.lat, preset.lng], zoom: 17 });
              handleLocationSelect({ lat: preset.lat, lng: preset.lng });
              setSearchError('');
            }}
            className="shrink-0 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-300 px-2 py-0.5 rounded-lg transition-all text-[11px]"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {searchError && (
        <p className="text-xs text-red-400 px-1">{searchError}</p>
      )}

      {/* Map Container with GTA-Style Viewport Memory Pruning */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl shadow-black/40">
        <MapContainer
          center={[15, 5]}
          zoom={3}
          style={{ height: '420px', width: '100%' }}
          className="z-0"
        >
          {targetView && (
            <MapController
              targetCenter={targetView.center}
              targetZoom={targetView.zoom}
            />
          )}

          {/* High-Resolution Google Hybrid Satellite Layer with aggressive viewport memory pruning */}
          {mapType === 'satellite' ? (
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxNativeZoom={20}
              maxZoom={21}
              keepBuffer={1}
              updateWhenIdle={true}
              updateWhenZooming={false}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={19}
              maxZoom={20}
              keepBuffer={1}
              updateWhenIdle={true}
              updateWhenZooming={false}
            />
          )}

          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>

        {/* Floating Coordinates & Layer Badge */}
        {position && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-black/80 backdrop-blur-md text-xs px-3 py-1.5 rounded-lg text-emerald-400 font-mono border border-white/10 shadow-lg">
            📍 {position[0].toFixed(4)}°, {position[1].toFixed(4)}°
          </div>
        )}

        {!position && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs sm:text-sm text-gray-200 border border-white/10 shadow-2xl animate-pulse">
              🎯 Search an address or click on any rooftop
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
