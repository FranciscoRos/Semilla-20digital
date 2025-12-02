import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus,
  Save,
  Box,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  User,
  MapPin,
  Clock,
  Briefcase,
  Trash2,
  Users,
  RefreshCcw,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Apoyo,
  ApoyoPayload,
  getApoyos,
  createApoyo,
  updateApoyo,
  deleteApoyo,
} from "@/services/ApoyoService";
import ComponenteFiltrados from "@/components/ComponenteFiltrado";
import LoadingSDloading from "@/components/loadingSDloading";
import { toast } from "@/hooks/use-toast";

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 6;

const CONSTANTES_INSTITUCION = {
  institucion_encargada: "Secretaría de Desarrollo Agropecuario, Rural y Pesca",
  institucion_acronimo: "SEDARPE",
  direccion: "Av. Belice #201 entre San Salvador y Venustiano Carranza. Colonia Centro, C.P. 77000., Chetumal, Mexico",
  horarios_atencion: "L-V 9:00 a 15:00",
  telefono_contacto: "983 835 1630",
  correo_contacto: "contacto@sedarpe.gob.mx",
  redes_sociales: "https://www.facebook.com/desarrolloagropecuarioqroo",
  latitud_institucion: 18.5069468,
  longitud_institucion: -88.2960919,
};

