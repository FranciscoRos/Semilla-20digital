import { useState } from "react";
import { ChevronLeft, Settings2, Search, Filter, Calendar, X } from "lucide-react";
import GeoMapa from "@/components/GeoMapa";

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
    fechaRegistro: "2024-01-15",
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
    fechaRegistro: "2024-02-20",
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
    fechaRegistro: "2024-03-10",
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
    fechaRegistro: "2023-12-05",
    hasIrrigation: "yes",
    organicCertified: "yes"
  },
  {
    id: "p5",
    nombre: "Granja Avícola Los Pollos",
    productor: "Ana López",
    area: 2.8,
    uso: {
      area: "ganaderia",
      areaLabel: "Ganadería",
      actividades: ["pollos"],
      actividadesLabels: ["Cría de Pollos"]
    },
    coordenadas: [
      { lat: 21.1670, lng: -86.8495 },
      { lat: 21.1675, lng: -86.8500 },
      { lat: 21.1670, lng: -86.8505 },
      { lat: 21.1665, lng: -86.8500 }
    ],
    municipio: "Tulum",
    fechaRegistro: "2024-04-22",
    hasIrrigation: "no",
    organicCertified: "no"
  }
];

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
    telefono: "998-123-4567",
    municipio: "Cancún"
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
    telefono: "998-765-4321",
    municipio: "Cancún"
  }
];

const SEDES_GOBIERNO = [
  {
    id: "sg1",
    tipo: "sede_gobierno",
    nombre: "SADER - Delegación Quintana Roo",
    descripcion: "Secretaría de Agricultura y Desarrollo Rural",
    coordenadas: { lat: 21.1645, lng: -86.8500 },
    servicios: ["Asesoría técnica", "Subsidios", "Programas de apoyo"],
    horario: "Lun-Vie 9:00-17:00",
    telefono: "998-888-9999",
    municipio: "Cancún"
  },
  {
    id: "sg2",
    tipo: "sede_gobierno",
    nombre: "CONAPESCA Región Caribe",
    descripcion: "Comisión Nacional de Acuacultura y Pesca",
    coordenadas: { lat: 21.1625, lng: -86.8535 },
    servicios: ["Permisos de pesca", "Capacitación", "Financiamiento"],
    horario: "Lun-Vie 8:00-15:00",
    telefono: "998-777-8888",
    municipio: "Cancún"
  }
];

