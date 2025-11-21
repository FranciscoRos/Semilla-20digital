import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  AlertCircle,
  MapPin,
  Trash2,
  Plus,
  Eye,
  Key,
  Layers,
  Lock,
  Info
} from "lucide-react";

// --- SOLUCIÓN AL ERROR DE TYPESCRIPT ---
// Esto evita el error "Cannot find name 'google'" si no tienes los @types instalados
declare global {
  interface Window {
    google: any;
  }
}

// --- TIPOS DE DATOS ---
interface Parcela {
  id: string | undefined;
  fechaRegistro: string;
  ciudad: string;
  municipio: string;
  localidad: string;
  direccionAdicional: string;
  coordenadas: { lat: number; lng: number }[];
  area: number;
  nombre: string;
  usos: {
    area: string;
    actividadesEspecificas: string[];
  }[];
}

interface MapaDibujoProps {
  onPolygonChange: (data: { coordinates: { lat: number; lng: number }[]; area: string }) => void;
  initialPolygon: { lat: number; lng: number }[];
  typeRegistro?: boolean; // false = modo edición/dibujo, true = modo solo lectura
  apiKey: string;
}

// --- CONSTANTES Y CATÁLOGOS ---
const USOS_PARCELA = {
  agricultura: {
    label: "Agricultura",
    icon: "🌾",
    actividades: [
      { value: "maiz", label: "Siembra de Maíz" },
      { value: "frijol", label: "Siembra de Frijol" },
      { value: "chile", label: "Siembra de Chile" },
      { value: "tomate", label: "Siembra de Tomate" },
      { value: "frutas", label: "Cultivo de Frutas" },
    ],
  },
  ganaderia: {
    label: "Ganadería",
    icon: "🐄",
    actividades: [
      { value: "vacas", label: "Cría de Vacas" },
      { value: "cerdos", label: "Cría de Cerdos" },
      { value: "pollos", label: "Cría de Pollos" },
    ],
  },
  pesca: {
    label: "Pesca/Acuacultura",
    icon: "🐟",
    actividades: [
      { value: "mojarra", label: "Cría de Mojarra" },
      { value: "tilapia", label: "Cría de Tilapia" },
      { value: "camaron", label: "Cría de Camarón" },
    ],
  },
};

