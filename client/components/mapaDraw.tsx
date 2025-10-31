import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

export default function MapaDibujo({ onPolygonChange, initialPolygon }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([18.51836, -88.30227], 12);
    mapInstanceRef.current = map;

    // Capa base
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userLocation = [latitude, longitude];
          map.setView(userLocation, 15);

          L.marker(userLocation)
            .addTo(map)
            .bindPopup("Estás aquí")
            .openPopup();
        },
        (err) => {
          console.warn("Error obteniendo ubicación:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn("Geolocalización no soportada por el navegador");
    }

    // Capa de dibujo
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
    position: 'topright',
      draw: {
        polygon: {
          showArea: true,
          shapeOptions: {
            color: "#16a34a",
            fillColor: "#86efac",
            fillOpacity: 0.4,
            weight: 3,
          },
        },
        polyline: false,
        rectangle: false,
        marker: false,
        circle: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems, remove: true },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      
      const coordinates = layer.getLatLngs()[0].map(ll => ({
        lat: ll.lat,
        lng: ll.lng
      }));
      
      const areaM2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      const areaHectares = (areaM2 / 10000).toFixed(2);
      
      onPolygonChange({ coordinates, area: areaHectares });
    });

    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const coordinates = layer.getLatLngs()[0].map(ll => ({
          lat: ll.lat,
          lng: ll.lng
        }));
        const areaM2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        const areaHectares = (areaM2 / 10000).toFixed(2);
        onPolygonChange({ coordinates, area: areaHectares });
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      onPolygonChange({ coordinates: [], area: 0 });
    });

    if (initialPolygon && initialPolygon.length >= 3) {
      const latLngs = initialPolygon.map(c => [c.lat, c.lng]);
      const polygon = L.polygon(latLngs, {
        color: '#16a34a',
        fillColor: '#86efac',
        fillOpacity: 0.4,
        weight: 3
      });
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
    }
    return () => map.remove();
  }, []);

  return (
    <div>
      <div ref={mapRef} className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-sm z-0" />
      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">📍 Instrucciones:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Haz clic en el ícono de <strong>polígono</strong> (□) en la esquina superior derecha</li>
          <li>Haz clic en el mapa para agregar puntos y delimitar tu parcela</li>
          <li>Haz doble clic o cierra el polígono haciendo clic en el primer punto</li>
          <li><strong>Solo puedes dibujar UN polígono a la vez</strong> (se borra el anterior al crear uno nuevo)</li>
          <li>Usa el ícono de <strong>editar</strong> (✏️) para modificar el polígono</li>
          <li>Usa el ícono de <strong>basurero</strong> (🗑️) para eliminar</li>
        </ul>
      </div>
    </div>
  );
}


