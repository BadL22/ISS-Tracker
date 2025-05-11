import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const bounds = [
  [-85, -180],
  [85, 180]
];

const LockBounds = () => {
  const map = useMapEvents({
    zoomend: () => {
      map.setMaxBounds(bounds);
    },
    moveend: () => {
      map.setMaxBounds(bounds);
    },
  });
  return null;
};

const ISSTracker = () => {
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [positionHistory, setPositionHistory] = useState([]);
  const mapRef = useRef();

  const fetchISS = async () => {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const data = await res.json();
      const newPos = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
      setPosition(newPos);
      setPositionHistory((history) => [...history.slice(-50), newPos]);

    } catch (error) {
      console.error('Failed to fetch ISS location:', error);
    }
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  const issIcon = new L.Icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [40, 40],
  });

  return (
    <section className="py-20 px-4 text-center bg-white text-black min-h-screen relative">
      <h2 className="text-4xl font-bold mb-6">🛰️ ISS Tracker</h2>

      {position.latitude && position.longitude ? (
        <>
          <div className="text-lg mb-4">
            <p>Latitude: {position.latitude.toFixed(4)}</p>
            <p>Longitude: {position.longitude.toFixed(4)}</p>
          </div>

          <div
            className="w-full max-w-4xl mx-auto rounded overflow-hidden relative"
            style={{ height: '500px' }}
          >
            <MapContainer
              center={[position.latitude, position.longitude]}
              zoom={3}
              minZoom={2}
              maxZoom={8}
              scrollWheelZoom={true}
              zoomControl={true}
              style={{ height: '150%', width: '100%' }}
              maxBounds={bounds}
              maxBoundsViscosity={1.0}
              worldCopyJump={false}
              noWrap={true}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
                mapInstance.setMaxBounds(bounds);
              }}
            >
              <LockBounds />
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.latitude, position.longitude]} icon={issIcon}>
                <Popup>ISS is here 🛰️</Popup>
              </Marker>
              <Polyline
                positions={positionHistory.map((pos) => [pos.latitude, pos.longitude])}
                pathOptions={{ color: 'blue', weight: 2 }}
              />
            </MapContainer>
          </div>
        </>
      ) : (
        <p>Loading ISS position...</p>
      )}
    </section>
  );
};

export default ISSTracker;
