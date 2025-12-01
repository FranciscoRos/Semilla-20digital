import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  ChevronLeft, CheckCircle, AlertCircle, ArrowRight, Info, 
  MapPin, Calendar, ExternalLink, Building2, Search, Filter, 
  X, Sprout, Leaf, AlertTriangle, Map as MapIcon,
  RefreshCcw
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';

// Asumiendo rutas de tus hooks
import { useAuth } from "@/providers/authProvider";
import { useProducerRegister } from "@/hooks/useRegisterProducer";
import { useApoyos } from "@/hooks/useApoyos";
import { useInscripciones } from "@/hooks/useInscripciones";
import LoadingSDloading from "@/components/loadingSDloading";
import { Apoyo } from "@/services/ApoyoService";
import PaginatorPages from "@/components/paginatorPages";

// --- UTILS & HELPERS ---

const formatDate = (dateString) => {
  if (!dateString) return "No definida";
  const fecha = new Date(dateString + "T00:00:00"); 
  return fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
};

// Calcula el centro del polígono para centrar el mapa
const calculatePolygonCenter = (coords) => {
  if (!coords || coords.length === 0) return { lat: 19.4326, lng: -99.1332 }; // Default CDMX
  
  let latSum = 0;
  let lngSum = 0;
  coords.forEach(c => {
    latSum += c.lat;
    lngSum += c.lng;
  });
  
  return {
    lat: latSum / coords.length,
    lng: lngSum / coords.length
  };
};

/**
 * Función principal de validación.
 * Retorna:
 * - globalValid: Si el usuario cumple perfil (edad, genero, etc).
 * - globalErrors: Lista de requisitos de perfil no cumplidos.
 * - eligibleParcels: Lista filtrada de parcelas que cumplen requisitos de tierra.
 * - parcelErrors: Errores generales si no hay parcelas.
 */
const analyzeEligibility = (usuario, requerimientos) => {
  if (!usuario) return { globalValid: false, globalErrors: ["Usuario no identificado"], eligibleParcels: [] };
  if (!requerimientos || requerimientos.length === 0) {
    return { globalValid: true, globalErrors: [], eligibleParcels: usuario.Parcela || [] };
  }

  const globalErrors = [];
  const parcelReqs = [];

  // 1. Separar requisitos globales vs parcelas
  requerimientos.forEach(regla => {
    if (regla.type === "regla_pregunta") {
      const respuestaUsuario = usuario[regla.fieldName];
      const { operator, value } = regla.validation;
      let passed = false;

      // Validación simple
      if (respuestaUsuario !== undefined && respuestaUsuario !== null && respuestaUsuario !== "") {
        const numUser = Number(respuestaUsuario);
        const numVal = Number(value);
        const isNumber = !isNaN(numUser) && !isNaN(numVal);

        if (operator === 'igual') passed = String(respuestaUsuario) === String(value);
        else if (operator === 'mayor') passed = isNumber ? numUser > numVal : false;
        else if (operator === 'menor') passed = isNumber ? numUser < numVal : false;
        else if (Array.isArray(value)) passed = value.includes(respuestaUsuario);
      }

      if (!passed) {
        globalErrors.push(`Requisito no cumplido: ${regla.descripcion || regla.fieldName} (${operator} ${value})`);
      }
    } else if (regla.type === "regla_parcela") {
      parcelReqs.push(regla);
    }
  });

  // 2. Filtrar parcelas si pasamos los globales
  let eligibleParcels = [];
  if (globalErrors.length === 0 && usuario.Parcela) {
    eligibleParcels = usuario.Parcela.filter(parcela => {
      // Debe cumplir TODAS las reglas de parcela
      return parcelReqs.every(regla => {
        const { areas, actividades, hectareas } = regla.config;
        
        // Check Areas
        if (areas && areas.length > 0) {
          const areasParcela = (parcela.usos || []).map(u => u.area);
          if (!areasParcela.some(a => areas.includes(a))) return false;
        }
        // Check Actividades
        if (actividades && actividades.length > 0) {
          const actividadesParcela = (parcela.usos || []).flatMap(u => u.actividadesEspecificas || []);
          if (!actividadesParcela.some(act => actividades.includes(act))) return false;
        }
        // Check Hectareas
        if (hectareas && hectareas.habilitado) {
          const areaParcela = Number(parcela.area) || 0;
          const { min, max, tipo, operador } = hectareas;
          const op = operador || tipo;
          const minVal = Number(min);
          const maxVal = Number(max);
          
          if (op === 'mayor' && areaParcela <= minVal) return false;
          if (op === 'menor' && areaParcela >= minVal) return false;
          if (op === 'entre' && (areaParcela < minVal || areaParcela > maxVal)) return false;
        }
        return true;
      });
    });
  }

  return {
    globalValid: globalErrors.length === 0,
    globalErrors,
    eligibleParcels
  };
};