// ============================================================================
// COMPONENTE MAPA DIBUJO (Google Maps Implementation)
// ============================================================================
const MapaDibujo: React.FC<MapaDibujoProps> = ({
  onPolygonChange,
  initialPolygon,
  typeRegistro = false,
  apiKey
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Usamos 'any' en los refs para evitar conflictos de tipos si @types/google.maps no está instalado
  const googleMapRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  
  const [mapError, setMapError] = useState<string | null>(null);

  // 1. Lógica para procesar el polígono
  const processPolygon = (poly: any) => {
    // Validación extra para asegurar que google existe
    if (!window.google || !window.google.maps) return;

    const path = poly.getPath();
    const coordinates = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    const areaSqMeters = window.google.maps.geometry.spherical.computeArea(path);
    const areaHectares = (areaSqMeters / 10000).toFixed(2);

    onPolygonChange({ coordinates, area: areaHectares });
  };

  // 2. Cargar Script de Google Maps
  useEffect(() => {
    if (!apiKey) return;
    
    // Si ya está cargado globalmente
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Verificar si ya hay un script inyectado para no duplicar
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    script.onerror = () => {
        setMapError("Error al cargar Google Maps. Verifica tu API Key.");
    };
    document.head.appendChild(script);
    
    return () => {
        if(existingScript) existingScript.removeEventListener('load', initMap);
    }
  }, [apiKey]);

  // 3. Inicializar Mapa
  const initMap = () => {
    // DOBLE CHEQUEO: Si window.google no existe, no hacemos nada (evita el crash)
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
        const defaultCenter = { lat: 19.4326, lng: -99.1332 }; 
        const center = initialPolygon.length > 0 ? initialPolygon[0] : defaultCenter;

        // Crear instancia del mapa
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.HYBRID,
        streetViewControl: false,
        mapTypeControl: false,
        });

        // 4. Geolocalización
        if (!typeRegistro && initialPolygon.length === 0 && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            googleMapRef.current?.setCenter(pos);
            
            new window.google.maps.Marker({
                position: pos,
                map: googleMapRef.current,
                title: "Estás aquí",
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }
            });
            },
            (error) => {
            console.warn("Geolocalización falló o permiso denegado:", error);
            }
        );
        }

        // 5. Modo Solo Lectura (Visualizar Polígono)
        if (typeRegistro && initialPolygon.length > 0) {
        const poly = new window.google.maps.Polygon({
            paths: initialPolygon,
            strokeColor: "#16a34a",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: "#86efac",
            fillOpacity: 0.4,
            map: googleMapRef.current,
        });
        
        const bounds = new window.google.maps.LatLngBounds();
        initialPolygon.forEach(coord => bounds.extend(coord));
        googleMapRef.current.fitBounds(bounds);
        return;
        }

        // 6. Modo Edición/Dibujo
        if (!typeRegistro) {
        const drawingManager = new window.google.maps.drawing.DrawingManager({
            drawingMode: initialPolygon.length > 0 ? null : window.google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
            editable: true,
            draggable: false,
            strokeColor: "#16a34a",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#86efac",
            fillOpacity: 0.4,
            },
        });

        drawingManager.setMap(googleMapRef.current);
        drawingManagerRef.current = drawingManager;

        // Evento: Polígono Creado
        window.google.maps.event.addListener(drawingManager, "polygoncomplete", (poly: any) => {
            if (polygonRef.current) {
            polygonRef.current.setMap(null);
            }
            polygonRef.current = poly;
            drawingManager.setDrawingMode(null);
            processPolygon(poly);

            // Listeners para edición
            window.google.maps.event.addListener(poly.getPath(), "set_at", () => processPolygon(poly));
            window.google.maps.event.addListener(poly.getPath(), "insert_at", () => processPolygon(poly));
        });

        // Si ya hay polígono inicial (Modo Edición de registro existente)
        if (initialPolygon.length > 0) {
            const existingPoly = new window.google.maps.Polygon({
            paths: initialPolygon,
            editable: true,
            draggable: false,
            strokeColor: "#16a34a",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#86efac",
            fillOpacity: 0.4,
            map: googleMapRef.current,
            });
            polygonRef.current = existingPoly;
            
            const bounds = new window.google.maps.LatLngBounds();
            initialPolygon.forEach(coord => bounds.extend(coord));
            googleMapRef.current.fitBounds(bounds);

            window.google.maps.event.addListener(existingPoly.getPath(), "set_at", () => processPolygon(existingPoly));
            window.google.maps.event.addListener(existingPoly.getPath(), "insert_at", () => processPolygon(existingPoly));
            
            drawingManager.setDrawingMode(null);
        }
        }
    } catch (error) {
        console.error("Error inicializando mapa:", error);
        setMapError("Error interno al inicializar el mapa.");
    }
  };

  // Efecto para limpiar/resetear si cambian las props drásticamente
  useEffect(() => {
      if (googleMapRef.current && !typeRegistro && initialPolygon.length === 0 && polygonRef.current) {
          polygonRef.current.setMap(null);
          polygonRef.current = null;
          if (drawingManagerRef.current && window.google) {
              drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
          }
      }
  }, [initialPolygon]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 relative border-2 border-gray-300 shadow-sm">
        {!apiKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100 text-gray-500 p-4 text-center">
            <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
            <p className="font-semibold text-gray-700">Mapa no disponible</p>
            <p className="text-sm text-gray-500">Falta la Google Maps API Key</p>
          </div>
        ) : mapError ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-50 text-red-600 p-4 text-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="font-semibold">{mapError}</p>
          </div> 
        ) : (
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        )}
      </div>
      
      {!typeRegistro && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4"/> Instrucciones:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Haz clic en el mapa para agregar puntos y delimitar tu parcela.</li>
                <li>Para cerrar el polígono, haz clic de nuevo en el primer punto.</li>
                <li><strong>Solo puedes dibujar UN polígono a la vez</strong>.</li>
                <li>Arrastra los puntos blancos intermedios para editar la forma.</li>
                <li className="pt-2 list-none">
                    <button 
                        onClick={() => {
                            if(polygonRef.current) {
                                polygonRef.current.setMap(null);
                                polygonRef.current = null;
                                onPolygonChange({ coordinates: [], area: "0" });
                                if(drawingManagerRef.current && window.google) {
                                    drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
                                }
                            }
                        }}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 border border-red-200 font-semibold flex items-center gap-1 w-fit"
                    >
                        <Trash2 className="w-3 h-3"/> Borrar Polígono y Reiniciar
                    </button>
                </li>
            </ul>
        </div>
      )}
    </div>
  );
};


export default MapaDibujo;