const apoyosSedarpe = [
  { value: "General", label: "General" },
  { value: "Agricultura: Semillas", label: "Semillas e insumos agrícolas" },
  { value: "Agricultura: Maquinaria", label: "Maquinaria / herramientas agrícolas" },
  { value: "Cultivos Fruticolas", label: "Apoyo a cultivos frutícolas" },
  { value: "Apicultura", label: "Apoyo al sector apícola / miel" },
  { value: "Ganaderia Genetica", label: "Mejoramiento genético y apoyo ganadero" },
  { value: "Ganaderia: Insumos", label: "Insumos y equipamiento ganadero" },
  { value: "Avicultura", label: "Producción avícola" },
  { value: "Infraestructura Rural", label: "Infraestructura rural / caminos rurales" },
  { value: "Pesca: Insumos", label: "Insumos / equipamiento para pesca y acuacultura" },
  { value: "Pesca: Apoyo Veda", label: "Apoyo económico en periodos de veda pesquera" },
  { value: "Desarrollo Rural", label: "Programas integrales de desarrollo rural" },
  { value: "Innovacion Agricola", label: "Innovación agrícola y bioinsumos" }
];

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [loadingApoyos, setLoadingApoyos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- FILTROS Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll al formulario
  const formTopRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "General",
    fechaInicio: "",
    fechaFin: "",
    duracion: 12,
    Requerimientos: [] as any[],
  });

  const navigate = useNavigate();

  // --- MODAL DE INSCRITOS ---
  const [showInscritos, setShowInscritos] = useState(false);
  const [apoyoSeleccionado, setApoyoSeleccionado] = useState<Apoyo | null>(null);
  const [inscritos, setInscritos] = useState<any[]>([]);

  // --- MODAL DE CITA POR PERSONA ---
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [inscritoSeleccionado, setInscritoSeleccionado] = useState<any | null>(null);
  const [citaForm, setCitaForm] = useState({
    FechaCita: "",
    HoraCita: "",
    PropositoCita: "",
    Administrador: "",
  });

  useEffect(() => {
    loadApoyos();
  }, []);

  useEffect(() => {
    if (showForm && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const loadApoyos = async () => {
    setLoadingApoyos(true);
    try {
      const data = await getApoyos();
      setApoyos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApoyos(false);
    }
  };

  const nuevosRequerimientos = (req: any) => {
    setFormData((prev) => ({ ...prev, Requerimientos: req }));
  };

  const getNombreUsuario = (persona: any): string => {
    const u = persona?.Usuario;
    if (!u) return "Usuario Desconocido";
    if (typeof u === "string") return u;
    const { Nombre, Apellido1, Apellido2 } = u;
    return [Nombre, Apellido1, Apellido2].filter(Boolean).join(" ").trim() || "Usuario sin nombre";
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const filteredApoyos = useMemo(() => {
    return apoyos.filter((apoyo) => {
      const matchSearch = apoyo.nombre_programa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = dateFilter ? apoyo.fechaInicio === dateFilter : true;
      return matchSearch && matchDate;
    });
  }, [apoyos, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredApoyos.length / ITEMS_PER_PAGE);
  const paginatedApoyos = filteredApoyos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  // --- FORM HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { dismiss } = toast({
            title: "Procesando...",
            description: (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando revisión...</span> 
                </div>
            ),
            duration: Infinity, 
        })
    const payload: ApoyoPayload = {
      ...formData,
      ...CONSTANTES_INSTITUCION,
      Beneficiados: [], 
    };
    
    try {
      if (editingId) await updateApoyo(editingId, payload);
      else await createApoyo(payload);

      await loadApoyos();
       dismiss();
        toast({
                title: "Revision Guardada",
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900",
                duration:3000
            })
      setShowForm(false);
      resetInternalForm();
    } catch (error) {
      console.error(error);
      dismiss();
      toast({
            title: "Error al Guardar la Revision",
            variant: "default",
            className: "bg-red-50 border-red-200 text-red-900",
            duration:3000
        })
    }
  };

  const resetInternalForm = () => {
    setFormData({
      nombre_programa: "",
      descripcion: "",
      objetivo: "",
      tipo_objetivo: "General",
      fechaInicio: "",
      fechaFin: "",
      duracion: 12,
      Requerimientos: [],
    });
    setEditingId(null);
  };

  const handleEdit = (apoyo: Apoyo) => {
    setEditingId(apoyo.id);
    setFormData({
      nombre_programa: apoyo.nombre_programa,
      descripcion: apoyo.descripcion,
      objetivo: apoyo.objetivo,
      tipo_objetivo: apoyo.tipo_objetivo,
      fechaInicio: apoyo.fechaInicio,
      duracion: apoyo.duracion,
      fechaFin: apoyo.fechaFin,
      Requerimientos: apoyo.Requerimientos || [],
    });
    setShowForm(true);
  };

  // --- MANEJO DE CITAS (MODALES) ---
  const handleVerInscritos = (apoyo: Apoyo) => {
    setApoyoSeleccionado(apoyo);
    setInscritos(apoyo.Beneficiados || []);
    setShowInscritos(true);
  };

  const handleCerrarInscritos = () => {
    setShowInscritos(false);
    setApoyoSeleccionado(null);
    setInscritos([]);
  };

  const totalInscritos = inscritos.length;
  const totalConCita = inscritos.filter((i: any) => i?.agendacionCita?.FechaCita).length;
  const totalSinCita = totalInscritos - totalConCita;

  const handleAbrirCita = (persona: any) => {
    setInscritoSeleccionado(persona);
    const cita = persona.agendacionCita || {};
    setCitaForm({
      FechaCita: cita.FechaCita || "",
      HoraCita: cita.HoraCita || "",
      PropositoCita: cita.PropositoCita || "",
      Administrador: cita.Administrador || "",
    });
    setShowCitaModal(true);
  };

  const handleCerrarCita = () => {
    setShowCitaModal(false);
    setInscritoSeleccionado(null);
    setCitaForm({ FechaCita: "", HoraCita: "", PropositoCita: "", Administrador: "" });
  };

  const handleGuardarCita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscritoSeleccionado || !apoyoSeleccionado) return;

    const nuevaCita = { ...citaForm };
    const nuevosInscritos = inscritos.map((p) =>
      p === inscritoSeleccionado ? { ...p, agendacionCita: nuevaCita } : p
    );
    setInscritos(nuevosInscritos);

    const nuevosApoyos = apoyos.map((ap) => {
      if (ap.id !== apoyoSeleccionado.id) return ap;
      const nuevosBenef = (ap.Beneficiados || []).map((p: any) =>
        p === inscritoSeleccionado ? { ...p, agendacionCita: nuevaCita } : p
      );
      return { ...ap, Beneficiados: nuevosBenef };
    });

    setApoyos(nuevosApoyos);
    setShowCitaModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* Header Fijo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
             <div className="flex items-center gap-4 mb-2">
                 <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-green-700 font-medium transition-colors">
                    <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Volver al Panel</span>
                  </button>
             </div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-1 md:ml-7">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Gestión de Apoyos</h1>
                    <p className="text-slate-500 text-sm">Administra los programas de subsidio y apoyo al productor.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); resetInternalForm(); }}
                        className="bg-slate-900 hover:bg-green-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Programa
                    </button>
                )}
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- FORMULARIO DE CREACIÓN / EDICIÓN --- */}
        <div ref={formTopRef}>
          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
               
               <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {editingId ? <Edit2 className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-green-600"/>}
                        {editingId ? "Editar Programa Existente" : "Registrar Nuevo Programa"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Configura los detalles generales y las reglas de elegibilidad.</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition">
                    <X className="w-5 h-5" />
                  </button>
               </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* COLUMNA IZQUIERDA: DATOS GENERALES */}
                  <div className="lg:col-span-5 space-y-6">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Briefcase className="w-4 h-4" /> Datos del Programa
                     </h3>

                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Programa <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={formData.nombre_programa}
                                onChange={(e) => setFormData({ ...formData, nombre_programa: e.target.value })}
                                placeholder="Ej. Apoyo de Fertilizantes 2024"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Categoría / Tipo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={formData.tipo_objetivo}
                                    onChange={(e) => setFormData({ ...formData, tipo_objetivo: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none"
                                >
                                    {apoyosSedarpe.map(as => (
                                        <option key={as.value} value={as.value}>{as.label}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 rotate-90 pointer-events-none"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción Pública <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                rows={4}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Describe en qué consiste el apoyo y quiénes pueden participar..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Objetivo Corto</label>
                            <input
                                required
                                value={formData.objetivo}
                                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                                placeholder="Ej. Incrementar la producción de maíz..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Vigencia y Duración
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Fecha Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Duración del Beneficio (Meses)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.duracion}
                                        onChange={(e) => setFormData({ ...formData, duracion: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* COLUMNA DERECHA: REGLAS Y REQUISITOS */}
                  <div className="lg:col-span-7 space-y-6 border-l border-slate-100 pl-0 lg:pl-10">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Box className="w-4 h-4" /> Reglas de Operación
                     </h3>
                     
                     <div className="bg-white rounded-xl border border-slate-200 p-1">
                        {/* Tu componente original, usando tus imports */}
                        <ComponenteFiltrados
                            requerimientos={formData.Requerimientos}
                            changeRequerimientos={nuevosRequerimientos}
                        />
                     </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-100">
                   <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button
                      type="submit"
                      className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 transition-all flex items-center gap-2 transform active:scale-95"
                   >
                      <Save className="w-5 h-5" />
                      {editingId ? "Guardar Cambios" : "Publicar Programa"}
                   </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
              <input 
                 type="text" 
                 placeholder="Buscar por nombre del programa..." 
                 className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-3">
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                 <input 
                    type="date" 
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm text-slate-600 cursor-pointer"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                 />
              </div>
              
              {(searchTerm || dateFilter) && (
                 <button 
                    onClick={() => {setSearchTerm(""); setDateFilter("");}}
                    className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                 >
                    Limpiar
                 </button>
              )}

              <button 
                  onClick={loadApoyos}
                  className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-green-600 transition-colors shadow-sm"
                  title="Actualizar lista"
              >
                  <RefreshCcw className="w-5 h-5"/>
              </button>
           </div>
        </div>

        {/* --- GRID DE APOYOS --- */}
        {loadingApoyos ? (
            <LoadingSDloading />
        ) : filteredApoyos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Box className="w-8 h-8 text-slate-400"/>
               </div>
               <h3 className="text-lg font-bold text-slate-700">No se encontraron apoyos</h3>
               <p className="text-slate-500 text-sm mt-1">Intenta ajustar tus filtros de búsqueda.</p>
            </div>
        ) : (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedApoyos.map((apoyo) => (
                    <div
                       key={apoyo.id}
                       className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                    >
                       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 to-emerald-400"/>
                       
                       <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                             {apoyo.tipo_objetivo}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(apoyo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><Edit2 className="w-4 h-4"/></button>
                             <button onClick={() => deleteApoyo(apoyo.id).then(loadApoyos)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar"><X className="w-4 h-4"/></button>
                          </div>
                       </div>
                       
                       <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-green-700 transition-colors">
                          {apoyo.nombre_programa}
                       </h3>
                       
                       <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                          {apoyo.descripcion}
                       </p>
                       
                       <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <span className="block text-[10px] font-bold text-slate-400 uppercase">Reglas</span>
                             <span className="text-sm font-semibold text-slate-700">{apoyo.Requerimientos?.length || 0} condiciones</span>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                             <span className="block text-[10px] font-bold text-blue-400 uppercase">Inscritos</span>
                             <span className="text-sm font-semibold text-blue-700">{apoyo.Beneficiados?.length || 0} personas</span>
                          </div>
                       </div>

                       <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Calendar className="w-4 h-4 text-slate-400"/>
                             <span className="font-medium">{apoyo.fechaInicio}</span>
                             <span className="text-slate-300">→</span>
                             <span className="font-medium">{apoyo.fechaFin}</span>
                          </div>
                          <button
                             onClick={() => handleVerInscritos(apoyo)}
                             className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                             <Users className="w-4 h-4" /> Gestionar Inscritos
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
               
               {/* Paginación Manual */}
               {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-10">
                     <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                     >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                     </button>
                     <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        Página {currentPage} de {totalPages}
                     </span>
                     <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                     >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                     </button>
                  </div>
               )}
            </div>
        )}
      </div>

      {/* --- MODAL INSCRITOS --- */}
      {showInscritos && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h2 className="text-xl font-extrabold text-slate-800">Inscritos en el Programa</h2>
                  <p className="text-sm text-green-600 font-medium">{apoyoSeleccionado?.nombre_programa}</p>
               </div>
               <button onClick={handleCerrarInscritos} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition">
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/30">
               {/* Stats Resumen */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6"/></div>
                     <div>
                        <p className="text-2xl font-bold text-slate-800">{totalInscritos}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">Total Solicitudes</p>
                     </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Calendar className="w-6 h-6"/></div>
                     <div>
                        <p className="text-2xl font-bold text-slate-800">{totalConCita}</p>
                        <p className="text-xs text-green-600 font-bold uppercase">Citas Agendadas</p>
                     </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-6 h-6"/></div>
                     <div>
                        <p className="text-2xl font-bold text-slate-800">{totalSinCita}</p>
                        <p className="text-xs text-amber-600 font-bold uppercase">Pendientes de Cita</p>
                     </div>
                  </div>
               </div>

               {totalInscritos === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                     <p className="text-slate-400 font-medium">Aún no hay solicitudes registradas.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {inscritos.map((persona: any, idx: number) => {
                        const cita = persona.agendacionCita || {};
                        const tieneCita = !!cita.FechaCita;

                        return (
                           <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border border-slate-200">
                                       {getNombreUsuario(persona).charAt(0)}
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-slate-800 text-sm">{getNombreUsuario(persona)}</h4>
                                       <div className="flex items-center gap-1 text-xs text-slate-500">
                                          <MapPin className="w-3 h-3" />
                                          <span>{typeof persona.parcela === 'string' ? persona.parcela : (persona.parcela?.NombreParcela || 'Sin parcela')}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${tieneCita ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                    {tieneCita ? 'Agendado' : 'Pendiente'}
                                 </span>
                              </div>

                              {tieneCita && (
                                 <div className="bg-slate-50 p-3 rounded-lg mb-3 border border-slate-100">
                                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium mb-1">
                                       <Calendar className="w-3 h-3 text-slate-400"/> {cita.FechaCita} at {cita.HoraCita}
                                    </div>
                                    {cita.Administrador && (
                                       <div className="text-[10px] text-slate-500">Atiende: <span className="font-semibold">{cita.Administrador}</span></div>
                                    )}
                                 </div>
                              )}

                              <button 
                                 onClick={() => handleAbrirCita(persona)}
                                 className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${tieneCita ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                              >
                                 {tieneCita ? 'Editar Cita' : 'Agendar Cita'}
                              </button>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL AGENDAR CITA --- */}
      {showCitaModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
            <form onSubmit={handleGuardarCita} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Agendar Cita</h3>
                  <button type="button" onClick={handleCerrarCita} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                     <p className="text-xs text-blue-600 font-medium">Productor</p>
                     <p className="text-sm font-bold text-blue-900">{getNombreUsuario(inscritoSeleccionado)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                        <input 
                           type="date" required 
                           value={citaForm.FechaCita} 
                           onChange={e => setCitaForm({...citaForm, FechaCita: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Hora</label>
                        <input 
                           type="time" required 
                           value={citaForm.HoraCita} 
                           onChange={e => setCitaForm({...citaForm, HoraCita: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Responsable (Admin)</label>
                     <input 
                        type="text" 
                        value={citaForm.Administrador} 
                        onChange={e => setCitaForm({...citaForm, Administrador: e.target.value})}
                        placeholder="Ej. Ing. Pérez"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Propósito / Notas</label>
                     <textarea 
                        rows={3}
                        value={citaForm.PropositoCita} 
                        onChange={e => setCitaForm({...citaForm, PropositoCita: e.target.value})}
                        placeholder="Entrega de documentos..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                     />
                  </div>
               </div>

               <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={handleCerrarCita} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                  <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition">Confirmar Cita</button>
               </div>
            </form>
         </div>
      )}

    </div>
  );
}