// --- COMPONENTE MAPA (GOOGLE MAPS) ---
const ParcelMap = ({ coordinates }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const center = useMemo(() => calculatePolygonCenter(coordinates), [coordinates]);
  
  // Opciones del mapa para que se vea limpio
  const mapOptions = {
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
  };

  // Opciones del polígono
  const polygonOptions = {
    fillColor: "#16a34a", // green-600
    fillOpacity: 0.4,
    strokeColor: "#15803d", // green-700
    strokeWeight: 2,
  };

  if (!isLoaded) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Cargando Mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
      center={center}
      zoom={15}
      options={mapOptions}
    >
      {coordinates && coordinates.length > 0 && (
        <Polygon
          paths={coordinates}
          options={polygonOptions}
        />
      )}
    </GoogleMap>
  );
};

// --- MODAL DE DETALLES Y SELECCIÓN ---
const ApoyoModal = ({ isOpen, onClose, apoyo, usuario, onSubmit }) => {
  const [analysis, setAnalysis] = useState({ globalValid: false, globalErrors: [], eligibleParcels: [] });
  const [selectedParcelId, setSelectedParcelId] = useState("");

  // Analizar requisitos cuando se abre el modal
  useEffect(() => {
    if (isOpen && apoyo && usuario) {
      const result = analyzeEligibility(usuario, apoyo.Requerimientos);
      setAnalysis(result);
      setSelectedParcelId(""); // Resetear selección
    }
  }, [isOpen, apoyo, usuario]);

  const selectedParcel = useMemo(() => {
    return analysis.eligibleParcels.find(p => p.idParcela === selectedParcelId);
  }, [selectedParcelId, analysis.eligibleParcels]);

  if (!isOpen || !apoyo) return null;

  const canSubmit = analysis.globalValid && selectedParcelId !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
          <div>
            <span className="text-[10px] font-bold text-green-600 bg-white border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
              {apoyo.tipo_objetivo}
            </span>
            <h2 className="text-xl font-bold text-gray-800">{apoyo.nombre_programa}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-0 grid grid-cols-1 lg:grid-cols-2">
          
          {/* Columna Izquierda: Info y Requisitos */}
          <div className="p-6 space-y-6 border-r border-gray-100">
            
            {/* Descripción */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-green-600" /> Información General
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{apoyo.descripcion}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Institución</span>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {apoyo.institucion_acronimo}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Cierre de Convocatoria</span>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(apoyo.fechaFin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Requisitos Globales */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Validación de Perfil
              </h3>
              
              {analysis.globalValid ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Perfil Compatible</p>
                    <p className="text-xs text-green-700">Cumples con los requisitos generales (Edad, ubicación, género, etc).</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-bold text-red-800">Requisitos no cumplidos</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.globalErrors.map((err, i) => (
                      <li key={i} className="text-xs text-red-700">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Selección de Parcela y Mapa */}
          <div className="p-6 bg-gray-50/50 flex flex-col h-full">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-600" /> Selección de Parcela
            </h3>

            {/* Selector Lógica */}
            {!analysis.globalValid ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <AlertTriangle className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Debes cumplir los requisitos de perfil antes de seleccionar una parcela.</p>
              </div>
            ) : analysis.eligibleParcels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-red-200 rounded-xl bg-white">
                <Leaf className="w-10 h-10 text-red-200 mb-2" />
                <p className="text-red-600 font-bold mb-1">Sin parcelas elegibles</p>
                <p className="text-gray-500 text-xs">Tienes el perfil correcto, pero ninguna de tus parcelas cumple con las reglas específicas (Cultivo, Área o Tamaño).</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Selecciona la parcela a inscribir:</label>
                  <select 
                    value={selectedParcelId}
                    onChange={(e) => setSelectedParcelId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
                  >
                    <option value="">-- Seleccionar Parcela --</option>
                    {analysis.eligibleParcels.map(p => (
                      <option key={p.idParcela} value={p.idParcela}>
                        {p.nombre || `Parcela en ${p.municipio}`} - {p.area} ha
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contenedor del Mapa */}
                <div className="flex-1 min-h-[300px] bg-white rounded-xl border border-gray-200 shadow-inner overflow-hidden relative group">
                  {selectedParcel ? (
                    <>
                       <ParcelMap coordinates={selectedParcel.coordenadas} />
                       <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 text-xs shadow-sm">
                          <p className="font-bold text-gray-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-green-600"/> {selectedParcel.municipio}, {selectedParcel.localidad}
                          </p>
                          <p className="text-gray-500 truncate">{selectedParcel.direccionAdicional}</p>
                       </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                      <MapIcon className="w-12 h-12 opacity-20 mb-2" />
                      <p className="text-sm">Selecciona una parcela para ver su ubicación</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit({id:apoyo.id,body:{
            parcelaId:selectedParcelId
            }})}
            disabled={!canSubmit}
            className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all
              ${canSubmit 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-green-500/30 hover:-translate-y-0.5' 
                : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
          >
            Confirmar Solicitud <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SolicitarApoyos() {
  const {handleInscripcionApoyo,loading}=useInscripciones(()=>handleCloseModal())
  const { user } = useAuth();
  const location=useLocation()
  const navigate = useNavigate();
  
  // Estado para el Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApoyo, setSelectedApoyo] = useState(null);

  const { dataRegistro, loadingRegistro } = useProducerRegister(user); 
  const { dataApoyos, loadingApoyos,refetch } = useApoyos();
  const [dataPaginate,setPaginateData]=useState<Apoyo[]>([])

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  useEffect(() => {
      if (dataApoyos && location.state?.apoyoId) {
        const idRecibido = location.state.apoyoId;
        const apoyoEncontrado = dataApoyos.find(dc => dc.id === idRecibido);
        if (apoyoEncontrado) {
          handleOpenDetails(apoyoEncontrado);
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    }, [location, dataApoyos, navigate]);

  // Handler para abrir modal
  const handleOpenDetails = (apoyo) => {
    setSelectedApoyo(apoyo);
    setModalOpen(true);
  };

  const handleCloseModal=()=>{
    setModalOpen(false)
    setSelectedApoyo(null)
  }

  const { apoyosParaTi, todosLosApoyos } = useMemo(() => {
    if (!dataApoyos) return { apoyosParaTi: [], todosLosApoyos: [] };

    const filterBySearchAndDate = (apoyo) => {
        const term = searchTerm.toLowerCase();
        const matchesText = 
            apoyo.nombre_programa.toLowerCase().includes(term) ||
            apoyo.institucion_encargada?.toLowerCase().includes(term) ||
            apoyo.institucion_acronimo?.toLowerCase().includes(term);

        if (!matchesText) return false;

        if (filterDate) {
            const dateSelected = new Date(filterDate);
            const created = new Date(apoyo.Creado);
            const updated = new Date(apoyo.Actualizado);
            if (created < dateSelected && updated < dateSelected) return false;
        }

        return true;
    };

    const baseFilteredApoyos = dataApoyos.filter(filterBySearchAndDate);

    // Si no hay registro, solo devolvemos catálogo
    if (!dataRegistro) {
        return { 
            apoyosParaTi: [], 
            todosLosApoyos: baseFilteredApoyos 
        };
    }

    // Usamos la nueva función de análisis solo para ver si es "elegible" visualmente en la lista
    // Nota: El análisis detallado se hace al abrir el modal
    const eligible = baseFilteredApoyos.filter(apoyo => {
      const result = analyzeEligibility({...dataRegistro.Usuario,...dataRegistro.CamposExtra}, apoyo.Requerimientos);
      return result.globalValid && result.eligibleParcels.length > 0;
    });

    return {
      apoyosParaTi: eligible,
      todosLosApoyos: baseFilteredApoyos
    };
  }, [dataApoyos, dataRegistro, searchTerm, filterDate]);

  const isLoading = loadingApoyos || loadingRegistro;
  const hasActiveFilters = searchTerm !== "" || filterDate !== "";

  return (
    <div className="min-h-screen bg-green-50/30 pb-20 font-sans">
      {loading &&
        <LoadingSDloading></LoadingSDloading>
      } 
      {/* MODAL */}
      <ApoyoModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        apoyo={selectedApoyo}
        usuario={dataRegistro?{...dataRegistro.Usuario,...dataRegistro.CamposExtra}:undefined}
        onSubmit={handleInscripcionApoyo}
      />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 border-b border-green-100">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">Volver</span>
                </button>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Sprout className="w-6 h-6 text-green-600" />
                    Apoyos y Subsidios
                </h1>
                <div className="w-10 sm:w-20"></div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar apoyo, institución o cultivo..." 
                        className="w-full pl-10 pr-4 py-2 bg-green-50/50 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder-green-700/40 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Calendar className="w-4 h-4 text-gray-500" />
                          </div>
                          <input 
                            type="date" 
                            className="pl-10 pr-3 py-2 bg-green-50/50 border border-green-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                          />
                    </div>
                    
                    {(searchTerm || filterDate) && (
                        <button 
                            onClick={() => { setSearchTerm(""); setFilterDate(""); }}
                            className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
                <button 
                  onClick={()=>refetch()}
                  className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-green-600 transition-colors shadow-sm"
                  title="Actualizar lista"
              >
                  <RefreshCcw className="w-4 h-4"/>
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        
        {/* SECCIÓN 1: PARA TI (Apoyos Sugeridos) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-none">Recomendados para Ti</h2>
              {!isLoading && dataRegistro && (
                <p className="text-xs text-gray-500 mt-1">
                  Hola <span className="font-medium text-green-700 capitalize">{user.Nombre}</span>, estos apoyos son compatibles con tus parcelas.
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
               {[1, 2, 3].map(i => (
                 <div key={i} className="min-w-[85vw] md:min-w-[350px] h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
               ))}
            </div>
          ) : !dataRegistro ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Info className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900 text-lg mb-2">Perfil Incompleto</h3>
              <p className="text-green-700 mb-6 max-w-lg mx-auto text-sm">
                Necesitamos conocer tus datos de censo y parcelas para recomendarte apoyos específicos.
              </p>
              <button onClick={()=>navigate("/registro")} className="bg-green-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
                Ir a Mi Perfil <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          ) : apoyosParaTi.length > 0 ? (
            <div className="relative group">
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pt-2">
                {apoyosParaTi.map((apoyo) => (
                  <div 
                    key={apoyo.id}
                    className="snap-center shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] bg-gradient-to-br from-green-700 to-emerald-900 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group/card border border-green-600/30"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-12 -mt-12 blur-3xl group-hover/card:opacity-10 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-5">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1 text-green-50">
                          <CheckCircle className="w-3 h-3" /> 100% Compatible
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 leading-tight tracking-tight">{apoyo.nombre_programa}</h3>
                      <p className="text-green-100 text-sm line-clamp-3 mb-6 font-medium leading-relaxed opacity-90">
                        {apoyo.objetivo}
                      </p>
                      
                      <div className="space-y-2 text-xs text-green-50/90 mb-6 bg-black/10 p-3 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Cierra: <span className="font-semibold">{formatDate(apoyo.fechaFin)}</span></span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{apoyo.institucion_acronimo}</span>
                          </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenDetails(apoyo)}
                      className="relative z-10 w-full bg-white text-green-900 font-bold py-3.5 rounded-xl hover:bg-green-50 transition shadow-lg flex items-center justify-center gap-2 group-hover/card:gap-3"
                    >
                      Solicitar Ahora <ArrowRight className="w-4 h-4 transition-transform group-hover/card:translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-green-200 rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <Leaf className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">
                {hasActiveFilters ? "Sin resultados" : "Sin coincidencias directas"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">
                {hasActiveFilters 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "No encontramos parcelas en tu registro que cumplan con los requisitos específicos, pero puedes explorar el catálogo."
                }
              </p>
              {!hasActiveFilters && (
                  <button onClick={()=>navigate("/registro")} className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-700 transition shadow-sm hover:shadow-md">
                    Ir a Mi Perfil
                  </button>
              )}
            </div>
          )}
        </section>


        {/* SECCIÓN 2: CATÁLOGO COMPLETO */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-green-100">
            <h2 className="text-xl font-bold text-gray-900">Catálogo Completo</h2>
            <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {todosLosApoyos?.length || 0}
            </span>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4].map(n => <div key={n} className="h-72 bg-gray-100 rounded-xl animate-pulse"></div>)}
             </div>
          ) : todosLosApoyos.length > 0 ? (
            <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataPaginate.map((apoyo) => {
                // Cálculo rápido solo para el badge
                const { globalValid, eligibleParcels } = dataRegistro ? analyzeEligibility(dataRegistro, apoyo.Requerimientos) : { globalValid: false, eligibleParcels: [] };
                const isTotallyEligible = globalValid && eligibleParcels.length > 0;

                return (
                  <div 
                    key={apoyo.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden"
                  >
                    {isTotallyEligible && (
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Recomendado
                        </div>
                    )}

                    <div className="p-6 flex-1 pt-8">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {apoyo.institucion_acronimo}
                        </div>
                        
                        <span className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-100">
                            {apoyo.tipo_objetivo}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-green-700 transition-colors">
                        {apoyo.nombre_programa}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed">
                        {apoyo.descripcion}
                      </p>

                      <div className="flex gap-4 mb-3 text-xs text-gray-400 items-center">
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-700 font-medium">
                             <Calendar className="w-3 h-3" />
                             {formatDate(apoyo.fechaFin)}
                          </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30 rounded-b-xl flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Info className="w-3 h-3"/> Ver detalles
                      </div>
                      <button 
                        onClick={() => handleOpenDetails(apoyo)}
                        className="text-sm font-bold text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
                      >
                        Solicitar <ChevronLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
               <PaginatorPages 
                  dataxFiltrar={todosLosApoyos}
                  ITEMS={9}
                  changeDatos={(dt) => setPaginateData(dt)}
                />
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay apoyos que coincidan con tu búsqueda.</p>
                <button 
                    onClick={() => { setSearchTerm(""); setFilterDate(""); }}
                    className="mt-2 text-green-600 font-medium hover:underline text-sm"
                >
                    Limpiar filtros
                </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}