import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../estilos/MapaUbicacion.css'; 
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const boundsPachacamac = [
  [-12.28, -76.95],
  [-12.05, -76.70] 
];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      onLocationSelect({ 
          lat: parseFloat(lat.toFixed(6)), 
          lng: parseFloat(lng.toFixed(6)) 
      });
    },
  });
  return null;
}

const MapaUbicacion = ({ onCoordsChange }) => {
  const [position, setPosition] = useState(null);

  const handleLocationSelect = (coords) => {
    setPosition(coords);
    onCoordsChange(coords); 
  };

  return (
    <div className="mapa-contenedor">
      <MapContainer 
        center={[-12.1287, -76.8589]} 
        zoom={13} 
        minZoom={12} 
        maxBounds={boundsPachacamac} 
        maxBoundsViscosity={1.0} 
        style={{ height: "300px", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        {position && <Marker position={[position.lat, position.lng]} />}
      </MapContainer>
    </div>
  );
};

export default MapaUbicacion;