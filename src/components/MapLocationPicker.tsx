
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation = { lat: 0, lng: 0 },
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [coordinates, setCoordinates] = useState<string>(`${initialLocation.lat},${initialLocation.lng}`);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 2,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create initial marker
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#2563eb'
      })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng);
          setCoordinates(`${lngLat.lat.toFixed(6)},${lngLat.lng.toFixed(6)}`);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        if (marker.current) {
          marker.current.setLngLat(e.lngLat);
          onLocationSelect(e.lngLat.lat, e.lngLat.lng);
          setCoordinates(`${e.lngLat.lat.toFixed(6)},${e.lngLat.lng.toFixed(6)}`);
        }
      });

      map.current.on('load', () => {
        setIsMapReady(true);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, initialLocation, onLocationSelect]);

  const handleTokenSave = () => {
    localStorage.setItem('mapbox_token', mapboxToken);
    window.location.reload();
  };

  const handleManualCoordsSubmit = () => {
    const coords = coordinates.split(',');
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      
      if (!isNaN(lat) && !isNaN(lng)) {
        onLocationSelect(lat, lng);
        if (marker.current && map.current) {
          marker.current.setLngLat([lng, lat]);
          map.current.setCenter([lng, lat]);
          map.current.setZoom(10);
        }
      }
    }
  };

  if (!mapboxToken) {
    return (
      <div className={`p-6 border-2 border-dashed border-border rounded-lg ${className}`}>
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">Map Configuration Required</h3>
          <p className="text-muted-foreground">
            To use the interactive map, please enter your Mapbox public token.
            Get your token from{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-satellite-blue hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="space-y-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="pk.ey..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={handleTokenSave} className="w-full">
              Save Token
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Project Location</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center gap-2"
        >
          {showManualInput ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          Manual Input
        </Button>
      </div>

      {showManualInput ? (
        <div className="space-y-2">
          <Input
            placeholder="40.7128,-74.0060"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
          />
          <Button 
            type="button" 
            onClick={handleManualCoordsSubmit}
            size="sm"
            variant="outline"
          >
            Update Location
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div 
            ref={mapContainer} 
            className="w-full h-64 rounded-lg border border-border overflow-hidden relative"
          >
            {!isMapReady && mapboxToken && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center space-y-2">
                  <div className="animate-spin h-8 w-8 border-2 border-satellite-blue border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on the map or drag the marker to select project location. Current: {coordinates}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapLocationPicker;
