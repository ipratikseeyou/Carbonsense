
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string>('');

  // Fetch Mapbox token from edge function on component mount
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        setIsLoadingToken(true);
        setTokenError('');
        
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setTokenError('Failed to load map configuration. Please try again.');
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setTokenError('Map configuration not available.');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setTokenError('Failed to load map configuration. Please try again.');
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Smooth marker movement function
  const smoothMoveMarker = (lat: number, lng: number) => {
    if (marker.current && map.current) {
      // Animate marker movement
      marker.current.setLngLat([lng, lat]);
      
      // Smooth camera movement to follow marker
      map.current.easeTo({
        center: [lng, lat],
        duration: 500,
        easing: (t) => t * (2 - t) // ease-out function
      });
      
      // Update coordinates display
      setCoordinates(`${lat.toFixed(6)},${lng.toFixed(6)}`);
      onLocationSelect(lat, lng);
    }
  };

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

      // Handle marker drag with smooth animation
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          // Smooth camera follow during drag
          map.current?.easeTo({
            center: [lngLat.lng, lngLat.lat],
            duration: 300,
            easing: (t) => t * (2 - t)
          });
          setCoordinates(`${lngLat.lat.toFixed(6)},${lngLat.lng.toFixed(6)}`);
          onLocationSelect(lngLat.lat, lngLat.lng);
        }
      });

      // Handle map click with smooth marker movement
      map.current.on('click', (e) => {
        smoothMoveMarker(e.lngLat.lat, e.lngLat.lng);
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

  const handleManualCoordsSubmit = () => {
    const coords = coordinates.split(',');
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Use smooth movement for manual input too
        if (marker.current && map.current) {
          marker.current.setLngLat([lng, lat]);
          map.current.easeTo({
            center: [lng, lat],
            zoom: 10,
            duration: 800,
            easing: (t) => t * (2 - t)
          });
        }
        onLocationSelect(lat, lng);
      }
    }
  };

  // Show loading state
  if (isLoadingToken) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Loading Map...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError || !mapboxToken) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Map Configuration Error
            </CardTitle>
            <CardDescription>
              {tokenError || 'Map configuration is not available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
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
