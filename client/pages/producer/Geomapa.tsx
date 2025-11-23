import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  Settings2,
  Search,
  Filter,
  Layers,
  Map as MapIcon,
  ExternalLink,
  Navigation,
  CheckSquare,
  Square,
  X,
  Plus,
  Save,
  Trash2Icon,
} from "lucide-react";
import GeoMapa from "@/components/GeoMapa";
import { IParcela, IUbicacionEspecial } from "@/services/api";
import AddLocationModal from "@/components/modalAddLocation";
import { useAuth } from "@/providers/authProvider";

// ============================================
// 1. DATOS
// ============================================

const parcelas: IParcela[] = [
  {
    id: "p1",
    ciudad: "Cancún",
    municipio: "Benito Juárez",
    direccionAdicional: "Carretera a Leona Vicario Km 5",
    area: 5000,
    nombre: "Parcela Cancún Norte",
    usos: [
      {
        area: "Agricultura",
        actividadesEspecificas: ["Siembra de Maíz", "Siembra de Frijol"],
      },
    ],
    coordenadas: [
      { lat: 21.1619, lng: -86.8515 },
      { lat: 21.1625, lng: -86.852 },
      { lat: 21.162, lng: -86.8525 },
      { lat: 21.1614, lng: -86.852 },
    ],
    fechaRegistro: "2024-01-15",
  },
  {
    id: "p2",
    ciudad: "Mérida",
    municipio: "Mérida",
    direccionAdicional: "Zona Sur, Ejido Xmatkuil",
    area: 12000,
    nombre: "Rancho Mérida Sur",
    usos: [
      {
        area: "Ganaderia",
        actividadesEspecificas: ["Cría de Bovinos", "Cría de Porcinos"],
      },
    ],
    coordenadas: [
      { lat: 20.9752, lng: -89.6169 },
      { lat: 20.9757, lng: -89.6174 },
      { lat: 20.9753, lng: -89.618 },
      { lat: 20.9748, lng: -89.6175 },
    ],
    fechaRegistro: "2024-02-20",
  },
  {
    id: "p3",
    ciudad: "Chetumal",
    municipio: "Othón P. Blanco",
    direccionAdicional: "Ribera del Río Hondo",
    area: 8000,
    nombre: "Parcela Mixta del Sur",
    usos: [
      {
        area: "Agricultura",
        actividadesEspecificas: ["Caña de Azúcar"],
      },
      {
        area: "Apicultura",
        actividadesEspecificas: ["Producción de Miel"],
      },
    ],
    coordenadas: [
      { lat: 18.45, lng: -88.5 },
      { lat: 18.455, lng: -88.505 },
      { lat: 18.45, lng: -88.51 },
      { lat: 18.445, lng: -88.505 },
    ],
    fechaRegistro: "2024-03-10",
  },
];