// ============================================
// COMPONENTE PRINCIPAL CON FILTROS
// ============================================
export default function Geomapa() {
  // Estados para filtros
  const [activeLayers, setActiveLayers] = useState(['parcelas', 'centros_acopio', 'sedes_gobierno']);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filtros específicos
  const [filtroTipoUso, setFiltroTipoUso] = useState("todos"); // agricultura, ganaderia, pesca
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCertificacion, setFiltroCertificacion] = useState("todos");
  const [filtroRiego, setFiltroRiego] = useState("todos");

  const capas = [
    { id: "parcelas", label: "Parcelas", color: "bg-green-600", icon: "🌾" },
    { id: "centros_acopio", label: "Centros de Acopio", color: "bg-orange-600", icon: "🏪" },
    { id: "sedes_gobierno", label: "Sedes Gubernamentales", color: "bg-purple-600", icon: "🏛️" }
  ];

  const toggleLayer = (layerId) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // ==================== LÓGICA DE FILTRADO ====================
  const parcelasFiltradas = PARCELAS_DEMO.filter(parcela => {
    // Búsqueda por texto
    const matchSearch = 
      parcela.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcela.productor.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por tipo de uso
    const matchTipoUso = filtroTipoUso === "todos" || parcela.uso.area === filtroTipoUso;

    // Filtro por municipio
    const matchMunicipio = filtroMunicipio === "todos" || parcela.municipio === filtroMunicipio;

    // Filtro por rango de fechas
    let matchFecha = true;
    if (filtroFechaDesde) {
      matchFecha = matchFecha && new Date(parcela.fechaRegistro) >= new Date(filtroFechaDesde);
    }
    if (filtroFechaHasta) {
      matchFecha = matchFecha && new Date(parcela.fechaRegistro) <= new Date(filtroFechaHasta);
    }

    // Filtro por certificación
    const matchCertificacion = filtroCertificacion === "todos" || 
      parcela.organicCertified === filtroCertificacion;

    // Filtro por riego
    const matchRiego = filtroRiego === "todos" || parcela.hasIrrigation === filtroRiego;

    return matchSearch && matchTipoUso && matchMunicipio && matchFecha && 
           matchCertificacion && matchRiego;
  });

  const centrosAcopioFiltrados = CENTROS_ACOPIO.filter(centro => {
    const matchSearch = centro.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMunicipio = filtroMunicipio === "todos" || centro.municipio === filtroMunicipio;
    return matchSearch && matchMunicipio;
  });

  const sedesGobiernoFiltradas = SEDES_GOBIERNO.filter(sede => {
    const matchSearch = sede.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMunicipio = filtroMunicipio === "todos" || sede.municipio === filtroMunicipio;
    return matchSearch && matchMunicipio;
  });

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroTipoUso("todos");
    setFiltroMunicipio("todos");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setFiltroCertificacion("todos");
    setFiltroRiego("todos");
  };

  // Estadísticas
  const stats = {
    totalParcelas: parcelasFiltradas.length,
    areaTotal: parcelasFiltradas.reduce((sum, p) => sum + p.area, 0).toFixed(1),
    centrosAcopio: centrosAcopioFiltrados.length,
    sedesGobierno: sedesGobiernoFiltradas.length
  };

  // Obtener municipios únicos
  const municipios = [...new Set([
    ...PARCELAS_DEMO.map(p => p.municipio),
    ...CENTROS_ACOPIO.map(c => c.municipio),
    ...SEDES_GOBIERNO.map(s => s.municipio)
  ])];
 return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
          <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Geomapa de Recursos Agropecuarios
        </h1>
        <p className="text-gray-600 mb-8">
          Visualiza y filtra parcelas, centros de acopio y sedes gubernamentales
        </p>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Parcelas Filtradas</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalParcelas}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Área Total</p>
            <p className="text-2xl font-bold text-green-600">{stats.areaTotal} ha</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Centros Acopio</p>
            <p className="text-2xl font-bold text-orange-600">{stats.centrosAcopio}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Sedes Gobierno</p>
            <p className="text-2xl font-bold text-purple-600">{stats.sedesGobierno}</p>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-8 h-[500px]">
          <GeoMapa 
            parcelas={parcelasFiltradas}
            centrosAcopio={centrosAcopioFiltrados}
            sedesGobierno={sedesGobiernoFiltradas}
            activeLayers={activeLayers}
            onItemClick={setSelectedItem}
          />
        </div>

        {/* Controles de Capas */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Capas Visibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {capas.map(capa => (
              <button
                key={capa.id}
                onClick={() => toggleLayer(capa.id)}
                className={`p-4 rounded-lg border-2 transition text-left flex items-center gap-3 ${
                  activeLayers.includes(capa.id)
                    ? `${capa.color} text-white border-transparent`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{capa.icon}</span>
                <span className="font-medium">{capa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Filtros Avanzados */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Avanzados
            </h2>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nombre o productor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Filtro por Tipo de Uso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Uso
              </label>
              <select
                value={filtroTipoUso}
                onChange={(e) => setFiltroTipoUso(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="agricultura">🌾 Agricultura</option>
                <option value="ganaderia">🐄 Ganadería</option>
                <option value="pesca">🐟 Pesca/Acuacultura</option>
              </select>
            </div>

            {/* Filtro por Municipio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio
              </label>
              <select
                value={filtroMunicipio}
                onChange={(e) => setFiltroMunicipio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                {municipios.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filtro por Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filtro por Certificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificación Orgánica
              </label>
              <select
                value={filtroCertificacion}
                onChange={(e) => setFiltroCertificacion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="yes">✅ Certificado</option>
                <option value="in_process">🟡 En proceso</option>
                <option value="no">❌ Sin certificar</option>
              </select>
            </div>

            {/* Filtro por Sistema de Riego */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema de Riego
              </label>
              <select
                value={filtroRiego}
                onChange={(e) => setFiltroRiego(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="yes">✅ Con riego completo</option>
                <option value="partial">🟡 Riego parcial</option>
                <option value="no">❌ Sin riego</option>
              </select>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(searchTerm || filtroTipoUso !== "todos" || filtroMunicipio !== "todos" || 
            filtroFechaDesde || filtroFechaHasta || filtroCertificacion !== "todos" || 
            filtroRiego !== "todos") && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Filtros activos:</strong>{' '}
                {searchTerm && `Búsqueda: "${searchTerm}" • `}
                {filtroTipoUso !== "todos" && `Tipo: ${filtroTipoUso} • `}
                {filtroMunicipio !== "todos" && `Municipio: ${filtroMunicipio} • `}
                {filtroFechaDesde && `Desde: ${filtroFechaDesde} • `}
                {filtroFechaHasta && `Hasta: ${filtroFechaHasta} • `}
                {filtroCertificacion !== "todos" && `Certificación • `}
                {filtroRiego !== "todos" && `Riego`}
              </p>
            </div>
          )}
        </div>

        {/* Lista de Resultados */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-4">
            Resultados ({parcelasFiltradas.length + centrosAcopioFiltrados.length + sedesGobiernoFiltradas.length})
          </h2>

          {/* Tabs para diferentes tipos */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button className="px-4 py-2 border-b-2 border-green-600 text-green-600 font-medium">
              Parcelas ({parcelasFiltradas.length})
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Centros ({centrosAcopioFiltrados.length})
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Sedes ({sedesGobiernoFiltradas.length})
            </button>
          </div>

          {/* Lista de Parcelas Filtradas */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parcelasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron parcelas con los filtros seleccionados</p>
              </div>
            ) : (
              parcelasFiltradas.map(parcela => {
                const COLORES_USO = {
                  agricultura: { icon: "🌾", color: "bg-green-100 text-green-700" },
                  ganaderia: { icon: "🐄", color: "bg-red-100 text-red-700" },
                  pesca: { icon: "🐟", color: "bg-blue-100 text-blue-700" }
                };

                const color = COLORES_USO[parcela.uso.area];

                return (
                  <div
                    key={parcela.id}
                    onClick={() => setSelectedItem(parcela)}
                    className={`p-4 border-2 rounded-lg hover:bg-gray-50 transition cursor-pointer ${
                      selectedItem?.id === parcela.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{color.icon}</span>
                          <h3 className="font-semibold text-gray-900">{parcela.nombre}</h3>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          Productor: {parcela.productor} • {parcela.area} ha
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {parcela.uso.areaLabel}: {parcela.uso.actividadesLabels.join(', ')}
                        </p>
                        
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            📅 {parcela.fechaRegistro}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            📍 {parcela.municipio}
                          </span>
                          {parcela.organicCertified === 'yes' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ✅ Orgánico
                            </span>
                          )}
                          {parcela.hasIrrigation === 'yes' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              💧 Riego
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${color.color}`}>
                        {parcela.uso.areaLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal de Detalles */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedItem.uso?.area === 'agricultura' && '🌾'}
                    {selectedItem.uso?.area === 'ganaderia' && '🐄'}
                    {selectedItem.uso?.area === 'pesca' && '🐟'}
                    {selectedItem.tipo === 'centro_acopio' && '🏪'}
                    {selectedItem.tipo === 'sede_gobierno' && '🏛️'}
                    {' '}{selectedItem.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedItem.productor && `Productor: ${selectedItem.productor}`}
                    {selectedItem.tipo === 'centro_acopio' && 'Centro de Acopio'}
                    {selectedItem.tipo === 'sede_gobierno' && 'Sede Gubernamental'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Detalles de Parcela */}
                {selectedItem.uso && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Área Total</p>
                        <p className="text-2xl font-bold text-green-600">{selectedItem.area} ha</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Municipio</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedItem.municipio}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Tipo de Producción</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-800 mb-2">{selectedItem.uso.areaLabel}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.uso.actividadesLabels.map((act, i) => (
                            <span key={i} className="bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Sistema de Riego</h4>
                        <p className="text-sm text-gray-600">
                          {selectedItem.hasIrrigation === 'yes' ? '✅ Completo' : 
                           selectedItem.hasIrrigation === 'partial' ? '🟡 Parcial' : '❌ Sin riego'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Certificación Orgánica</h4>
                        <p className="text-sm text-gray-600">
                          {selectedItem.organicCertified === 'yes' ? '✅ Certificado' : 
                           selectedItem.organicCertified === 'in_process' ? '🟡 En proceso' : '❌ No certificado'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fecha de Registro</h4>
                      <p className="text-sm text-gray-600">📅 {selectedItem.fechaRegistro}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Coordenadas del Polígono</h4>
                      <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-xs font-mono text-gray-600">
                          {selectedItem.coordenadas.map((c, i) => 
                            `Punto ${i+1}: (${c.lat.toFixed(4)}, ${c.lng.toFixed(4)})`
                          ).join('\n')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detalles de Centro de Acopio */}
                {selectedItem.tipo === 'centro_acopio' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 mb-4">{selectedItem.descripcion}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                          <p className="text-lg font-bold text-orange-600">{selectedItem.capacidad}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedItem.telefono}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Horario de Atención</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        📅 {selectedItem.horario}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Productos que Recibe</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.productos.map((producto, i) => (
                          <span key={i} className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium">
                            {producto}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detalles de Sede Gubernamental */}
                {selectedItem.tipo === 'sede_gobierno' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 mb-4">{selectedItem.descripcion}</p>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Teléfono de Contacto</p>
                        <p className="text-xl font-bold text-purple-600">{selectedItem.telefono}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Horario de Atención</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        📅 {selectedItem.horario}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Servicios Disponibles</h4>
                      <ul className="space-y-2">
                        {selectedItem.servicios.map((servicio, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span className="text-gray-700">{servicio}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      const lat = selectedItem.coordenadas?.lat || selectedItem.coordenadas?.[0]?.lat;
                      const lng = selectedItem.coordenadas?.lng || selectedItem.coordenadas?.[0]?.lng;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    📍 Ver en Google Maps
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
