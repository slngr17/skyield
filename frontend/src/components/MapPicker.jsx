import { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

  const handleLocationSelect = useCallback(
    (loc) => {
      setPosition([loc.lat, loc.lng]);
      onLocationSelect(loc);
    },
    [onLocationSelect]
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        style={{ height: '400px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
      </MapContainer>

      {position && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-black/70 backdrop-blur-sm text-sm px-3 py-1.5 rounded-lg text-emerald-300 font-mono">
          {position[0].toFixed(4)}°, {position[1].toFixed(4)}°
        </div>
      )}

      {!position && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-sm text-gray-300">
            Click anywhere on the map to drop a pin
          </div>
        </div>
      )}
    </div>
  );
}
