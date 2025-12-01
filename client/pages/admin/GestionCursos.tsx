import { useEffect, useState, useRef, useMemo } from "react";
import { 
  ChevronLeft, Plus, Edit2, Trash2, Save, X, 
  BookOpen, MapPin, Globe, Calendar, Layers, 
  Search, CalendarRange, ArrowRight, 
  RefreshCcw, Monitor, Users
} from "lucide-react";
import {
  Curso,
  CursoPayload,
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "@/services/CursosService";
import LocationPicker from "@/components/selectMapa";
import LoadingSDloading from "@/components/loadingSDloading";
import PaginatorPages from "@/components/paginatorPages";
import { Toaster } from "@/components/ui/toaster"; // Asumo que tienes esto disponible como en el anterior

const selectionsTema = [
  { value: 'general', label: "General" },
  { value: 'agricultura', label: "Agricultura" },
  { value: 'pesca', label: "Pesca/Acuacultura" },
  { value: 'ganaderia', label: "Ganadería" },
  { value: 'apicultura', label: "Apicultura" },
];

export default function GestionCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingCursos, setLoadingCursos] = useState(false);

  // Filtros y Paginación
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedData, setPaginateData] = useState<Curso[]>([]);
  
  // Refs
  const formRef = useRef<HTMLDivElement>(null);

  // Modo de fecha
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  const [formData, setFormData] = useState<CursoPayload>({
    Titulo: "",
    Descripcion: "",
    Detalles: "",
    Tema: "general",
    Modalidad: "online",
    FechaCurso: [],
    DireccionUbicacion: "Av Insurgentes 330, 17 de Octubre, 77013 Chetumal, Q.R.",
    Latitud: 18.5205762,
    Longitud: -88.3015629,
    Url: "",
  });

  const loadCursos = async () => {
      setLoadingCursos(cursos.length !== 0 ? false : true);
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (error) {
        console.error("Error cargando cursos", error);
      } finally {
        setLoadingCursos(false);
      }
    };

  useEffect(() => {
    loadCursos();
  }, []);

  // Scroll automático
  useEffect(() => {
    if (showForm && formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  // --- MANEJO DE FECHAS ---
  const handleDateChange = (index: number, value: string) => {
    const newDates = [...formData.FechaCurso];
    newDates[index] = value;
    setFormData({ ...formData, FechaCurso: newDates });
  };

  const toggleDateMode = (mode: 'single' | 'range') => {
    setDateMode(mode);
    
    let newDates = [...formData.FechaCurso];

    if (mode === 'single') {
        newDates = newDates.length > 0 ? [newDates[0]] : [""];
    } else {
        if (newDates.length === 0) {
            newDates = ["", ""];
        } else if (newDates.length === 1) {
            newDates = [newDates[0], ""];
        } else if (newDates.length > 2) {
            newDates = [newDates[0], newDates[newDates.length - 1]];
        }
    }
    setFormData({ ...formData, FechaCurso: newDates });
  };

  // --- CRUD ---
  const handleDelete = async (_id: string) => {
    if(!window.confirm("¿Estás seguro de eliminar este curso?")) return;
    try {
      await deleteCurso(_id);
      setCursos((prev) => prev.filter((c) => c.id !== _id));
    } catch (error) {
      console.error("Error", error);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingId(curso.id);
    
    // Validar fechas para el modo
    const fechas = curso.FechaCurso || [];
    const modoDetectado = fechas.length > 1 ? 'range' : 'single';
    setDateMode(modoDetectado);

    setFormData({
        Titulo: curso.Titulo,
        Descripcion: curso.Descripcion,
        Detalles: curso.Detalles,
        Tema: curso.Tema,
        Modalidad: curso.Modalidad,
        FechaCurso: fechas.length > 0 ? fechas : [""], 
        DireccionUbicacion: curso.DireccionUbicacion || "",
        Latitud: curso.Latitud || 18.5205762,
        Longitud: curso.Longitud || -88.3015629,
        Url: curso.Url || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fechasLimpias = formData.FechaCurso.filter(f => f !== "");
    const payload: CursoPayload = {
      ...formData,
      FechaCurso: fechasLimpias,
    };

    try {
      if (editingId === null) {
        const nuevo = await createCurso(payload);
        setCursos((prev) => [...prev, nuevo]);
      } else {
        const actualizado = await updateCurso(editingId, payload);
        setCursos((prev) =>
          prev.map((c) => (c.id === editingId ? actualizado : c))
        );
      }
      loadCursos()
      resetForm();
    } catch (error: any) {
      console.error("Error guardando curso", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDateMode('single');
    setFormData({
      Titulo: "",
      Descripcion: "",
      Detalles: "",
      Tema: "general",
      Modalidad: "online",
      FechaCurso: [],
      DireccionUbicacion: "",
      Latitud: 18.5205762,
      Longitud: -88.3015629,
      Url: "",
    });
  };

  const handleLocationSelect = (lat: string, lng: string) => {
      setFormData(prev => ({ 
              ...prev, 
              Latitud: parseFloat(lat), 
              Longitud: parseFloat(lng) 
    }));  };

  // --- FILTROS ---
  const cursosFilter = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return cursos.filter(cr => {
      const matchSearch = 
        (cr.Titulo?.toLowerCase() || "").includes(search) || 
        (cr.Tema?.toLowerCase() || "").includes(search) || 
        (cr.DireccionUbicacion?.toLowerCase() || "").includes(search);

      const fechaStr = Array.isArray(cr.FechaCurso) && cr.FechaCurso.length > 0 
        ? cr.FechaCurso[0] 
        : "";
        
      const matchDate = dateFilter ? fechaStr.startsWith(dateFilter) : true;

      return matchSearch && matchDate;
    });
  }, [cursos, searchTerm, dateFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* Header Fijo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
             <div className="flex items-center gap-4 mb-2">
                 <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-green-700 font-medium transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Volver al Panel</span>
                  </button>
             </div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-1 md:ml-7">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Gestión de Cursos</h1>
                    <p className="text-slate-500 text-sm">Administra la oferta educativa y sus modalidades.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-slate-900 hover:bg-green-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Curso
                    </button>
                )}
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- FORMULARIO --- */}
        <div ref={formRef}>
          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
               
               {/* Header del Formulario */}
               <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {editingId ? <Edit2 className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-green-600"/>}
                        {editingId ? "Editar Curso Existente" : "Crear Nuevo Programa Educativo"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Completa los detalles para publicar el curso en la plataforma.</p>
                  </div>
                  <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition">
                    <X className="w-5 h-5" />
                  </button>
               </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* COLUMNA IZQUIERDA: INFO BÁSICA & AGENDA */}
                  <div className="lg:col-span-7 space-y-8">
                    
                    {/* Sección 1: Detalles Generales */}
                    <section className="space-y-5">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Información Básica
                       </h3>
                       
                       <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Título del Curso <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={formData.Titulo}
                              onChange={(e) => setFormData({ ...formData, Titulo: e.target.value })}
                              required
                              placeholder="Ej. Técnicas Avanzadas de Riego"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Categoría <span className="text-red-500">*</span></label>
                                <select 
                                   value={formData.Tema} 
                                   onChange={(e)=>setFormData({...formData, Tema: e.target.value})} 
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none"
                                >
                                  {selectionsTema.map(tems=>(
                                    <option key={tems.value} value={tems.value}>{tems.label}</option>
                                  ))}
                                </select>
                             </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción Corta <span className="text-red-500">*</span></label>
                            <textarea
                              value={formData.Descripcion}
                              onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                              rows={3}
                              required
                              placeholder="Resumen breve que aparecerá en la tarjeta del curso..."
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Detalles Completos <span className="text-red-500">*</span></label>
                            <textarea
                              value={formData.Detalles}
                              onChange={(e) => setFormData({ ...formData, Detalles: e.target.value })}
                              rows={5}
                              required
                              placeholder="Temario, requisitos, objetivos y toda la información detallada..."
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none"
                            />
                          </div>
                       </div>
                    </section>

                    {/* Sección 2: Agenda */}
                    <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-5">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Agenda del Curso
                           </h3>
                           
                           {/* Toggle Selector */}
                           <div className="flex bg-white rounded-lg p-1 shadow-sm border border-blue-100">
                              <button 
                                 type="button" 
                                 onClick={() => toggleDateMode('single')} 
                                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateMode === 'single' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                              >
                                 Fecha Única
                              </button>
                              <button 
                                 type="button" 
                                 onClick={() => toggleDateMode('range')} 
                                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateMode === 'range' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                              >
                                 Rango de Fechas
                              </button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {dateMode === 'single' ? (
                              <div className="md:col-span-2">
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Fecha del Evento</label>
                                 <input
                                    type="date"
                                    value={formData.FechaCurso[0] || ""}
                                    onChange={(e) => handleDateChange(0, e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                 />
                              </div>
                           ) : (
                              <>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Inicio</label>
                                    <input
                                       type="date"
                                       value={formData.FechaCurso[0] || ""}
                                       onChange={(e) => handleDateChange(0, e.target.value)}
                                       required
                                       className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Fin</label>
                                    <input
                                       type="date"
                                       value={formData.FechaCurso[1] || ""}
                                       onChange={(e) => handleDateChange(1, e.target.value)}
                                       required
                                       className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                 </div>
                              </>
                           )}
                        </div>
                    </section>
                  </div>

                  {/* COLUMNA DERECHA: LOGÍSTICA */}
                  <div className="lg:col-span-5 space-y-6">
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                           <MapPin className="w-4 h-4" /> Logística
                        </h3>

                        {/* Selector Modalidad */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <label className={`
                              cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                              ${formData.Modalidad === 'online' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}
                           `}>
                              <input type="radio" className="hidden" name="mod" checked={formData.Modalidad === 'online'} onChange={() => setFormData({...formData, Modalidad: 'online'})} />
                              <Monitor className={`w-6 h-6 ${formData.Modalidad === 'online' ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className={`text-sm font-bold ${formData.Modalidad === 'online' ? 'text-blue-700' : 'text-slate-600'}`}>Online</span>
                           </label>
                           
                           <label className={`
                              cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                              ${formData.Modalidad === 'presencial' ? 'border-green-500 bg-green-50/50' : 'border-slate-100 hover:border-slate-300'}
                           `}>
                              <input type="radio" className="hidden" name="mod" checked={formData.Modalidad === 'presencial'} onChange={() => setFormData({...formData, Modalidad: 'presencial'})} />
                              <Users className={`w-6 h-6 ${formData.Modalidad === 'presencial' ? 'text-green-600' : 'text-slate-400'}`} />
                              <span className={`text-sm font-bold ${formData.Modalidad === 'presencial' ? 'text-green-700' : 'text-slate-600'}`}>Presencial</span>
                           </label>
                        </div>

                        {/* Campos Dinámicos */}
                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                           {formData.Modalidad === "online" ? (
                              <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-2">Enlace de la Plataforma</label>
                                 <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                                    <input
                                       type="url"
                                       value={formData.Url}
                                       onChange={(e) => setFormData({ ...formData, Url: e.target.value })}
                                       placeholder="https://zoom.us/j/..."
                                       className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                 </div>
                              </div>
                           ) : (
                              <div className="space-y-4">
                                 <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Física</label>
                                    <input
                                       type="text"
                                       value={formData.DireccionUbicacion}
                                       onChange={(e) => setFormData({ ...formData, DireccionUbicacion: e.target.value })}
                                       placeholder="Calle, Número, Colonia..."
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                 </div>
                                 <div className="rounded-xl overflow-hidden border border-slate-200">
                                    <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 border-b border-slate-200">Seleccionar Ubicación</div>
                                    <div className="h-48">
                                       <LocationPicker 
                                          lat={formData.Latitud}
                                          lng={formData.Longitud}
                                          onLocationSelect={handleLocationSelect}
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100">
                   <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button
                      type="submit"
                      className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 transition-all flex items-center gap-2 transform active:scale-95"
                   >
                      <Save className="w-5 h-5" />
                      {editingId ? "Guardar Cambios" : "Publicar Curso"}
                   </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* --- BARRA DE CONTROL --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
              <input 
                 type="text" 
                 placeholder="Buscar por título, tema o ubicación..." 
                 className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-3">
              <div className="relative">
                 <input 
                    type="date" 
                    className="pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm text-slate-600"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                 />
              </div>
              
              <button 
                 onClick={loadCursos}
                 className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-green-600 transition-colors shadow-sm"
                 title="Actualizar lista"
              >
                 <RefreshCcw className="w-5 h-5"/>
              </button>
              
              {(searchTerm || dateFilter) && (
                 <button 
                    onClick={() => {setSearchTerm(""); setDateFilter("");}}
                    className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                 >
                    Limpiar
                 </button>
              )}
           </div>
        </div>

        {/* --- GRID DE CURSOS --- */}
        {loadingCursos ? (
            <LoadingSDloading/>
        ) : cursos.length === 0 && !showForm && !loadingCursos ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400"/>
               </div>
               <h3 className="text-lg font-bold text-slate-700">No hay cursos registrados</h3>
               <p className="text-slate-500 text-sm mt-1">Comienza creando el primer programa educativo.</p>
            </div>
        ) : cursosFilter.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               No se encontraron resultados para tu búsqueda.
            </div>
        ) : (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedData.map((curso) => (
                    <div
                       key={curso.id}
                       className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                    >
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
                       
                       <div className="flex justify-between items-start mb-4">
                          <span className={`
                             text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5
                             ${curso.Modalidad === 'online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'}
                          `}>
                             {curso.Modalidad === 'online' ? <Globe className="w-3 h-3"/> : <MapPin className="w-3 h-3"/>}
                             {curso.Modalidad}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(curso)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4"/></button>
                             <button onClick={() => handleDelete(curso.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                          </div>
                       </div>
                       
                       <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-green-700 transition-colors">
                          {curso.Titulo}
                       </h3>
                       
                       <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                          {curso.Descripcion}
                       </p>
                       
                       <div className="space-y-3 pt-4 border-t border-slate-50 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                             <Layers className="w-4 h-4 text-slate-400"/>
                             <span className="font-bold">Tema:</span> {curso.Tema}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                             <Calendar className="w-4 h-4 text-slate-400"/>
                             <span className="font-bold">Fecha:</span> 
                             {Array.isArray(curso.FechaCurso) 
                                ? (curso.FechaCurso.length > 1 
                                   ? `${curso.FechaCurso[0]} - ${curso.FechaCurso[curso.FechaCurso.length-1]}` 
                                   : curso.FechaCurso[0])
                                : curso.FechaCurso}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <PaginatorPages 
                  dataxFiltrar={cursosFilter}
                  ITEMS={9}
                  changeDatos={(dt) => setPaginateData(dt)}
               />
            </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}