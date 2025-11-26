import React, { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { IParcela } from '@/services/api';

// Normalizamos las claves
const COLORES_USO: any = {
  agricultura: "🌾",
  ganaderia: "🐄",
  pesca: "🐟",
  apicultura: "🐝",
  default: "📍"
};

interface GeoMapaProps {
  apiKey: string
  parcelas?: IParcela[]
  centrosAcopio?: any[]
  sedesGobierno?: any[]
  activeLayers?: string[]
  onItemClick?: (item: any) => void
}

// 🛡️ HELPER DE SEGURIDAD: Valida que la coordenada sea un número real
const isValidCoord = (c: any) => {
  if (!c) return false;
  const lat = Number(c.latitud);
  const lng = Number(c.longitud);
  return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
};

const GeoMapa = ({
  apiKey,
  parcelas = [],
  centrosAcopio = [],
  sedesGobierno = [],
  activeLayers = [],
  onItemClick
}: GeoMapaProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const googleMapRef = useRef<google.maps.Map>(null);
  // @ts-ignore
  const infoWindowRef = useRef<google.maps.InfoWindow>(null);
  
  const overlaysRef = useRef<any>({
    parcelas: [],
    centros: [],      
    mercados: [],     
    sede_gobierno: [] 
  });

  useEffect(() => {
    if (!apiKey) return;

    const initMap = () => {
      // @ts-ignore
      if (!mapRef.current || googleMapRef.current || !window.google) return;

      // @ts-ignore
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.5, lng: -88.0 },
        zoom: 7,
        // @ts-ignore
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControlOptions: {
            // @ts-ignore
            position: window.google.maps.ControlPosition.TOP_RIGHT,
        }
      });

      // Geolocalización del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                googleMapRef.current?.setCenter(pos);
                
                // @ts-ignore
                new window.google.maps.Marker({
                    position: pos,
                    map: googleMapRef.current,
                    title: "Estás aquí",
                    // Icono de punto azul estándar
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "white",
                        strokeWeight: 2,
                    }
                });
            },
            (error) => console.warn("Geo error:", error)
        );
      }

      // @ts-ignore
      infoWindowRef.current = new window.google.maps.InfoWindow();
      
      updateMapLayers();
    };

    // @ts-ignore
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // Actualización de Capas
  useEffect(() => {
    if (googleMapRef.current) {
      updateMapLayers();
    }
  }, [parcelas, centrosAcopio, sedesGobierno, activeLayers]);

  const updateMapLayers = () => {
    const map = googleMapRef.current;
    // @ts-ignore
    if (!map || !window.google) return;

    // @ts-ignore
    const bounds = new window.google.maps.LatLngBounds();
    let hasData = false;

    const clearLayerGroup = (groupName: string) => {
      if (overlaysRef.current[groupName]) {
        overlaysRef.current[groupName].forEach((obj: any) => obj.setMap(null));
      }
      overlaysRef.current[groupName] = [];
    };

    // ==================== PARCELAS ====================
    clearLayerGroup('parcelas');
    
    if (activeLayers.includes('parcelas') && parcelas.length > 0) {
      parcelas.forEach((parcela: IParcela) => {
        // Validación: Si no hay coordenadas o el array está vacío, saltamos
        if (!parcela.coordenadas || parcela.coordenadas.length === 0) return;

        const tipoUso = parcela.usos?.flatMap(pau => pau.area).join(',') || 'agricultura'; 

        let emoji = COLORES_USO.default;
        if(parcela.usos && parcela.usos.length > 0) {
            const usoEncontrado = parcela.usos.find(u => 
                Object.keys(COLORES_USO).some(k => u.area.toLowerCase().includes(k))
            );
            if(usoEncontrado) {
                const key = Object.keys(COLORES_USO).find(k => usoEncontrado.area.toLowerCase().includes(k));
                if(key) emoji = COLORES_USO[key];
            }
        }
        
        // @ts-ignore
        const polygon = new window.google.maps.Polygon({
          paths: parcela.coordenadas, 
          strokeColor: '#16a34a',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#86efac',
          fillOpacity: 0.5,
          map: map,
          clickable: true
        });

        // @ts-ignore
        const polyBounds = new window.google.maps.LatLngBounds();
        
        // 🛡️ VALIDACIÓN DENTRO DEL LOOP DE COORDENADAS
        parcela.coordenadas.forEach((c: any) => {
            if (isValidCoord(c)) {
                polyBounds.extend({ lat: Number(c.lat), lng: Number(c.lng) });
            }
        });

        if (polyBounds.isEmpty()) return; // Si el polígono no tiene puntos válidos, no lo pintamos

        const center = polyBounds.getCenter();
        bounds.extend(center);
        hasData = true;

        // @ts-ignore
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          label: {
            text: emoji,
            fontSize: "18px",
          },
          icon: {
            // @ts-ignore
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: '#16a34a',
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          zIndex: 100
        });

        const contentString = `
          <div style="padding: 8px; min-width: 200px; font-family: sans-serif;">
            <h3 style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">${emoji} ${parcela.nombre}</h3>
            <p style="font-size: 13px; margin-bottom: 4px;"><strong>Municipio:</strong> ${parcela.municipio}</p>
            <p style="font-size: 12px; color: #666;">${tipoUso}</p>
          </div>
        `;

        const handleClick = () => {
            // @ts-ignore
            infoWindowRef.current.close();
            // @ts-ignore
            infoWindowRef.current.setContent(contentString);
            // @ts-ignore
            infoWindowRef.current.setPosition(center);
            // @ts-ignore
            infoWindowRef.current.open(map);
            if (onItemClick) onItemClick(parcela);
        };

        polygon.addListener("click", handleClick);
        marker.addListener("click", handleClick);

        overlaysRef.current.parcelas.push(polygon, marker);
      });
    }

    // Función genérica para puntos (Mercados, Biofábricas, Gobierno)
    const renderUbicaciones = (ubicaciones: any[], layerName: string, color: string, iconChar: string) => {
        clearLayerGroup(layerName);
        
        const layerMap: Record<string, string> = {
            'centros': 'centro_acopio',
            'mercados': 'mercado_local',
            'sede_gobierno': 'sede_gobierno'
        };
        if (!activeLayers.includes(layerMap[layerName])) return;
        if (!ubicaciones || ubicaciones.length === 0) return;

        ubicaciones.forEach(ubicacion => {
            const rawPos = ubicacion.coordenadas;
            // 🛡️ VALIDACIÓN CRÍTICA ANTES DE CREAR MARCADOR
            if (!isValidCoord(rawPos)) return;
            const pos = { lat: Number(rawPos.latitud), lng: Number(rawPos.longitud) };
            
            bounds.extend(pos);
            hasData = true;

            // @ts-ignore
            const marker = new window.google.maps.Marker({
                position: pos,
                map: map,
                title: ubicacion.nombre,
                icon: {
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", 
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                    scale: 2, 
                    // @ts-ignore
                    anchor: new google.maps.Point(12, 22),
                    // @ts-ignore
                    labelOrigin: new google.maps.Point(12, 9)
                },
                label: {
                    text: iconChar,
                    fontSize: "14px"
                }
            });

            // ✅ CORRECCIÓN DE URL GOOGLE MAPS
            const nombreEncoded = encodeURIComponent(ubicacion.nombre);
            // Esta URL abre Google Maps buscando la coordenada y poniendo el nombre
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}`;

            const contentString = `
                <div style="padding: 5px; font-family: sans-serif; min-width: 200px;">
                    <h3 style="font-weight: bold; font-size: 14px; color: ${color};">
                        <a href="${googleMapsUrl}" target="_blank" style="text-decoration: none; cursor: pointer; color: inherit;">
                            ${iconChar} ${ubicacion.nombre} <span style="font-size:10px">↗</span>
                        </a>
                    </h3>
                    <p style="font-size: 12px; color: #444; margin-bottom: 6px;">${ubicacion.descripcion || ''}</p>
                    ${ubicacion.direccion ? `<p style="font-size: 12px;">📍 ${ubicacion.direccion}</p>` : ''}
                    ${ubicacion.telefono ? `<p style="font-size: 12px;">📞 ${ubicacion.telefono}</p>` : ''}
                </div>
            `;

            marker.addListener("click", () => {
                // @ts-ignore
                infoWindowRef.current.close();
                // @ts-ignore
                infoWindowRef.current.setContent(contentString);
                // @ts-ignore
                infoWindowRef.current.open(map, marker);
                if (onItemClick) onItemClick(ubicacion);
            });

            overlaysRef.current[layerName].push(marker);
        });
    };

    const mercados = centrosAcopio.filter((c:any) => c.tipo === 'mercado_local');
    renderUbicaciones(mercados, 'mercados', '#eab308', '🍯');

    const biofabricas = centrosAcopio.filter((c:any) => c.tipo !== 'mercado_local');
    renderUbicaciones(biofabricas, 'centros', '#ea580c', '🏭');

    renderUbicaciones(sedesGobierno, 'sede_gobierno', '#7c3aed', '🏛️');

    if (hasData) {
      map.fitBounds(bounds); 
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
      {!apiKey ? (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-200 z-10">
           <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
           <p className="font-semibold">Falta la API Key</p>
         </div>
      ) : (
         <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default GeoMapa;