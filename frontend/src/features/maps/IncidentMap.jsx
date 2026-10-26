import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, AlertTriangle, Layers, Navigation } from 'lucide-react';

export const IncidentMap = ({
  incidents = [],
  shelters = [],
  services = [],
  center = [78.4867, 17.3850], // Default: Hyderabad, India [lng, lat]
  zoom = 11,
  className = 'h-[500px]',
  onSelectIncident = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webGlError, setWebGlError] = useState(false);

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
        center: center,
        zoom: zoom,
        attributionControl: true,
      });

      // Navigation & Fullscreen controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.on('load', () => {
        mapRef.current = map;
        setMapLoaded(true);
      });

      map.on('error', (e) => {
        console.warn('MapLibre error:', e);
      });

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('MapLibre GL failed to initialize (WebGL unavailable):', err);
      setWebGlError(true);
    }
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove existing markers if any
    const existingMarkers = document.querySelectorAll('.dr360-map-marker');
    existingMarkers.forEach((el) => el.remove());

    // Color definitions for severity
    const severityColors = {
      critical: '#EF4444',
      high: '#F59E0B',
      medium: '#8B5CF6',
      low: '#22D3EE',
    };

    // Add Incident Markers
    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const el = document.createElement('div');
      el.className = 'dr360-map-marker cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group';

      const color = severityColors[inc.severity] || '#8B5CF6';
      el.innerHTML = `
        <div style="background-color: ${color}; box-shadow: 0 0 12px ${color}80;" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs hover:scale-125 transition-transform">
          !
        </div>
      `;

      const popupHtml = `
        <div style="color: #09090F; padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px;">${inc.title || 'Incident Report'}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">Ref: ${inc.reference_number || 'N/A'}</div>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: ${color}20; color: ${color}; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; text-transform: uppercase;">
              ${inc.severity || 'Medium'}
            </span>
            <span style="background: #E2E8F0; color: #1E293B; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; text-transform: uppercase;">
              ${inc.category || 'General'}
            </span>
          </div>
          <div style="font-size: 11px; line-height: 1.4;">${(inc.description || '').substring(0, 90)}...</div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([parseFloat(inc.longitude), parseFloat(inc.latitude)])
        .setPopup(popup)
        .addTo(map);

      if (onSelectIncident) {
        el.addEventListener('click', () => onSelectIncident(inc));
      }
    });

    // Add Shelter Markers (Green Pins)
    shelters.forEach((shelter) => {
      if (!shelter.latitude || !shelter.longitude) return;

      const el = document.createElement('div');
      el.className = 'dr360-map-marker cursor-pointer transform -translate-x-1/2 -translate-y-1/2';
      el.innerHTML = `
        <div style="background-color: #10B981; box-shadow: 0 0 10px rgba(16,185,129,0.5);" class="w-6 h-6 rounded-full border border-white flex items-center justify-center text-white text-[10px] font-bold">
          S
        </div>
      `;

      const popupHtml = `
        <div style="color: #09090F; padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 800; font-size: 13px;">${shelter.name}</div>
          <div style="font-size: 11px; color: #10B981; font-weight: 600;">Shelter: ${shelter.status || 'Open'}</div>
          <div style="font-size: 11px; color: #475569;">Capacity: ${shelter.current_occupancy || 0} / ${shelter.total_capacity || 'N/A'}</div>
        </div>
      `;

      new maplibregl.Marker({ element: el })
        .setLngLat([parseFloat(shelter.longitude), parseFloat(shelter.latitude)])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(popupHtml))
        .addTo(map);
    });
  }, [incidents, shelters, mapLoaded]);

  if (webGlError) {
    return (
      <div className={`w-full ${className} flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-6 text-center`}>
        <AlertTriangle className="w-10 h-10 text-warning mb-2" />
        <h4 className="font-bold text-text-primary text-base">Interactive Map Unavailable</h4>
        <p className="text-sm text-text-secondary max-w-sm mt-1">
          Hardware WebGL acceleration is not active. Showing list view of incidents below.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className} relative rounded-xl overflow-hidden border border-border shadow-inner bg-surface`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass px-3 py-2 rounded-lg text-xs flex items-center gap-3 border border-border/80">
        <span className="font-semibold text-text-primary">Legend:</span>
        <span className="flex items-center gap-1 text-danger font-medium"><span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> Critical</span>
        <span className="flex items-center gap-1 text-warning font-medium"><span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" /> High</span>
        <span className="flex items-center gap-1 text-primary-light font-medium"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Medium</span>
        <span className="flex items-center gap-1 text-success font-medium"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Shelter</span>
      </div>
    </div>
  );
};
