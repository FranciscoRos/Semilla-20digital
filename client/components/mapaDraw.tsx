import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Maximize,
  Search,
  PenTool,
  Navigation,
  AlertCircle
} from "lucide-react";

// --- TIPOS ---
declare global {
  interface Window {
    google: any;
  }
}

interface MapaDibujoProps {
  onPolygonChange: (data: { coordinates: { lat: number; lng: number }[]; area: string }) => void;
  initialPolygon: { lat: number; lng: number }[];
  typeRegistro?: boolean;
  apiKey: string;
}

const MapaDibujo: React.FC<MapaDibujoProps> = ({
  onPolygonChange,
  initialPolygon,
  typeRegistro = false,
  apiKey
}) => {
  // Referencias DOM
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Referencias Google Maps
  const googleMapRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  // Estados
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentArea, setCurrentArea] = useState<string>("0.00");
  const [hasPolygon, setHasPolygon] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // 1. CARGA DEL SCRIPT (Incluyendo 'places')
  useEffect(() => {
    if (!apiKey) return;
    
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    // IMPORTANTE: libraries=places es necesario para el buscador
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => setMapError("Error al cargar Google Maps API.");
    document.head.appendChild(script);
  }, [apiKey]);

  // 2. INICIALIZAR SOLO EL MAPA
  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };
      const center = initialPolygon.length > 0 ? initialPolygon[0] : defaultCenter;

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 16,
        mapTypeId: window.google.maps.MapTypeId.HYBRID,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Marcamos el mapa como listo -> Esto provocará que el Input se renderice
      setMapReady(true);

      // Si hay polígono inicial
      if (initialPolygon.length > 0) {
        drawExistingPolygon(initialPolygon);
        setHasPolygon(true);
        calculateAreaFromPath(initialPolygon);
      } else if (!typeRegistro) {
        initDrawingManager();
        locateUser(); 
      }

    } catch (error) {
      console.error(error);
      setMapError("Error al inicializar el mapa.");
    }
  };

  // 3. (CORRECCIÓN) INICIALIZAR BUSCADOR CUANDO EL INPUT YA EXISTE
  useEffect(() => {
    // Solo ejecutamos esto si el mapa está listo, el input existe y NO estamos en modo lectura
    if (mapReady && searchInputRef.current && window.google && !typeRegistro) {
        
        // Evitar doble inicialización
        if(autocompleteRef.current) return;

        try {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
            autocomplete.bindTo("bounds", googleMapRef.current);
            
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                
                if (!place.geometry || !place.geometry.location) {
                    // El usuario escribió algo pero no seleccionó de la lista
                    return;
                }

                if (place.geometry.viewport) {
                    googleMapRef.current.fitBounds(place.geometry.viewport);
                } else {
                    googleMapRef.current.setCenter(place.geometry.location);
                    googleMapRef.current.setZoom(17);
                }
            });

            autocompleteRef.current = autocomplete;
        } catch (e) {
            console.error("Error iniciando Autocomplete:", e);
        }
    }
  }, [mapReady, typeRegistro]); 

  // 4. HELPERS DE DIBUJO
  const initDrawingManager = () => {
    const manager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        editable: true,
        draggable: false,
        strokeColor: "#facc15",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#fef08a",
        fillOpacity: 0.35,
      },
    });

    manager.setMap(googleMapRef.current);
    drawingManagerRef.current = manager;

    window.google.maps.event.addListener(manager, "polygoncomplete", (poly: any) => {
      if (polygonRef.current) polygonRef.current.setMap(null);
      polygonRef.current = poly;
      manager.setDrawingMode(null);
      setIsDrawingMode(false);
      setHasPolygon(true);
      processPolygon(poly);

      const path = poly.getPath();
      window.google.maps.event.addListener(path, "set_at", () => processPolygon(poly));
      window.google.maps.event.addListener(path, "insert_at", () => processPolygon(poly));
    });
  };

  const drawExistingPolygon = (coords: any[]) => {
    const poly = new window.google.maps.Polygon({
      paths: coords,
      strokeColor: typeRegistro ? "#22c55e" : "#facc15",
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: typeRegistro ? "#86efac" : "#fef08a",
      fillOpacity: 0.4,
      editable: !typeRegistro,
      map: googleMapRef.current
    });

    polygonRef.current = poly;

    const bounds = new window.google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend(c));
    googleMapRef.current.fitBounds(bounds);

    if (!typeRegistro) {
      const path = poly.getPath();
      window.google.maps.event.addListener(path, "set_at", () => processPolygon(poly));
      window.google.maps.event.addListener(path, "insert_at", () => processPolygon(poly));
    }
  };

  const processPolygon = (poly: any) => {
    const path = poly.getPath();
    const coordinates = [];
    for (let i = 0; i < path.getLength(); i++) {
      coordinates.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
    }
    const areaSqMeters = window.google.maps.geometry.spherical.computeArea(path);
    const areaHectares = (areaSqMeters / 10000).toFixed(2);
    
    setCurrentArea(areaHectares);
    onPolygonChange({ coordinates, area: areaHectares });
  };
  
  const calculateAreaFromPath = (coords: any[]) => {
      if(!window.google) return;
      const path = coords.map(c => new window.google.maps.LatLng(c.lat, c.lng));
      const areaSqMeters = window.google.maps.geometry.spherical.computeArea(path);
      setCurrentArea((areaSqMeters / 10000).toFixed(2));
  }

  // 5. HANDLERS DE UI
  const handleStartDrawing = () => {
    if (!drawingManagerRef.current) return;
    drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    setIsDrawingMode(true);
  };

  const handleDeletePolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setHasPolygon(false);
    setIsDrawingMode(false);
    setCurrentArea("0.00");
    onPolygonChange({ coordinates: [], area: "0" });
    if(drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null);
    }
  };

  const locateUser = () => {
    if (navigator.geolocation && googleMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          googleMapRef.current.setCenter(pos);
          googleMapRef.current.setZoom(17);
          new window.google.maps.Marker({
              position: pos,
              map: googleMapRef.current,
              title: "Tú",
              icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "white",
              }
          });
        },
        () => console.warn("Ubicación no permitida")
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-slate-100 group">
        
        {(!apiKey || mapError) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
             <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
             <p>{mapError || "Falta API Key"}</p>
          </div>
        )}

        {/* INPUT DEL BUSCADOR - Solo se renderiza si mapReady es true */}
        {!typeRegistro && mapReady && (
            <div className="absolute top-4 left-4 right-16 z-10 max-w-sm">
                <div className="relative shadow-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    {/* El ref searchInputRef se conecta aquí */}
                    <input
                        ref={searchInputRef} 
                        type="text"
                        placeholder="Buscar ejido, localidad o coordenadas..."
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        )}

        {/* INFO AREA */}
        {mapReady && (
             <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-100 flex flex-col items-end min-w-[120px]">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Superficie</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{currentArea}</span>
                    <span className="text-sm text-gray-600 font-medium">Ha</span>
                </div>
                {typeRegistro && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1">Solo Lectura</span>}
             </div>
        )}

        {/* MAPA */}
        <div ref={mapRef} className="w-full h-full" />

        {/* CONTROLES */}
        {!typeRegistro && mapReady && (
             <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur rounded-full p-2 shadow-xl border border-gray-200">
                <button
                    onClick={locateUser}
                    className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors tooltip"
                    title="Ir a mi ubicación"
                >
                    <Navigation className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-gray-300 mx-1"></div>
                {!hasPolygon && !isDrawingMode && (
                    <button
                        onClick={handleStartDrawing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-md shadow-blue-200"
                    >
                        <PenTool className="w-4 h-4" />
                        Dibujar Parcela
                    </button>
                )}
                {isDrawingMode && (
                    <div className="flex items-center gap-3 px-3">
                        <span className="text-sm text-blue-800 animate-pulse font-medium">
                            • Marque los puntos
                        </span>
                        <button 
                            onClick={() => {
                                if(drawingManagerRef.current) drawingManagerRef.current.setDrawingMode(null);
                                setIsDrawingMode(false);
                            }}
                            className="text-xs text-gray-500 hover:text-red-500 underline"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
                {hasPolygon && (
                    <button
                        onClick={handleDeletePolygon}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-full font-medium transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        Borrar
                    </button>
                )}
             </div>
        )}
      </div>

      {!typeRegistro && (
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg text-sm text-blue-900 border border-blue-100">
              <div className="mt-0.5"><Maximize className="w-4 h-4 text-blue-500"/></div>
              <div>
                  <p className="font-semibold">¿Cómo usar?</p>
                  <p className="text-blue-700/80 leading-relaxed">
                      Use el buscador para encontrar la zona. Presione <strong>"Dibujar Parcela"</strong>, marque las esquinas del terreno y cierre el polígono haciendo clic en el punto inicial.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

export default MapaDibujo;