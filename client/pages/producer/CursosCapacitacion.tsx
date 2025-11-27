import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, CheckCircle, Sparkles, ArrowRight, Info, 
  MapPin, Calendar, ExternalLink, Search, Filter, X, 
  BookOpen, GraduationCap, Clock, Building2, AlertTriangle, AlertCircle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Hooks
import { useAuth } from "@/providers/authProvider";
import { useCursos } from "@/hooks/useCursos";
import { useInscripciones } from "@/hooks/useInscripciones";
import LoadingSDloading from "@/components/loadingSDloading";

// --- UTILS ---
const formatDate = (fechaArray) => {
  if (!fechaArray || fechaArray.length === 0) return "Por definir";
  const dateString = fechaArray[0];
  const fecha = new Date(dateString + "T00:00:00");
  return fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
};

// --- COMPONENTE MAPA (GOOGLE MAPS) ---
const CourseMap = ({ lat, lng }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const center = useMemo(() => ({ lat: Number(lat), lng: Number(lng) }), [lat, lng]);
  
  const mapOptions = {
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
  };

  if (!isLoaded) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Cargando Mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
      center={center}
      zoom={15}
      options={mapOptions}
    >
      <Marker position={center} />
    </GoogleMap>
  );
};

// --- MODAL DE DETALLES DEL CURSO ---
const CursoModal = ({ isOpen, onClose, curso, user, onSubmit }) => {
  if (!isOpen || !curso) return null;

  // Lógica de Validación Simplificada dentro del Modal
  const eligibilityAnalysis = useMemo(() => {
    // 1. Si no hay tema o es General, es válido para todos
    if (!curso.Tema || curso.Tema === "General") {
      return { eligible: true, reason: "Este curso está abierto al público general." };
    }

    // 2. Si el usuario no tiene usos registrados
    if (!user?.Usos || user.Usos.length === 0) {
      return { eligible: false, reason: "Necesitas registrar tus actividades productivas en tu perfil." };
    }

    // 3. Verificar coincidencia de tema
    const temaCurso = curso.Tema.toLowerCase();
    const tieneTema = user.Usos.some(u => u.UsoGeneral.toLowerCase() === temaCurso);

    if (tieneTema) {
      return { eligible: true, reason: `Tu perfil de productor de ${curso.Tema} es compatible.` };
    }

    return { 
      eligible: false, 
      reason: `Este curso es exclusivo para productores de ${curso.Tema}. Tu perfil actual no incluye esta actividad.` 
    };
  }, [curso, user]);

   const hasLocation = curso.Latitud !== null && curso.Latitud !== undefined && 
                      curso.Longitud !== null && curso.Longitud !== undefined;
                     
  const isExternal = !!curso.Url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
          <div>
            <span className="text-[10px] font-bold text-rose-600 bg-white border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
              {curso.Modalidad}
            </span>
            <h2 className="text-xl font-bold text-gray-800">{curso.Titulo}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2">
          
          {/* Columna Izquierda: Detalles */}
          <div className="p-6 space-y-6 border-r border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-600" /> Descripción
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{curso.Descripcion}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Tema Principal</span>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {curso.Tema || "General"}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Fecha de Inicio</span>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(curso.FechaCurso)}
                  </span>
                </div>
              </div>
            </div>

            {/* Validación Visual */}
            <div className={`rounded-xl p-4 border ${eligibilityAnalysis.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${eligibilityAnalysis.eligible ? 'text-green-800' : 'text-red-800'}`}>
                {eligibilityAnalysis.eligible ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                {eligibilityAnalysis.eligible ? "Eres Elegible" : "Requisitos no cumplidos"}
              </h3>
              <p className={`text-xs ${eligibilityAnalysis.eligible ? 'text-green-700' : 'text-red-700'}`}>
                {eligibilityAnalysis.reason}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Mapa */}
          <div className="p-6 bg-gray-50/50 flex flex-col h-full min-h-[300px]">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" /> Ubicación
              </h3>
              
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                {hasLocation ? (
                  <>
                    <CourseMap lat={curso.Latitud} lng={curso.Longitud} />
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-200 text-xs shadow-md">
                      <p className="font-bold text-gray-800">{curso.DireccionUbicacion}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                    <div className="bg-gray-100 p-4 rounded-full mb-3 border border-gray-200">
                        <MapPin className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-600">No cuenta con ubicación geográfica</p>
                    <p className="text-xs text-gray-400 mt-1 text-center px-6">
                        {curso.DireccionUbicacion 
                            ? `Dirección: ${curso.DireccionUbicacion}` 
                            : "No hay una ubicacion concreta registrada para este curso."}
                    </p>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition"
          >
            Cerrar
          </button>
           <button
              onClick={() =>onSubmit(curso.id)}
              disabled={!eligibilityAnalysis.eligible}
              className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all
                ${eligibilityAnalysis.eligible 
                  ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/30 hover:-translate-y-0.5' 
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
            >
              {isExternal?"Guardar en Historial":"Inscribirme Ahora"} <ArrowRight className="w-4 h-4" />
            </button>
          {isExternal && (
             <a 
               href={curso.Url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center gap-2 transition-all"
             >
               Ir al sitio web <ExternalLink className="w-4 h-4" />
             </a>
          )} 
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function SolicitarCursos() {
  const {handleInscripcionCurso,loading}=useInscripciones(()=>handleCloseModal())
  const { user } = useAuth();
  const navigate = useNavigate();
  const location=useLocation()
  const { dataCursos, loadingCursos } = useCursos();

  // Estados del Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (dataCursos && location.state?.cursoId) {
      const idRecibido = location.state.cursoId;
      const cursoEncontrado = dataCursos.find(dc => dc.id === idRecibido);
      if (cursoEncontrado) {
        handleOpenModal(cursoEncontrado);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, dataCursos, navigate]);

  const handleOpenModal = (curso) => {
    setSelectedCurso(curso);
    setModalOpen(true);
  };
  const handleCloseModal=()=>{
    setModalOpen(false)
    setSelectedCurso(null)
  }
  // --- MOTOR DE REGLAS (Lógica de filtrado para la lista) ---
  const checkListEligibility = (usuarioUsos, tema) => {
    if (!tema || tema === "General") return true;
    if (!usuarioUsos || usuarioUsos.length === 0) return false;
    const temaLower = tema.toLowerCase();
    return usuarioUsos.some(uu => uu.UsoGeneral.toLowerCase() === temaLower);
  };

  const { cursosParaTi, todosLosCursos } = useMemo(() => {
    if (!dataCursos) return { cursosParaTi: [], todosLosCursos: [] };

    // Filtro de Búsqueda y Fecha
    const filterBySearchAndDate = (curso) => {
        const term = searchTerm.toLowerCase();
        const matchesText = 
            curso.Titulo?.toLowerCase().includes(term) ||
            curso.Descripcion?.toLowerCase().includes(term) ||
            curso.Tema?.toLowerCase().includes(term) ||
            curso.DireccionUbicacion?.toLowerCase().includes(term);

        if (!matchesText) return false;

        if (filterDate) {
            const dateSelected = new Date(filterDate);
            const created = new Date(curso.Creado);
            const updated = new Date(curso.Actualizado);
            if (created < dateSelected && updated < dateSelected) return false;
        }
        return true;
    };

    const baseFilteredCursos = dataCursos.filter(filterBySearchAndDate);

    // Lógica "Para Ti" (Lista sugerida)
    const usuarioUsos = user.Usos; 

    if (!usuarioUsos || usuarioUsos.length === 0) {
        return { 
            cursosParaTi: [], 
            todosLosCursos: baseFilteredCursos 
        };
    }

    const eligible = baseFilteredCursos.filter(curso => 
      checkListEligibility(usuarioUsos, curso.Tema)
    );

    return {
      cursosParaTi: eligible,
      todosLosCursos: baseFilteredCursos
    };
  }, [dataCursos, searchTerm, filterDate, user]);

  const isLoading = loadingCursos;
  const hasActiveFilters = searchTerm !== "" || filterDate !== "";
  const nombreUsuario = user.Nombre || "Productor";
  const usuarioUsos = user.Usos;

  return (
    <div className="min-h-screen bg-rose-50/30 pb-20 font-sans">
      {loading &&
      <LoadingSDloading></LoadingSDloading>
      } 
      {/* MODAL INTEGRADO */}
      <CursoModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        curso={selectedCurso}
        user={user}
        onSubmit={handleInscripcionCurso}
      />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 border-b border-rose-100">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-rose-700 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">Volver</span>
                </button>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-rose-700" />
                    Capacitación
                </h1>
                <div className="w-10 sm:w-20"></div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar curso, tema o ubicación..." 
                        className="w-full pl-10 pr-4 py-2 bg-rose-50/50 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all placeholder-rose-300/70 text-gray-700"
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
                            className="pl-10 pr-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                          />
                    </div>
                    
                    {(searchTerm || filterDate) && (
                        <button 
                            onClick={() => { setSearchTerm(""); setFilterDate(""); }}
                            className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        
        {/* SECCIÓN 1: PARA TI */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-rose-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-none">Recomendados para Ti</h2>
              {!isLoading && usuarioUsos && (
                <p className="text-xs text-gray-500 mt-1">
                  Hola <span className="font-medium text-rose-700 capitalize">{nombreUsuario}</span>, basados en tu perfil: <span className="italic">{usuarioUsos.map(u => u.UsoGeneral).join(", ")}</span>
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
          ) : (!usuarioUsos || usuarioUsos.length === 0) ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center flex flex-col items-center">
              <div className="bg-rose-100 p-3 rounded-full mb-4">
                <Info className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-bold text-rose-900 text-lg mb-2">Perfil Incompleto</h3>
              <p className="text-rose-700 mb-6 max-w-lg mx-auto text-sm">
                No sabemos a qué te dedicas. Completa tu perfil para recomendarte cursos específicos.
              </p>
              <button onClick={()=>navigate("/registro")} className="bg-rose-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-rose-700 transition shadow-sm hover:shadow-md">
                Ir a Mi Perfil
              </button>
            </div>
          ) : cursosParaTi.length > 0 ? (
            <div className="relative group">
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pt-2">
                {cursosParaTi.map((curso) => (
                  <div 
                    key={curso.id}
                    className="snap-center shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] bg-gradient-to-br from-rose-700 to-pink-900 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group/card border border-rose-600/30"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-12 -mt-12 blur-3xl group-hover/card:opacity-10 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-300" /> Sugerido
                        </span>
                        <span className="text-xs font-semibold bg-rose-900/40 px-2 py-1 rounded text-rose-100 border border-rose-800/50 capitalize">
                            {curso.Modalidad}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2 leading-tight tracking-tight">{curso.Titulo}</h3>
                      <p className="text-rose-100 text-sm line-clamp-3 mb-5 font-medium leading-relaxed opacity-90">
                        {curso.Descripcion}
                      </p>
                      
                      <div className="space-y-2 text-xs text-rose-50/90 mb-6 bg-black/10 p-3 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Inicio: <span className="font-semibold">{formatDate(curso.FechaCurso)}</span></span>
                          </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenModal(curso)}
                      className="relative z-10 w-full bg-white text-rose-900 font-bold py-3.5 rounded-xl hover:bg-rose-50 transition shadow-lg flex items-center justify-center gap-2 group-hover/card:gap-3"
                    >
                      {curso.Url ? "Ver Información" : "Inscribirme"} <ArrowRight className="w-4 h-4 transition-transform group-hover/card:translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">
                {hasActiveFilters ? "Sin resultados" : "No hay cursos específicos"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">
                {hasActiveFilters 
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Por ahora no hay cursos que coincidan exactamente con tus actividades, pero revisa el catálogo completo."
                }
              </p>
            </div>
          )}
        </section>


        {/* SECCIÓN 2: CATÁLOGO COMPLETO */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-rose-100">
            <h2 className="text-xl font-bold text-gray-900">Catálogo de Cursos</h2>
            <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {todosLosCursos?.length || 0}
            </span>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4].map(n => <div key={n} className="h-72 bg-gray-100 rounded-xl animate-pulse"></div>)}
             </div>
          ) : todosLosCursos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todosLosCursos.map((curso) => {
                const isSuggested = (usuarioUsos && usuarioUsos.length > 0) 
                    ? checkListEligibility(usuarioUsos, curso.Tema) 
                    : false;
                
                return (
                  <div 
                    key={curso.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-rose-300 hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden"
                  >
                    {isSuggested && (
                        <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Recomendado
                        </div>
                    )}

                    <div className="p-6 flex-1 pt-8">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {curso.Tema || "General"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors">
                        {curso.Titulo}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {curso.Descripcion}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded text-rose-700 font-medium">
                             <Calendar className="w-3 h-3" />
                             {formatDate(curso.FechaCurso)}
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded capitalize">
                             <MapPin className="w-3 h-3" />
                             {curso.Modalidad}
                          </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30 rounded-b-xl flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          {curso.Url ? <ExternalLink className="w-3 h-3" /> : <Info className="w-3 h-3"/>}
                          {curso.Url ? "Enlace externo" : "Más detalles"}
                      </div>
                      <button 
                        onClick={() => handleOpenModal(curso)}
                        className="text-sm font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                      >
                        Ver Curso <ChevronLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay cursos que coincidan con tu búsqueda.</p>
                <button 
                    onClick={() => { setSearchTerm(""); setFilterDate(""); }}
                    className="mt-2 text-rose-600 font-medium hover:underline text-sm"
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