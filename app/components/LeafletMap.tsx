'use client';

import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { t } from '../utils/i18n';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markerText?: string;
  logo?: string;
  workingAreaCenter?: [number, number];
  workingAreaRadius?: number;
}

// Component to open popup when map loads
function OpenPopup({ markerRef }: { markerRef: React.RefObject<L.Marker | null> }) {
  const map = useMap();

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [map, markerRef]);

  return null;
}

// Create approximate GeoJSON data for working area circle
function createWorkingAreaGeoJSON(center?: [number, number], radius?: number) {
  if (!center || !radius) return null;

  const [lat, lng] = center;

  // Create a rough circular polygon around the center point
  const coordinates: [number, number][][] = [];
  const points = 64;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const pointLat = lat + radius * Math.cos(angle);
    const pointLng = lng + radius * Math.sin(angle);
    coordinates.push([[pointLng, pointLat]]);
  }

  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {
          name: t('WorkingArea'),
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [coordinates.map(c => c[0])],
        },
      },
    ],
  };
}

// Choropleth component for working area
function WorkingAreaChoropleth({
  workingAreaCenter,
  workingAreaRadius,
}: {
  workingAreaCenter?: [number, number];
  workingAreaRadius?: number;
}) {
  const geojsonData = createWorkingAreaGeoJSON(workingAreaCenter, workingAreaRadius);

  // Style function for the choropleth
  const style = () => ({
    fillColor: '#4CAF50',
    weight: 2,
    opacity: 1,
    color: '#2E7D32',
    dashArray: '3',
    fillOpacity: 0.3,
  });

  // Highlight function on hover
  const highlightFeature = (e: L.LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#1B5E20',
      dashArray: '',
      fillOpacity: 0.5,
    });
    layer.bringToFront();
  };

  // Reset highlight on mouseout
  const resetHighlight = (e: L.LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle(style());
  };

  // Add interaction handlers
  const onEachFeature = (feature: { properties?: { name?: string } }, layer: any) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });

    // Add popup with area name
    if (feature.properties?.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  return geojsonData ? <GeoJSON data={geojsonData} style={style} onEachFeature={onEachFeature} /> : null;
}

export default function LeafletMap({
  center,
  zoom = 13,
  markerText,
  logo,
  workingAreaCenter,
  workingAreaRadius,
}: LeafletMapProps) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    // Ensure Leaflet CSS is loaded
    import('leaflet/dist/leaflet.css');
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <WorkingAreaChoropleth workingAreaCenter={workingAreaCenter} workingAreaRadius={workingAreaRadius} />
      <Marker position={center} ref={markerRef}>
        {markerText && (
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-base text-center">{markerText}</div>
              {logo && (
                <div className="mt-2">
                  <Image src={logo} alt="CMD Breizh Logo" width={80} height={80} className="h-20 mx-auto" />
                </div>
              )}
            </div>
          </Popup>
        )}
      </Marker>
      <OpenPopup markerRef={markerRef} />
    </MapContainer>
  );
}