const ubicacionesEspeciales: IUbicacionEspecial[] = [
  {
    id: "gov_sedarpe",
    nombre: "Secretaría de Desarrollo Agropecuario, Rural y Pesca",
    municipio: "Othón P. Blanco",
    tipo: "sede_gobierno",
    descripcion: "Oficinas centrales para trámites de pesca y agricultura.",
    coordenadas: { lat: 18.5069468, lng: -88.2960919 },
    telefono: "983 832 1255",
    direccion: "Av. Venustiano Carranza 201, Centro, Chetumal",
    institucion: "SEDARPE",
  },
  {
    id: "gov_sebien",
    nombre: "Secretaría de Bienestar (SEBIEN)",
    municipio: "Othón P. Blanco",
    tipo: "sede_gobierno",
    descripcion: "Atención a programas sociales Mujer es Poder y Hambre Cero.",
    coordenadas: { lat: 18.5141, lng: -88.3 },
    telefono: "983 835 1350",
    direccion: "Calzada Veracruz, Chetumal",
    institucion: "SEBIEN",
  },
  {
    id: "gov_sesa",
    nombre: "Secretaría de Salud (SESA)",
    municipio: "Othón P. Blanco",
    tipo: "sede_gobierno",
    descripcion: "Trámites sanitarios y consultas médicas.",
    coordenadas: { lat: 18.5154, lng: -88.2952 },
    telefono: "983 835 1300",
    direccion: "Av. Chapultepec 267, Chetumal",
    institucion: "SESA",
  },
  {
    id: "gov_inmaya",
    nombre: "Instituto para el Desarrollo del Pueblo Maya",
    municipio: "Felipe Carrillo Puerto",
    tipo: "sede_gobierno",
    descripcion: "Atención a comunidades indígenas y constancias.",
    coordenadas: { lat: 19.5779, lng: -88.0448 },
    telefono: "983 834 0000",
    institucion: "INMAYA",
  },
  {
    id: "gov_semarnat",
    nombre: "Secretaría de Ecología y Medio Ambiente",
    municipio: "Othón P. Blanco",
    tipo: "sede_gobierno",
    descripcion: "Trámites de impacto ambiental y monitoreo de aire.",
    coordenadas: { lat: 18.4995, lng: -88.292 },
    telefono: "983 129 2830",
    institucion: "SEMA",
  },
  {
    id: "prod_miel_bonita",
    nombre: "Miel Bonita (Centro de Abejas Reinas)",
    municipio: "Felipe Carrillo Puerto",
    tipo: "mercado_local",
    descripcion:
      "Centro de Producción de Abejas Reinas Mejoradas Certificadas.",
    coordenadas: { lat: 19.66838889, lng: -88.37988889 },
    telefono: "983 113 7575",
    horario: "L-V 7:00–14:00",
    institucion: "Productor",
  },
  {
    id: "prod_apiario_vergel",
    nombre: "Apiario Vergel",
    municipio: "Bacalar",
    tipo: "mercado_local",
    descripcion: "Venta de abejas reina mejorada y miel.",
    coordenadas: { lat: 18.886446, lng: -88.699803 },
    telefono: "983 183 3729",
    horario: "L-V 7:00–14:00",
    institucion: "Productor",
  },
  {
    id: "bio_ucum",
    nombre: "Agricultores cañeros de Ucum (Biofábrica)",
    municipio: "Othón P. Blanco",
    tipo: "centro_acopio",
    descripcion: "Establecimiento de Biofábrica y cultivo de caña.",
    coordenadas: { lat: 18.505741, lng: -88.519438 },
    telefono: "Sin datos",
    horario: "9 am a 4 pm",
    institucion: "Cañeros",
  },
  {
    id: "bio_veracruz",
    nombre: "Ejido Veracruz (Biofábrica)",
    municipio: "Othón P. Blanco",
    tipo: "centro_acopio",
    descripcion: "Fomento agrícola y sanidad vegetal.",
    coordenadas: { lat: 18.73617, lng: -89.088412 },
    telefono: "Sin datos",
    institucion: "Ejido",
  },
  {
    id: "prod_layli",
    nombre: "Layli Meyaa S.C. de R.L.",
    municipio: "Felipe Carrillo Puerto",
    tipo: "centro_acopio",
    descripcion: "Biofábrica y producción agrícola.",
    coordenadas: { lat: 19.416404, lng: -88.048732 },
    telefono: "Sin datos",
    institucion: "Productor",
  },
];

// Type Guard
function isParcela(item: any): item is IParcela {
  return (item as IParcela).usos !== undefined;
}

