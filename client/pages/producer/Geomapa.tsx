import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, Settings2, Search, Filter, Calendar, X, Layers, AlertCircle, Map as MapIcon } from "lucide-react";
import GeoMapa from "@/components/GeoMapa";

// ============================================
// 1. DEFINICIÓN DE INTERFACES
// ============================================

// Interfaz base que encapsula las propiedades comunes
interface EntidadConMunicipio {
  id: string;
  nombre: string;
  municipio: string;
  // Permitimos flexibilidad en coordenadas
  coordenadas: any; 
}

// Interfaz específica para Parcelas
interface IParcela extends EntidadConMunicipio {
  uso: {
    area: string;
    areaLabel: string;
    actividades: string[];
    actividadesLabels: string[];
  };
  coordenadas: { lat: number; lng: number }[]; // Polígono
  productor?: string;
  fechaRegistro?: string;
  organicCertified?: string;
  hasIrrigation?: string;
}

// Interfaz específica para Ubicaciones Especiales
interface IUbicacionEspecial extends EntidadConMunicipio {
  tipo: string;
  descripcion: string;
  coordenadas: { lat: number; lng: number }; // Punto singular
  telefono: string;
  horario?: string;
  capacidad?: string;
  productos?: string[];
  servicios?: string[];
}

// ============================================
// 2. DATOS (INFORMACIÓN ORIGINAL)
// ============================================

const parcelas: IParcela[] = [
  {
    id: "p1",
    nombre: "Parcela Cancún Norte",
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
    municipio: "Cancún"
  },
  {
    id: "p2",
    nombre: "Rancho Mérida Sur",
    uso: {
      area: "ganaderia",
      areaLabel: "Ganadería",
      actividades: ["bovino", "porcino"],
      actividadesLabels: ["Cría de Bovinos", "Cría de Porcinos"]
    },
    coordenadas: [
      { lat: 20.9752, lng: -89.6169 },
      { lat: 20.9757, lng: -89.6174 },
      { lat: 20.9753, lng: -89.6180 },
      { lat: 20.9748, lng: -89.6175 }
    ],
    municipio: "Mérida"
  }
];

const ubicacionesEspeciales: IUbicacionEspecial[] = [
  {
    id: "mkt2",
    tipo: "mercado_local",
    nombre: "Mercado Municipal de Mérida",
    descripcion: "Venta de productos locales y derivados agrícolas",
    coordenadas: {
      lat: 20.9740,
      lng: -89.6210
    },
    telefono: "999-555-0033",
    municipio: "Othon P. Blanco"
  },
  {
    id: "ca1",
    tipo: "centro_acopio",
    nombre: "Centro de Acopio Regional Cancún",
    descripcion: "Recepción de productos agrícolas y ganaderos",
    coordenadas: {
      lat: 21.1630,
      lng: -86.8515
    },
    telefono: "998-123-4567",
    municipio: "Othon P. Blanco"
  }
];


