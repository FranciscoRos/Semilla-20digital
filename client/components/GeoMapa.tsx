import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

const PARCELAS_DEMO = [
  {
    id: "p1",
    nombre: "Parcela El Maizal",
    productor: "Juan Pérez",
    area: 5.5,
    uso: {
      area: "agricultura",
      areaLabel: "Agricultura",
      actividades: ["maiz", "frijol"],
      actividadesLabels: ["Siembra de Maíz", "Siembra de Frijol"]
    },
    coordenadas: [
      { lat: 21.1619, lng: -86.8515 },
      { lat: 21.1625, lng: -86.8520 },
      { lat: 21.1620, lng: -86.8525 },
      { lat: 21.1614, lng: -86.8520 }
    ],
    municipio: "Cancún",
    hasIrrigation: "yes",
    organicCertified: "yes"
  },
  {
    id: "p2",
    nombre: "Rancho La Esperanza",
    productor: "María González",
    area: 12.3,
    uso: {
      area: "ganaderia",
      areaLabel: "Ganadería",
      actividades: ["vacas", "cerdos"],
      actividadesLabels: ["Cría de Vacas", "Cría de Cerdos"]
    },
    coordenadas: [
      { lat: 21.1640, lng: -86.8530 },
      { lat: 21.1650, lng: -86.8535 },
      { lat: 21.1645, lng: -86.8545 },
      { lat: 21.1635, lng: -86.8540 }
    ],
    municipio: "Cancún",
    hasIrrigation: "partial",
    organicCertified: "no"
  },
  {
    id: "p3",
    nombre: "Estanque Los Peces",
    productor: "Carlos Hernández",
    area: 3.2,
    uso: {
      area: "pesca",
      areaLabel: "Pesca/Acuacultura",
      actividades: ["mojarra", "tilapia"],
      actividadesLabels: ["Cría de Mojarra", "Cría de Tilapia"]
    },
    coordenadas: [
      { lat: 21.1600, lng: -86.8500 },
      { lat: 21.1605, lng: -86.8505 },
      { lat: 21.1600, lng: -86.8510 },
      { lat: 21.1595, lng: -86.8505 }
    ],
    municipio: "Cancún",
    hasIrrigation: "no",
    organicCertified: "in_process"
  },
  {
    id: "p4",
    nombre: "Huerta Don Pedro",
    productor: "Pedro Martínez",
    area: 8.1,
    uso: {
      area: "agricultura",
      areaLabel: "Agricultura",
      actividades: ["chile", "tomate", "calabaza"],
      actividadesLabels: ["Siembra de Chile", "Siembra de Tomate", "Siembra de Calabaza"]
    },
    coordenadas: [
      { lat: 21.1655, lng: -86.8510 },
      { lat: 21.1665, lng: -86.8515 },
      { lat: 21.1660, lng: -86.8525 },
      { lat: 21.1650, lng: -86.8520 }
    ],
    municipio: "Playa del Carmen",
    hasIrrigation: "yes",
    organicCertified: "yes"
  }
];

// Centros de Acopio
const CENTROS_ACOPIO = [
  {
    id: "ca1",
    tipo: "centro_acopio",
    nombre: "Centro de Acopio Regional Cancún",
    descripcion: "Recepción de productos agrícolas y ganaderos",
    coordenadas: { lat: 21.1630, lng: -86.8515 },
    horario: "Lun-Vie 8:00-16:00",
    productos: ["Maíz", "Frijol", "Verduras", "Leche"],
    capacidad: "500 toneladas",
    telefono: "998-123-4567"
  },
  {
    id: "ca2",
    tipo: "centro_acopio",
    nombre: "Acopio de Productos del Mar",
    descripcion: "Especializado en productos pesqueros",
    coordenadas: { lat: 21.1610, lng: -86.8490 },
    horario: "Lun-Sab 6:00-14:00",
    productos: ["Mojarra", "Tilapia", "Camarón"],
    capacidad: "200 toneladas",
    telefono: "998-765-4321"
  }
];

// Sedes Gubernamentales
const SEDES_GOBIERNO = [
  {
    id: "sg1",
    tipo: "sede_gobierno",
    nombre: "SADER - Delegación Quintana Roo",
    descripcion: "Secretaría de Agricultura y Desarrollo Rural",
    coordenadas: { lat: 21.1645, lng: -86.8500 },
    servicios: ["Asesoría técnica", "Subsidios", "Programas de apoyo"],
    horario: "Lun-Vie 9:00-17:00",
    telefono: "998-888-9999"
  },
  {
    id: "sg2",
    tipo: "sede_gobierno",
    nombre: "CONAPESCA Región Caribe",
    descripcion: "Comisión Nacional de Acuacultura y Pesca",
    coordenadas: { lat: 21.1625, lng: -86.8535 },
    servicios: ["Permisos de pesca", "Capacitación", "Financiamiento"],
    horario: "Lun-Vie 8:00-15:00",
    telefono: "998-777-8888"
  }
];

export default function GeoMapa() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);


  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([18.51836, -88.30227], 12);
    mapInstanceRef.current = map;

    // Capa base
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: " @ITCH",
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
      });
    });


      // Añadir elementos al mapa
PARCELAS_DEMO.forEach((p) => {
  const poly = L.polygon(p.coordenadas.map(c => [c.lat, c.lng]), {
    color: "#16a34a",
    fillColor: "#86efac",
    fillOpacity: 0.4,
    weight: 3
  }).bindPopup(`
    <b>${p.nombre}</b><br/>
    Productor: ${p.productor}<br/>
    Área: ${p.area} ha<br/>
    Uso: ${p.uso.areaLabel}<br/>
    Actividades: ${p.uso.actividadesLabels.join(", ")}
  `);
  drawnItems.addLayer(poly);
});

CENTROS_ACOPIO.forEach((c) => {
  L.marker([c.coordenadas.lat, c.coordenadas.lng])
    .addTo(drawnItems)
    .bindPopup(`<b>${c.nombre}</b><br/>${c.descripcion}<br/>📞 ${c.telefono}`);
});

SEDES_GOBIERNO.forEach((s) => {
  L.marker([s.coordenadas.lat, s.coordenadas.lng])
    .addTo(drawnItems)
    .bindPopup(`<b>${s.nombre}</b><br/>${s.descripcion}<br/>📞 ${s.telefono}`);
});

map.fitBounds(drawnItems.getBounds(), { padding: [100, 50] });

  }, []);

  return (
      <div ref={mapRef} className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-sm z-0" />

  );
}