// Componente Helper para Checkbox
const CheckboxItem = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${checked ? "bg-green-50 text-green-800" : "hover:bg-gray-50 text-gray-600"}`}
  >
    {checked ? (
      <CheckSquare className="w-4 h-4 text-green-600" />
    ) : (
      <Square className="w-4 h-4 text-gray-300" />
    )}
    <span className="capitalize select-none">{label}</span>
  </div>
);

export default function DashboardGeomapa() {
  const {user}=useAuth()
  const [apiKey] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  );
  const [modalAdd, setModalAdd] = useState(false);

  const [activeLayers, setActiveLayers] = useState([
    "parcelas",
    "centro_acopio",
    "sede_gobierno",
    "mercado_local",
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<
    IParcela | IUbicacionEspecial | null
  >(null);

  // ================== ESTADOS DE FILTROS (MULTIPLE) ==================
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  // Nuevos estados para selección múltiple (Arrays de strings)
  const [filtrosAreas, setFiltrosAreas] = useState<string[]>([]);
  const [filtrosActividades, setFiltrosActividades] = useState<string[]>([]);

  const capas = [
    { id: "parcelas", label: "Parcelas", color: "bg-green-600", icon: "🌾" },
    {
      id: "centro_acopio",
      label: "Biofábricas",
      color: "bg-orange-600",
      icon: "🏭",
    },
    {
      id: "mercado_local",
      label: "Productores",
      color: "bg-yellow-500",
      icon: "🍯",
    },
    {
      id: "sede_gobierno",
      label: "Gobierno",
      color: "bg-purple-800",
      icon: "🏛️",
    },
  ];

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId],
    );
  };

  // Helper para togglear filtros de arrays
  const toggleFilter = (
    item: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((orev) =>
      orev.includes(item) ? orev.filter((i) => i !== item) : [...orev, item],
    );
  };

  const abrirGoogleMaps = (lat: number, lng: number) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // ==================== LISTAS DISPONIBLES (DINÁMICAS) ====================
  const municipiosDisponibles = useMemo(() => {
    const todas = [...parcelas, ...ubicacionesEspeciales];
    return Array.from(new Set(todas.map((e) => e.municipio))).sort();
  }, []);

  const areasDisponibles = useMemo(() => {
    const areas = new Set<string>();
    parcelas.forEach((p) => p.usos.forEach((u) => areas.add(u.area)));
    return Array.from(areas).sort();
  }, []);

  const actividadesDisponibles = useMemo(() => {
    const acts = new Set<string>();
    parcelas.forEach((p) =>
      p.usos.forEach((u) =>
        u.actividadesEspecificas.forEach((a) => acts.add(a)),
      ),
    );
    return Array.from(acts).sort();
  }, []);

  // ==================== FILTRADO UNIFICADO ====================
  const cumpleFiltrosBase = (entidad: IParcela | IUbicacionEspecial) => {
    const matchSearch = entidad.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchMunicipio =
      filtroMunicipio === "todos" || entidad.municipio === filtroMunicipio;
    return matchSearch && matchMunicipio;
  };

  const parcelasFiltradas = useMemo(
    () =>
      parcelas.filter((p) => {
        if (!cumpleFiltrosBase(p)) return false;

        // 1. Filtrado por Áreas (Uso de Suelo) - Lógica OR (si seleccionas 2, muestra cualquiera de las 2)
        // Si el array está vacío, asumimos "todos"
        const cumpleArea =
          filtrosAreas.length === 0 ||
          p.usos.some((u) => filtrosAreas.includes(u.area));

        // 2. Filtrado por Actividades Específicas - Lógica OR
        const cumpleActividad =
          filtrosActividades.length === 0 ||
          p.usos.some((u) =>
            u.actividadesEspecificas.some((act) =>
              filtrosActividades.includes(act),
            ),
          );

        // 3. Filtrado por Fecha
        let matchFecha = true;
        if (p.fechaRegistro) {
          if (filtroFechaDesde)
            matchFecha =
              matchFecha &&
              new Date(p.fechaRegistro) >= new Date(filtroFechaDesde);
          if (filtroFechaHasta)
            matchFecha =
              matchFecha &&
              new Date(p.fechaRegistro) <= new Date(filtroFechaHasta);
        }

        return cumpleArea && cumpleActividad && matchFecha;
      }),
    [
      searchTerm,
      filtroMunicipio,
      filtrosAreas,
      filtrosActividades,
      filtroFechaDesde,
      filtroFechaHasta,
    ],
  );

  const centrosAcopioFiltrados = useMemo(
    () =>
      ubicacionesEspeciales.filter((u) => {
        return (
          (u.tipo === "centro_acopio" || u.tipo === "mercado_local") &&
          cumpleFiltrosBase(u)
        );
      }),
    [searchTerm, filtroMunicipio],
  );

  const sedesGobiernoFiltradas = useMemo(
    () =>
      ubicacionesEspeciales.filter((u) => {
        return u.tipo === "sede_gobierno" && cumpleFiltrosBase(u);
      }),
    [searchTerm, filtroMunicipio],
  );

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroMunicipio("todos");
    setFiltrosAreas([]); // Reset a vacío
    setFiltrosActividades([]); // Reset a vacío
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setSelectedItem(null);
  };

  const stats = {
    total:
      parcelasFiltradas.length +
      centrosAcopioFiltrados.length +
      sedesGobiernoFiltradas.length,
    parcelas: parcelasFiltradas.length,
    otros: centrosAcopioFiltrados.length + sedesGobiernoFiltradas.length,
  };

  const getCoordsFromItem = (item: IParcela | IUbicacionEspecial) => {
    if (isParcela(item)) return item.coordenadas[0];
    return item.coordenadas;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-green-600 font-medium mb-2 hover:underline"
            >
              <ChevronLeft className="w-5 h-5" /> Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-8 h-8 text-green-600" /> Geomapa
              Agropecuario
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualización de productores, biofábricas y dependencias estatales
              (SEDARPE).
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold">
                Resultados:
              </span>
              <span className="font-bold text-green-600 text-lg">
                {stats.total}
              </span>
            </div>
            <button className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
              <Settings2 className="w-5 h-5 text-gray-600" />
            </button>
    { user.Tipo==='Administracion' &&
            <button
              onClick={() => setModalAdd(!modalAdd)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Pregunta
            </button>
}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Filtros */}
          <div className="lg:col-span-3 space-y-4">
            {/* Detalle Selección */}
            {selectedItem && (
              <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500 animate-fade-in mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 pr-2">
                    {selectedItem.nombre}
                  </h3>
                  <button onClick={() => setSelectedItem(null)}>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {selectedItem.municipio}
                  {!isParcela(selectedItem) &&
                    selectedItem.institucion &&
                    ` • ${selectedItem.institucion}`}
                </p>
                {isParcela(selectedItem) && selectedItem.usos && (
                  <div className="mb-3 space-y-1">
                    {selectedItem.usos.map((uso, idx) => (
                      <div key={idx}>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {uso.area}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 pl-1">
                          {uso.actividadesEspecificas.join(", ")}
                        </p>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-2">
                      Area: {selectedItem.area} m²
                    </p>
                  </div>
                )}
                {!isParcela(selectedItem) && (
                  <>
                    <p className="text-xs text-gray-600 italic mb-3 line-clamp-3">
                      {selectedItem.descripcion}
                    </p>
                    {selectedItem.telefono &&
                      selectedItem.telefono !== "Sin datos" && (
                        <p className="text-xs text-gray-700 mb-1">
                          📞 {selectedItem.telefono}
                        </p>
                      )}
                    {selectedItem.horario && (
                      <p className="text-xs text-gray-700 mb-1">
                        🕒 {selectedItem.horario}
                      </p>
                    )}
                  </>
                )}

                <div className="flex flex-row gap-2 mt-2 w-full">
                  <button
                    onClick={() => {
                      const c = getCoordsFromItem(selectedItem);
                      abrirGoogleMaps(c.lat, c.lng);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Ir a Google Maps
                  </button>

                  {!isParcela(selectedItem) &&user.Tipo==='Administracion' && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `¿Estás seguro de eliminar la ubicacion ${selectedItem.nombre}?`,
                          )
                        ) {
                          console.log("Eliminar", selectedItem.id);
                          setSelectedItem(null);
                        }
                      }}
                      className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2Icon className="w-3 h-3" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Panel de Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filtros
                </h3>
                <button
                  onClick={limpiarFiltros}
                  className="text-xs text-red-500 hover:underline"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-5">
                {/* Búsqueda */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Búsqueda Global
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                {/* Municipio */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Municipio
                  </label>
                  <select
                    value={filtroMunicipio}
                    onChange={(e) => setFiltroMunicipio(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="todos">Todos los municipios</option>
                    {municipiosDisponibles.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Áreas (Uso de Suelo) - Checkboxes */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block flex justify-between">
                    Áreas (Uso de Suelo)
                    <span className="text-[10px] font-normal bg-gray-100 px-1.5 rounded">
                      {filtrosAreas.length > 0 ? filtrosAreas.length : "Todas"}
                    </span>
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-1 bg-gray-50/50">
                    {areasDisponibles.length === 0 && (
                      <p className="text-xs text-gray-400 p-2 text-center">
                        No hay áreas disponibles
                      </p>
                    )}
                    {areasDisponibles.map((area) => (
                      <CheckboxItem
                        key={area}
                        label={area}
                        checked={filtrosAreas.includes(area)}
                        onChange={() => toggleFilter(area, setFiltrosAreas)}
                      />
                    ))}
                  </div>
                </div>

                {/* Actividades Específicas - Checkboxes */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block flex justify-between">
                    Actividades Específicas
                    <span className="text-[10px] font-normal bg-gray-100 px-1.5 rounded">
                      {filtrosActividades.length > 0
                        ? filtrosActividades.length
                        : "Todas"}
                    </span>
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-1 bg-gray-50/50">
                    {actividadesDisponibles.length === 0 && (
                      <p className="text-xs text-gray-400 p-2 text-center">
                        No hay actividades
                      </p>
                    )}
                    {actividadesDisponibles.map((act) => (
                      <CheckboxItem
                        key={act}
                        label={act}
                        checked={filtrosActividades.includes(act)}
                        onChange={() =>
                          toggleFilter(act, setFiltrosActividades)
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Rango de Fechas */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                      className="w-full p-1 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                      className="w-full p-1 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capas */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Capas
              </h3>
              <div className="space-y-2">
                {capas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleLayer(c.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-sm transition ${activeLayers.includes(c.id) ? "bg-gray-50 border-green-500" : "bg-white border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full border ${activeLayers.includes(c.id) ? c.color.replace("bg-", "bg-") : "bg-transparent"}`}
                    ></div>
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
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow border text-xs flex gap-4 pointer-events-none">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                  Parcelas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>{" "}
                  Biofábricas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>{" "}
                  Productores
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-800"></span>{" "}
                  Gobierno
                </div>
              </div>
            </div>

            {/* Lista Horizontal de Resultados */}
            <div className="mt-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {parcelasFiltradas.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedItem(p)}
                  className={`min-w-[200px] bg-white p-3 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-all group relative ${selectedItem?.id === p.id ? "border-green-500 ring-1 ring-green-500" : "border-gray-200"}`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-lg">🌾</span>
                    <span className="text-[10px] bg-gray-100 px-2 rounded-full h-fit py-0.5">
                      {p.municipio}
                    </span>
                  </div>
                  <p className="font-bold text-sm truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.usos[0]?.area}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const c = getCoordsFromItem(p);
                      abrirGoogleMaps(c.lat, c.lng);
                    }}
                    className="absolute top-2 right-2 p-1 bg-blue-50 rounded-full text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                    title="Ver en Google Maps"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {[...sedesGobiernoFiltradas, ...centrosAcopioFiltrados].map(
                (c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedItem(c)}
                    className={`min-w-[200px] bg-white p-3 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-all group relative ${selectedItem?.id === c.id ? "border-green-500 ring-1 ring-green-500" : "border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg bg-gray-50 w-8 h-8 flex items-center justify-center rounded-full">
                        {c.tipo === "sede_gobierno"
                          ? "🏛️"
                          : c.tipo === "mercado_local"
                            ? "🍯"
                            : "🏭"}
                      </span>

                      {/* Contenedor derecho: Etiqueta + Botón Eliminar */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium border border-gray-100">
                          {c.institucion || "Entidad"}
                        </span>
    { user.Tipo==='Administracion' &&
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("¿Eliminar?")) {
                              console.log("Eliminando", c.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar ubicación"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
}
                      </div>
                    </div>

                    {/* DATOS DE TEXTO */}
                    <p
                      className="font-bold text-sm truncate text-gray-800"
                      title={c.nombre}
                    >
                      {c.nombre}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {c.municipio}
                    </p>

                    {/* Botón Google Maps (Hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirGoogleMaps(c.coordenadas.lat, c.coordenadas.lng);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 bg-blue-50 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:scale-105 shadow-sm"
                      title="Ver en Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <AddLocationModal
        isOpen={modalAdd}
        onClose={() => setModalAdd(false)}
        onSave={(d) => console.log(d)}
      />
    </div>
  );
}
