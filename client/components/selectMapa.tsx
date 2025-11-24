import { useRef, useEffect, useCallback, useState } from "react";
import { AlertCircle, MapPin } from "lucide-react";

// Declaración global para TS
declare global {
  interface Window {
    google: any;
  }
}

interface LocationPickerProps {
  lat: string | number;
  lng: string | number;
  onLocationSelect: (lat: string, lng: string) => void;
}

const LocationPicker = ({ lat, lng, onLocationSelect }: LocationPickerProps) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ||import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Inicializar Mapa
  const initMap = useCallback(() => {
    if (!mapDivRef.current || !window.google) return;

    const defaultCenter = { lat: 18.5001889, lng: -88.296146 }; // Chetumal
    // Usamos las props si existen, sino el default
    const currentCenter = lat && lng 
      ? { lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) }
      : defaultCenter;

    // Solo crear el mapa si no existe
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: currentCenter,
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      // Listener de Click
      mapInstanceRef.current.addListener("click", (e: any) => {
        const newLat = e.latLng.lat().toFixed(6);
        const newLng = e.latLng.lng().toFixed(6);
        
        // AQUÍ COMUNICAMOS AL PADRE
        onLocationSelect(newLat, newLng);
        
        // Actualizamos visualmente el marcador
        updateMarker(parseFloat(newLat), parseFloat(newLng));
      });
    }
  }, []); // Dependencias vacías para evitar reinicializaciones

  // 2. Actualizar Marcador
  const updateMarker = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current || !window.google) return;
    const position = { lat: latitude, lng: longitude };

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    }
    // Opcional: Centrar mapa al mover (descomentar si te gusta ese efecto)
    // mapInstanceRef.current.panTo(position);
  };

  // 3. Efecto: Cargar Script (Vanilla style)
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return () => existingScript.removeEventListener('load', initMap);
      } else {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        script.onerror = () => setMapError("Error API Maps");
        document.head.appendChild(script);
      }
    }
  }, [initMap, API_KEY]);

  // 4. Efecto: Sincronizar si las props cambian desde fuera (inputs manuales del padre)
  useEffect(() => {
    if (lat && lng && mapInstanceRef.current) {
        const numLat = parseFloat(lat.toString());
        const numLng = parseFloat(lng.toString());
        if (!isNaN(numLat) && !isNaN(numLng)) {
            updateMarker(numLat, numLng);
        }
    }
  }, [lat, lng]);

  return (
    <div className="flex flex-col h-full">
      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
        <MapPin className="w-3 h-3" /> Ubicar en el mapa
      </label>
      
      <div className="flex-grow border rounded-lg overflow-hidden bg-gray-100 relative min-h-[300px]">
        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500 z-10">
            <AlertCircle className="w-8 h-8 mb-2"/>
            <span className="text-xs font-bold">{mapError}</span>
          </div>
        )}

        <div ref={mapDivRef} className="w-full h-full" />
        
        {!mapInstanceRef.current && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400">Cargando Mapa...</span>
            </div>
        )}
      </div>
      <p className="text-[10px] text-gray-500 mt-2 text-center">
        Click en el mapa para seleccionar coordenadas.
      </p>
    </div>
  );
};

export default LocationPicker;