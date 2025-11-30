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
  Trash2Icon,
  Plus,
  Loader2, // Icono de carga
  MapPinOff, // Icono para "sin resultados"
} from "lucide-react";
import GeoMapa from "@/components/GeoMapa";
import { IParcela, IUbicacionEspecial } from "@/services/api";
import AddLocationModal from "@/components/modalAddLocation";
import { useAuth } from "@/providers/authProvider";
import { useGeoMapa } from "@/hooks/useGeoMapa";

// ==================== TYPE GUARDS & UTILS ====================

function isParcela(item: any): item is IParcela {
  return (item as IParcela).usos !== undefined;
}

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
    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
      checked ? "bg-green-50 text-green-800" : "hover:bg-gray-50 text-gray-600"
    }`}
  >
    {checked ? (
      <CheckSquare className="w-4 h-4 text-green-600" />
    ) : (
      <Square className="w-4 h-4 text-gray-300" />
    )}
    <span className="capitalize select-none">{label}</span>
  </div>
);

// Componente SKELETON para la lista horizontal
const HorizontalListSkeleton = () => (
  <>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="min-w-[200px] h-24 bg-gray-100 rounded-lg border border-gray-200 animate-pulse flex flex-col justify-center p-4 space-y-2"
      >
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </>
);


export default function DashboardGeomapa() {
  const { parcelas, ubicacionesEspeciales, loadingParcelas, loadingUbicaciones } =useGeoMapa();

  const safeParcelas = parcelas || [];
  const safeUbicaciones = ubicacionesEspeciales || [];

  const isLoading = loadingParcelas || loadingUbicaciones;

  const { user } = useAuth();
  const [apiKey] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  );
  const [modalAdd, setModalAdd] = useState(false);

  // Estados de UI y Filtros
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

  const [filtroMunicipio, setFiltroMunicipio] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtrosAreas, setFiltrosAreas] = useState<string[]>([]);
  const [filtrosActividades, setFiltrosActividades] = useState<string[]>([]);

  // Configuración de Capas
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
        : [...prev, layerId]
    );
  };

  const toggleFilter = (
    item: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((orev) =>
      orev.includes(item) ? orev.filter((i) => i !== item) : [...orev, item]
    );
  };

  const abrirGoogleMaps = (lat: number, lng: number) => {
    if (!lat || !lng) return;
    // URL estándar para intents de Google Maps
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const getCoordsFromItem = (item: IParcela | IUbicacionEspecial) => {
    if (!item) return { lat: 0, lng: 0 };
    if (isParcela(item)) return item.coordenadas?.[0] || { lat: 0, lng: 0 };
    return item.coordenadas || { lat: 0, lng: 0 };
  };

  // ==================== COMPUTED DATA (MEMOS) ====================
  // Usamos siempre 'safeParcelas' y 'safeUbicaciones' para garantizar arrays

  const municipiosDisponibles = useMemo(() => {
    const todas = [...safeParcelas, ...safeUbicaciones];
    return Array.from(
      new Set(todas.map((e) => e?.municipio || "Sin Municipio"))
    ).sort();
  }, [safeParcelas, safeUbicaciones]);

  const areasDisponibles = useMemo(() => {
    const areas = new Set<string>();
    safeParcelas.forEach((p) =>
      p?.usos?.forEach((u) => u?.area && areas.add(u.area))
    );
    return Array.from(areas).sort();
  }, [safeParcelas]);

  const actividadesDisponibles = useMemo(() => {
    const acts = new Set<string>();
    safeParcelas.forEach((p) =>
      p?.usos?.forEach((u) =>
        u?.actividadesEspecificas?.forEach((a) => acts.add(a))
      )
    );
    return Array.from(acts).sort();
  }, [safeParcelas]);

  // FILTRADO PRINCIPAL
  const cumpleFiltrosBase = (entidad: IParcela | IUbicacionEspecial) => {
    if (!entidad) return false;
    const matchSearch = (entidad.nombre || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchMunicipio =
      filtroMunicipio === "todos" || entidad.municipio === filtroMunicipio;
    return matchSearch && matchMunicipio;
  };

  const parcelasFiltradas = useMemo(() => {
    // Si no hay datos, retornamos array vacío rápido
    if (safeParcelas.length === 0) return [];

    return safeParcelas.filter((p) => {
      if (!cumpleFiltrosBase(p)) return false;

      // Safe access a usos
      const usos = p.usos || [];

      // Filtro Areas
      const cumpleArea =
        filtrosAreas.length === 0 ||
        usos.some((u) => filtrosAreas.includes(u.area));

      // Filtro Actividades
      const cumpleActividad =
        filtrosActividades.length === 0 ||
        usos.some((u) =>
          u.actividadesEspecificas?.some((act) => filtrosActividades.includes(act))
        );

      // Filtro Fecha
      let matchFecha = true;
      if (p.fechaRegistro) {
        const fecha = new Date(p.fechaRegistro);
        if (!isNaN(fecha.getTime())) {
          if (filtroFechaDesde)
            matchFecha = matchFecha && fecha >= new Date(filtroFechaDesde);
          if (filtroFechaHasta)
            matchFecha = matchFecha && fecha <= new Date(filtroFechaHasta);
        }
      }

      return cumpleArea && cumpleActividad && matchFecha;
    });
  }, [
    safeParcelas,
    searchTerm,
    filtroMunicipio,
    filtrosAreas,
    filtrosActividades,
    filtroFechaDesde,
    filtroFechaHasta,
  ]);

  const centrosAcopioFiltrados = useMemo(
    () =>
      safeUbicaciones.filter((u) => {
        return (
          (u.tipo === "centro_acopio" || u.tipo === "mercado_local") &&
          cumpleFiltrosBase(u)
        );
      }),
    [safeUbicaciones, searchTerm, filtroMunicipio]
  );

  const sedesGobiernoFiltradas = useMemo(
    () =>
      safeUbicaciones.filter((u) => {
        return u.tipo === "sede_gobierno" && cumpleFiltrosBase(u);
      }),
    [safeUbicaciones, searchTerm, filtroMunicipio]
  );

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroMunicipio("todos");
    setFiltrosAreas([]);
    setFiltrosActividades([]);
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setSelectedItem(null);
  };

  const stats = {
    total:
      parcelasFiltradas.length +
      centrosAcopioFiltrados.length +
      sedesGobiernoFiltradas.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-green-600 font-medium mb-2 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" /> Volver
      </button>

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-8 h-8 text-green-600" /> Geomapa Agropecuario
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualización de productores, biofábricas y dependencias estatales.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold">
                Resultados:
              </span>
              <span className="font-bold text-green-600 text-lg">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  stats.total
                )}
              </span>
            </div>
            
            {user?.Tipo === "Administracion" && (
              <button
                onClick={() => setModalAdd(!modalAdd)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Ubicación
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ============ COLUMNA IZQUIERDA (FILTROS) ============ */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Detalle Item Seleccionado */}
            {selectedItem && (
              <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500 animate-fade-in">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 pr-2 truncate">
                    {selectedItem.nombre}
                  </h3>
                  <button onClick={() => setSelectedItem(null)}>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  {selectedItem.municipio}
                </p>

                <div className="mt-3">
                  <button
                    onClick={() => {
                      const c = getCoordsFromItem(selectedItem);
                      abrirGoogleMaps(c.lat, c.lng);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Ir a Google Maps
                  </button>
                </div>
              </div>
            )}

            {/* Panel de Filtros (Deshabilitado si carga) */}
            <div 
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto custom-scrollbar transition-opacity ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
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
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Búsqueda Global</label>
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
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Municipio</label>
                  <select
                    value={filtroMunicipio}
                    onChange={(e) => setFiltroMunicipio(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="todos">Todos los municipios</option>
                    {municipiosDisponibles.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Áreas */}
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-2 block flex justify-between">
                     Áreas
                     {filtrosAreas.length > 0 && <span className="text-[10px] bg-gray-100 px-2 rounded-full">{filtrosAreas.length}</span>}
                   </label>
                   <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-1 bg-gray-50/50">
                      {areasDisponibles.length === 0 ? (
                         <p className="text-xs text-gray-400 p-2 text-center italic">Sin datos</p>
                      ) : (
                        areasDisponibles.map((area) => (
                          <CheckboxItem
                            key={area}
                            label={area}
                            checked={filtrosAreas.includes(area)}
                            onChange={() => toggleFilter(area, setFiltrosAreas)}
                          />
                        ))
                      )}
                   </div>
                </div>

                 {/* Actividades (Simplificado para el ejemplo, misma lógica que Áreas) */}
                 {/* ... */}
              </div>
            </div>
            
            {/* Control de Capas */}
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
                     <div className={`w-3 h-3 rounded-full border ${activeLayers.includes(c.id) ? c.color : "bg-transparent"}`}></div>
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* ============ COLUMNA DERECHA (MAPA Y RESULTADOS) ============ */}
          <div className="lg:col-span-9">
            
            {/* CONTENEDOR DEL MAPA (Siempre Visible) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 h-[600px] relative overflow-hidden group">
              
              <GeoMapa
                apiKey={apiKey}
                parcelas={parcelasFiltradas} // Inicialmente [] si loading, luego data real
                centrosAcopio={centrosAcopioFiltrados}
                sedesGobierno={sedesGobiernoFiltradas}
                activeLayers={activeLayers}
                onItemClick={setSelectedItem}
              />

              {/* Indicador de Carga sobre el Mapa (No intrusivo) */}
              {isLoading && (
                 <div className="absolute top-4 right-4 z-50 animate-fade-in-down">
                    <div className="bg-white/90 backdrop-blur border border-green-100 shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
                       <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                       <span className="text-xs font-bold text-gray-700">Cargando puntos...</span>
                    </div>
                 </div>
              )}
              
              {/* Leyenda fija abajo a la derecha */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow border text-xs flex gap-4 pointer-events-none">
                 {/* ... Items de leyenda (igual que antes) ... */}
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Parcelas</div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Biofábricas</div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-800"></span> Gobierno</div>
              </div>

            </div>

            {/* LISTA HORIZONTAL DE RESULTADOS */}
            <div className="mt-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide min-h-[120px]">
              
              {/* CASO 1: Cargando -> Skeleton */}
              {isLoading ? (
                <HorizontalListSkeleton />
              ) : (
                /* CASO 2: Data cargada */
                <>
                   {/* Mensaje si no hay resultados */}
                   {stats.total === 0 && (
                      <div className="w-full flex flex-col items-center justify-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                         <MapPinOff className="w-8 h-8 mb-2 opacity-50" />
                         <span className="text-sm font-medium">No hay ubicaciones en esta selección</span>
                      </div>
                   )}

                   {/* Lista de Parcelas */}
                   {parcelasFiltradas.map((p) => (
                     <div
                       key={p.id}
                       onClick={() => setSelectedItem(p)}
                       className={`min-w-[200px] bg-white p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${selectedItem?.id === p.id ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-200'}`}
                     >
                       <div className="flex justify-between mb-1">
                         <span className="text-lg">🌾</span>
                         <span className="text-[10px] bg-gray-100 px-2 rounded-full h-fit py-0.5 max-w-[100px] truncate">
                           {p.municipio}
                         </span>
                       </div>
                       <p className="font-bold text-sm truncate">{p.nombre}</p>
                       <p className="text-xs text-gray-500 mt-1">{p.usos?.[0]?.area || 'Sin área'}</p>
                     </div>
                   ))}

                   {/* Lista de Otros */}
                   {[...sedesGobiernoFiltradas, ...centrosAcopioFiltrados].map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedItem(c)}
                        className={`min-w-[200px] bg-white p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${selectedItem?.id === c.id ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-200'}`}
                      >
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-lg">{c.tipo === 'sede_gobierno' ? '🏛️' : '🏭'}</span>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 truncate max-w-[100px]">
                              {c.institucion || 'Entidad'}
                            </span>
                         </div>
                         <p className="font-bold text-sm truncate">{c.nombre}</p>
                         <p className="text-xs text-gray-500">{c.municipio}</p>
                      </div>
                   ))}
                </>
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