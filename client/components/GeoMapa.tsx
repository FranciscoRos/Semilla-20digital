import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';


const COLORES_USO: any = {
  agricultura: { border: "#16a34a", fill: "#86efac", icon: "🌾" },
  ganaderia: { border: "#dc2626", fill: "#fca5a5", icon: "🐄" },
  pesca: { border: "#0284c7", fill: "#7dd3fc", icon: "🐟" }
};

const  GeoMapa = ({ 
  apiKey, 
  parcelas = [], 
  centrosAcopio = [], 
  sedesGobierno = [],
  activeLayers = [], 
  onItemClick 
}: any) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const googleMapRef = useRef<google.maps.Map>(null);
  // @ts-ignore
  const infoWindowRef = useRef<google.maps.InfoWindow>(null);
  const overlaysRef = useRef<any>({
    parcelas: [],
    centros: [],
    sedes: []
  });

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!apiKey) return;

    const initMap = () => {
      // @ts-ignore
      if (!mapRef.current || googleMapRef.current || !window.google) return;

      // @ts-ignore
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 21.1619, lng: -89.0 }, // Centrado aprox en la península
        zoom: 8,
        // @ts-ignore
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControlOptions: {
            // @ts-ignore
            position: window.google.maps.ControlPosition.TOP_RIGHT,
        }
      });

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

  // 2. Actualización de Capas
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
      parcelas.forEach((parcela: any) => {
        const tipoUso = parcela.uso?.area || 'agricultura';
        const estilo = COLORES_USO[tipoUso] || COLORES_USO.agricultura;
        
        // @ts-ignore
        const polygon = new window.google.maps.Polygon({
          paths: parcela.coordenadas,
          strokeColor: estilo.border,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: estilo.fill,
          fillOpacity: 0.5,
          map: map,
          clickable: true
        });

        // @ts-ignore
        const polyBounds = new window.google.maps.LatLngBounds();
        parcela.coordenadas.forEach((c: any) => polyBounds.extend(c));
        const center = polyBounds.getCenter();
        bounds.union(polyBounds);
        hasData = true;

        // @ts-ignore
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          label: {
            text: estilo.icon,
            fontSize: "18px",
          },
          icon: {
            // @ts-ignore
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: estilo.border,
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          zIndex: 100
        });

        const actividadesHtml = parcela.uso?.actividadesLabels?.length 
          ? `<ul style="font-size: 12px; padding-left: 16px; margin-top: 2px;">
               ${parcela.uso.actividadesLabels.map((act: string) => `<li>${act}</li>`).join('')}
             </ul>`
          : '<span style="font-size: 12px; color: #666;">No registradas</span>';

        const tituloParcela = parcela.nombre || `Parcela en ${parcela.municipio}`;

        const contentString = `
          <div style="padding: 8px; min-width: 200px; font-family: sans-serif;">
            <h3 style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">${estilo.icon} ${tituloParcela}</h3>
            <p style="font-size: 13px; margin-bottom: 4px;"><strong>Municipio:</strong> ${parcela.municipio}</p>
            <p style="font-size: 13px;"><strong>Uso:</strong> ${parcela.uso?.areaLabel || tipoUso}</p>
            <div style="margin-top: 6px;">
               <strong>Actividades:</strong>
               ${actividadesHtml}
            </div>
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

    // Función para renderizar puntos
    const renderUbicaciones = (ubicaciones: any[], layerName: string, color: string, iconChar: string) => {
        clearLayerGroup(layerName);
        
        if (!activeLayers.includes(layerName === 'centros' ? 'centros_acopio' : layerName === 'mercados' ? 'mercado_local' : 'sedes_gobierno')) return;
        if (!ubicaciones || ubicaciones.length === 0) return;

        ubicaciones.forEach(ubicacion => {
            const pos = ubicacion.coordenadas; 
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
                    labelOrigin: new window.google.maps.Point(12, 9)
                },
                label: {
                    text: iconChar,
                    fontSize: "14px"
                }
            });

            const extraInfo = [];
            if(ubicacion.horario) extraInfo.push(`<p><strong>Horario:</strong> ${ubicacion.horario}</p>`);
            if(ubicacion.productos) extraInfo.push(`<p><strong>Productos:</strong> ${ubicacion.productos.join(', ')}</p>`);

            const contentString = `
                <div style="padding: 5px; font-family: sans-serif; min-width: 200px;">
                    <h3 style="font-weight: bold; font-size: 14px; color: ${color};">${iconChar} ${ubicacion.nombre}</h3>
                    <div style="font-size: 11px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px; text-transform: uppercase; font-weight: bold; color: #555;">
                        ${ubicacion.tipo || (layerName === 'centros' ? 'Centro Acopio' : 'Sede Gob')}
                    </div>
                    <p style="font-size: 12px; color: #444; margin-bottom: 6px;">${ubicacion.descripcion}</p>
                    ${ubicacion.telefono ? `<p style="font-size: 12px;">📞 <a href="tel:${ubicacion.telefono}">${ubicacion.telefono}</a></p>` : ''}
                    <div style="font-size: 12px; margin-top: 4px; color: #555;">
                        ${extraInfo.join('')}
                    </div>
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

    // Renderizar Centros
    renderUbicaciones(centrosAcopio, 'centros', '#ea580c', '🏪');
    // Renderizar Mercados como si fueran centros pero con otro icono/color si se desea, o mismo grupo
    // Aquí usaremos un grupo 'mercados' si está en activeLayers
    const mercados = centrosAcopio.filter((c: any) => c.tipo === 'mercado_local');
    const centrosPuros = centrosAcopio.filter((c: any) => c.tipo !== 'mercado_local');
    
    // Re-renderizar separando lógica si queremos control fino, o usar la lógica anterior
    // Para simplificar con el prop 'centrosAcopio' que recibimos ya filtrado:
    renderUbicaciones(centrosAcopio.filter((c:any) => c.tipo === 'mercado_local'), 'mercados', '#2563eb', '🛒');
    renderUbicaciones(centrosAcopio.filter((c:any) => c.tipo !== 'mercado_local'), 'centros', '#ea580c', '🏪');

    renderUbicaciones(sedesGobierno, 'sedes', '#7c3aed', '🏛️');

    if (hasData) {
      map.fitBounds(bounds, {
          top: 50, bottom: 50, left: 50, right: 50
      });
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
      {!apiKey ? (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-200 z-10">
           <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
           <p className="font-semibold">Falta la API Key</p>
           <p className="text-xs mt-1">Ingresa tu clave en el código</p>
         </div>
      ) : (
         <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default  GeoMapa;
