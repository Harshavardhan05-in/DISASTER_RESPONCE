import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ReportingMap = ({
  latitude,
  longitude,
  onChangeCoordinates,
  className = 'h-[320px]',
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);

  const defaultLng = longitude || 78.4867;
  const defaultLat = latitude || 17.3850;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [defaultLng, defaultLat],
        zoom: 13,
      });

      // Draggable marker
      const marker = new maplibregl.Marker({ draggable: true, color: '#EF4444' })
        .setLngLat([defaultLng, defaultLat])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onChangeCoordinates(Number(lngLat.lat.toFixed(6)), Number(lngLat.lng.toFixed(6)));
      });

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        onChangeCoordinates(Number(e.lngLat.lat.toFixed(6)), Number(e.lngLat.lng.toFixed(6)));
      });

      mapRef.current = map;
      markerRef.current = marker;

      return () => {
        map.remove();
      };
    } catch (e) {
      console.warn('Reporting map failed to load:', e);
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChangeCoordinates(lat, lng);

        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
          markerRef.current.setLngLat([lng, lat]);
        }
      },
      (err) => {
        setLocating(false);
        alert(`Location permission denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
      <div ref={mapContainerRef} className={`w-full ${className}`} />
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleUseCurrentLocation}
          isLoading={locating}
          leftIcon={<Navigation className="w-3.5 h-3.5 text-accent" />}
          className="glass text-xs shadow-md"
        >
          Use GPS Pin
        </Button>
      </div>
      <div className="p-2 bg-surface-2/90 border-t border-border flex items-center justify-between text-xs text-text-secondary px-3">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-primary-light" />
          <span>Click anywhere on the map or drag the red pin to mark the incident location.</span>
        </div>
        <div className="font-mono text-[11px] text-text-primary">
          {latitude ? `${latitude}, ${longitude}` : 'Click map to place pin'}
        </div>
      </div>
    </div>
  );
};
