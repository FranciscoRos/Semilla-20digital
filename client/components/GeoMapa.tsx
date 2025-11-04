import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';


export default function GeoMapa({ 
  parcelas = [], 
  centrosAcopio = [], 
  sedesGobierno = [],
  activeLayers = [],
  onItemClick
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});

  // Colores por tipo de uso
  const COLORES_USO = {
    agricultura: { border: "#16a34a", fill: "#86efac", icon: "🌾" },
    ganaderia: { border: "#dc2626", fill: "#fca5a5", icon: "🐄" },
    pesca: { border: "#0284c7", fill: "#7dd3fc", icon: "🐟" }
  };

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current).setView([18.51836, -88.30227], 12);
    mapInstanceRef.current = map;

    // Capa base
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Intentar obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup("📍 Tu ubicación")
            .openPopup();
        },
        (err) => console.warn("Error obteniendo ubicación:", err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // Inicializar grupos de capas
    layersRef.current = {
      parcelas: L.featureGroup().addTo(map),
      centros_acopio: L.featureGroup().addTo(map),
      sedes_gobierno: L.featureGroup().addTo(map)
    };

  }, []);

  // Actualizar capas cuando cambien los datos o capas activas
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateMapLayers();
  }, [parcelas, centrosAcopio, sedesGobierno, activeLayers]);

  const updateMapLayers = () => {
    const L = window.L;
    const map = mapInstanceRef.current;
    const layers = layersRef.current;

    // Limpiar todas las capas
    Object.values(layers).forEach(layer => layer.clearLayers());

    // ==================== PARCELAS ====================
    if (activeLayers.includes('parcelas') && parcelas.length > 0) {
      parcelas.forEach(parcela => {
        const color = COLORES_USO[parcela.uso.area];
        const latLngs = parcela.coordenadas.map(c => [c.lat, c.lng]);

        const polygon = L.polygon(latLngs, {
          color: color.border,
          fillColor: color.fill,
          fillOpacity: 0.5,
          weight: 3
        }).addTo(layers.parcelas);

        polygon.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg mb-1">${color.icon} ${parcela.nombre}</h3>
            <p class="text-sm text-gray-600 mb-2">Productor: ${parcela.productor}</p>
            <p class="text-sm"><strong>Área:</strong> ${parcela.area} ha</p>
            <p class="text-sm"><strong>Tipo:</strong> ${parcela.uso.areaLabel}</p>
            <p class="text-sm"><strong>Actividades:</strong></p>
            <ul class="text-xs ml-4 list-disc">
              ${parcela.uso.actividadesLabels.map(act => `<li>${act}</li>`).join('')}
            </ul>
          </div>
        `);

        polygon.on('click', () => {
          if (onItemClick) onItemClick(parcela);
        });

        // Icono en el centroide
        const centroid = parcela.coordenadas.reduce(
          (acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }),
          { lat: 0, lng: 0 }
        );
        centroid.lat /= parcela.coordenadas.length;
        centroid.lng /= parcela.coordenadas.length;

        const icon = L.divIcon({
          html: `<div style="background: ${color.border}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${color.icon}
          </div>`,
          className: '',
          iconSize: [32, 32]
        });

        L.marker([centroid.lat, centroid.lng], { icon })
          .addTo(layers.parcelas)
          .bindTooltip(parcela.nombre, { direction: 'top' });
      });
    }

    // ==================== CENTROS DE ACOPIO ====================
    if (activeLayers.includes('centros_acopio') && centrosAcopio.length > 0) {
      centrosAcopio.forEach(centro => {
        const icon = L.divIcon({
          html: `<div style="background: #ea580c; color: white; border-radius: 8px; padding: 6px 10px; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
            🏪 ${centro.nombre.split(' ').slice(0, 2).join(' ')}
          </div>`,
          className: '',
          iconSize: [120, 32]
        });

        const marker = L.marker([centro.coordenadas.lat, centro.coordenadas.lng], { icon })
          .addTo(layers.centros_acopio);

        marker.bindPopup(`
          <div class="p-2" style="min-width: 200px;">
            <h3 class="font-bold text-lg mb-1">🏪 ${centro.nombre}</h3>
            <p class="text-sm text-gray-600 mb-2">${centro.descripcion}</p>
            <p class="text-sm"><strong>Horario:</strong> ${centro.horario}</p>
            <p class="text-sm"><strong>Capacidad:</strong> ${centro.capacidad}</p>
            <p class="text-sm"><strong>Teléfono:</strong> ${centro.telefono}</p>
            <p class="text-sm mt-2"><strong>Productos:</strong></p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${centro.productos.map(p => `<span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">${p}</span>`).join('')}
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (onItemClick) onItemClick(centro);
        });
      });
    }

    // ==================== SEDES GUBERNAMENTALES ====================
    if (activeLayers.includes('sedes_gobierno') && sedesGobierno.length > 0) {
      sedesGobierno.forEach(sede => {
        const icon = L.divIcon({
          html: `<div style="background: #7c3aed; color: white; border-radius: 8px; padding: 6px 10px; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
            🏛️ ${sede.nombre.split(' ')[0]}
          </div>`,
          className: '',
          iconSize: [100, 32]
        });

        const marker = L.marker([sede.coordenadas.lat, sede.coordenadas.lng], { icon })
          .addTo(layers.sedes_gobierno);

        marker.bindPopup(`
          <div class="p-2" style="min-width: 200px;">
            <h3 class="font-bold text-lg mb-1">🏛️ ${sede.nombre}</h3>
            <p class="text-sm text-gray-600 mb-2">${sede.descripcion}</p>
            <p class="text-sm"><strong>Horario:</strong> ${sede.horario}</p>
            <p class="text-sm"><strong>Teléfono:</strong> ${sede.telefono}</p>
            <p class="text-sm mt-2"><strong>Servicios:</strong></p>
            <ul class="text-xs ml-4 list-disc">
              ${sede.servicios.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        `);

        marker.on('click', () => {
          if (onItemClick) onItemClick(sede);
        });
      });
    }

    // Ajustar vista del mapa
    const allLayers = [...parcelas, ...centrosAcopio, ...sedesGobierno];
    if (allLayers.length > 0) {
      const bounds = L.latLngBounds();
      
      parcelas.forEach(p => {
        p.coordenadas.forEach(c => bounds.extend([c.lat, c.lng]));
      });
      
      centrosAcopio.forEach(c => bounds.extend([c.coordenadas.lat, c.coordenadas.lng]));
      sedesGobierno.forEach(s => bounds.extend([s.coordenadas.lat, s.coordenadas.lng]));
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [100, 50] });
      }
    }
  };

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg border-2 border-gray-300 shadow-sm z-0" />
  );
}