export default function DashboardGeomapa() {
  
  // NOTA: Reemplaza el string vacío con tu API KEY real de Google Maps
  const [apiKey] = useState(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  
  // Estados para filtros
  const [activeLayers, setActiveLayers] = useState(['parcelas', 'centros_acopio', 'sedes_gobierno', 'mercado_local']);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Filtros
  const [filtroTipoUso, setFiltroTipoUso] = useState("todos"); 
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  
  // Capas disponibles para el Toggle
  const capas = [
    { id: "parcelas", label: "Parcelas", color: "bg-green-600", icon: "🌾" },
    { id: "centros_acopio", label: "C. Acopio", color: "bg-orange-600", icon: "🏪" },
    { id: "mercado_local", label: "Mercados", color: "bg-blue-600", icon: "🛒" },
    { id: "sedes_gobierno", label: "Sedes Gob.", color: "bg-purple-600", icon: "🏛️" }
  ];

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // ==================== LOGICA DE MUNICIPIOS ====================
  const municipiosDisponibles = useMemo(() => {
    const todasLasEntidades: EntidadConMunicipio[] = [...parcelas, ...ubicacionesEspeciales];
    const setMunicipios = new Set(todasLasEntidades.map(e => e.municipio));
    return Array.from(setMunicipios).sort();
  }, []);

  // ==================== FILTRADO UNIFICADO ====================
  const cumpleFiltrosBase = (entidad: EntidadConMunicipio) => {
    const matchSearch = entidad.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMunicipio = filtroMunicipio === "todos" || entidad.municipio === filtroMunicipio;
    return matchSearch && matchMunicipio;
  };

  const parcelasFiltradas = useMemo(() => parcelas.filter(p => {
    if (!cumpleFiltrosBase(p)) return false;
    const matchTipoUso = filtroTipoUso === "todos" || p.uso.area === filtroTipoUso;
    let matchFecha = true;
    if (p.fechaRegistro) {
      if (filtroFechaDesde) matchFecha = matchFecha && new Date(p.fechaRegistro) >= new Date(filtroFechaDesde);
      if (filtroFechaHasta) matchFecha = matchFecha && new Date(p.fechaRegistro) <= new Date(filtroFechaHasta);
    }
    return matchTipoUso && matchFecha;
  }), [searchTerm, filtroMunicipio, filtroTipoUso, filtroFechaDesde, filtroFechaHasta]);

  const centrosAcopioFiltrados = useMemo(() => ubicacionesEspeciales.filter(u => {
    return (u.tipo === 'centro_acopio' || u.tipo === 'mercado_local') && cumpleFiltrosBase(u);
  }), [searchTerm, filtroMunicipio]);

  const sedesGobiernoFiltradas = useMemo(() => ubicacionesEspeciales.filter(u => {
    return u.tipo === 'sede_gobierno' && cumpleFiltrosBase(u);
  }), [searchTerm, filtroMunicipio]);

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroTipoUso("todos");
    setFiltroMunicipio("todos");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
  };

  const stats = {
    total: parcelasFiltradas.length + centrosAcopioFiltrados.length + sedesGobiernoFiltradas.length,
    parcelas: parcelasFiltradas.length,
    otros: centrosAcopioFiltrados.length + sedesGobiernoFiltradas.length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-green-600 font-medium mb-2 hover:underline">
              <ChevronLeft className="w-5 h-5" /> Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-8 h-8 text-green-600"/> Geomapa Agropecuario
            </h1>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
             <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-bold">Resultados:</span>
                <span className="font-bold text-green-600 text-lg">{stats.total}</span>
             </div>
             <button className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                <Settings2 className="w-5 h-5 text-gray-600" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Filtros */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-700 flex items-center gap-2"><Filter className="w-4 h-4"/> Filtros</h3>
                 <button onClick={limpiarFiltros} className="text-xs text-red-500 hover:underline">Limpiar</button>
               </div>
               
               <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Búsqueda Global</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar nombre..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Municipio</label>
                    <select 
                        value={filtroMunicipio} 
                        onChange={e => setFiltroMunicipio(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                        <option value="todos">Todos los municipios</option>
                        {municipiosDisponibles.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Uso de Suelo (Parcelas)</label>
                    <select 
                        value={filtroTipoUso} 
                        onChange={e => setFiltroTipoUso(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                        <option value="todos">Todos</option>
                        <option value="agricultura">Agricultura</option>
                        <option value="ganaderia">Ganadería</option>
                        <option value="pesca">Pesca</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Desde</label>
                        <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} className="w-full p-1 border rounded text-xs"/>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Hasta</label>
                        <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} className="w-full p-1 border rounded text-xs"/>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> Capas</h3>
                <div className="space-y-2">
                    {capas.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => toggleLayer(c.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg border text-sm transition ${activeLayers.includes(c.id) ? 'bg-gray-50 border-green-500' : 'bg-white border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2">
                                <span>{c.icon}</span>
                                <span>{c.label}</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full border ${activeLayers.includes(c.id) ? c.color.replace('bg-', 'bg-') : 'bg-transparent'}`}></div>
                        </button>
                    ))}
                </div>
            </div>
          </div>

          {/* Columna Derecha: Mapa */}
          <div className="lg:col-span-9">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 h-[600px] relative overflow-hidden">
                <GeoMapa 
                    apiKey={apiKey}
                    parcelas={parcelasFiltradas}
                    centrosAcopio={centrosAcopioFiltrados}
                    sedesGobierno={sedesGobiernoFiltradas}
                    activeLayers={activeLayers}
                    onItemClick={setSelectedItem}
                />

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow border text-xs flex gap-4">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Parcelas</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Centros</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Mercados</div>
                </div>
             </div>

             <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {parcelasFiltradas.map(p => (
                    <div key={p.id} onClick={() => setSelectedItem(p)} className="min-w-[180px] bg-white p-3 rounded-lg border hover:border-green-500 cursor-pointer shadow-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-lg">🌾</span>
                            <span className="text-[10px] bg-gray-100 px-2 rounded-full h-fit py-0.5">{p.municipio}</span>
                        </div>
                        <p className="font-bold text-sm truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.uso.areaLabel}</p>
                    </div>
                ))}
                {centrosAcopioFiltrados.map(c => (
                    <div key={c.id} onClick={() => setSelectedItem(c)} className="min-w-[180px] bg-white p-3 rounded-lg border hover:border-orange-500 cursor-pointer shadow-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-lg">{c.tipo === 'mercado_local' ? '🛒' : '🏪'}</span>
                            <span className="text-[10px] bg-gray-100 px-2 rounded-full h-fit py-0.5">{c.municipio}</span>
                        </div>
                        <p className="font-bold text-sm truncate">{c.nombre}</p>
                        <p className="text-xs text-gray-500 capitalize">{c.tipo.replace('_', ' ')}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}