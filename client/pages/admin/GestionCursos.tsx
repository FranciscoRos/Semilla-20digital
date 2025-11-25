import { useEffect, useState, useRef, useMemo } from "react";
import { 
  ChevronLeft, Plus, Edit2, Trash2, Save, X, 
  BookOpen, MapPin, Globe, Calendar, Layers, 
  Box, Search, CalendarRange, ArrowRight 
} from "lucide-react";
import {
  Curso,
  CursoPayload,
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "@/services/CursosService";
import ComponenteFiltrados from "@/components/ComponenteFiltrado";
import LocationPicker from "@/components/selectMapa";
import LoadingSDloading from "@/components/loadingSDloading";
import PaginatorPages from "@/components/paginatorPages";

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

  // --- NUEVO: ESTADO PARA MODO DE FECHA ---
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  const [formData, setFormData] = useState<CursoPayload>({
    Titulo: "",
    Descripcion: "",
    Detalles: "",
    Tema: "",
    Modalidad: "online",
    FechaCurso: [], // Inicializado como array vacío
    DireccionUbicacion: "",
    Latitud: "",
    Longitud: "",
    Url: "",
    Requerimientos: [],
    Creado: "",
    Actualizado: "",
  });

  useEffect(() => {
    const loadCursos = async () => {
      setLoadingCursos(true);
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (error) {
        console.error("Error cargando cursos", error);
      } finally {
        setLoadingCursos(false);
      }
    };
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
        // Si cambia a single, nos quedamos solo con la primera fecha
        newDates = newDates.length > 0 ? [newDates[0]] : [""];
    } else {
        // Si cambia a range
        if (newDates.length === 0) {
            newDates = ["", ""];
        } else if (newDates.length === 1) {
            // Si hay una, duplicamos o dejamos la segunda vacía
            newDates = [newDates[0], ""];
        } else if (newDates.length > 2) {
            // Si hay muchas (ej. de una logica anterior), tomamos PRIMERA y ÚLTIMA
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
        FechaCurso: fechas.length > 0 ? fechas : [""], // Asegurar al menos un string vacío
        DireccionUbicacion: curso.DireccionUbicacion || "",
        Latitud: curso.Latitud || "",
        Longitud: curso.Longitud || "",
        Url: curso.Url || "",
        Requerimientos: curso.Requerimientos || [],
        Creado: curso.Creado,
        Actualizado: curso.Actualizado
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar fechas vacías antes de enviar
    const fechasLimpias = formData.FechaCurso.filter(f => f !== "");

    const payload: CursoPayload = {
      ...formData,
      FechaCurso: fechasLimpias,
      Creado: formData.Creado || new Date().toISOString(),
      Actualizado: new Date().toISOString(),
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
      Tema: "",
      Modalidad: "online",
      FechaCurso: [],
      DireccionUbicacion: "",
      Latitud: "",
      Longitud: "",
      Url: "",
      Requerimientos: [],
      Creado: "",
      Actualizado: "",
    });
  };

  const nuevosRequerimientos = (req: any) => {
    setFormData((prev) => ({ ...prev, Requerimientos: req }));
  };

  const handleLocationSelect = (lat: string, lng: string) => {
    setFormData(prev => ({ ...prev, Latitud: lat, Longitud: lng }));
  };

  // --- FILTROS ---
  const cursosFilter = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return cursos.filter(cr => {
      const matchSearch = 
        (cr.Titulo?.toLowerCase() || "").includes(search) || 
        (cr.Tema?.toLowerCase() || "").includes(search) || 
        (cr.DireccionUbicacion?.toLowerCase() || "").includes(search);

      // Filtrar por fecha inicio (primer elemento del array)
      const fechaStr = Array.isArray(cr.FechaCurso) && cr.FechaCurso.length > 0 
        ? cr.FechaCurso[0] 
        : "";
        
      const matchDate = dateFilter ? fechaStr.startsWith(dateFilter) : true;

      return matchSearch && matchDate;
    });
  }, [cursos, searchTerm, dateFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver al Panel
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Cursos</h1>
          <p className="text-slate-500 mt-1">Administra la oferta educativa y sus reglas de acceso.</p>
        </div>
        <button
          onClick={() => {
             if(showForm) resetForm();
             else setShowForm(true);
          }}
          className={`font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2 text-white shadow-sm ${showForm ? 'bg-slate-500 hover:bg-slate-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cerrar Formulario" : "Nuevo Curso"}
        </button>
      </div>

      {/* --- FORMULARIO --- */}
      <div ref={formRef}>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-slate-200 mb-12 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-6 border-b pb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingId ? <Edit2 className="text-blue-600"/> : <Plus className="text-green-600"/>}
                {editingId ? "Editar Curso Existente" : "Registrar Nuevo Curso"}
             </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: INFORMACIÓN GENERAL */}
            <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-700">Información General</h3>
               </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título del Curso</label>
                <input
                  type="text"
                  value={formData.Titulo}
                  onChange={(e) => setFormData({ ...formData, Titulo: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Ej. Técnicas de Riego Eficiente"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tema / Categoría</label>
                <input
                  type="text"
                  value={formData.Tema}
                  onChange={(e) => setFormData({ ...formData, Tema: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Ej. Agricultura Sustentable"
                />
              </div>

              {/* --- SECCIÓN DE FECHAS (CON TOGGLE) --- */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Configuración de Fechas</label>
                    
                    {/* Toggle de Fechas */}
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button 
                            type="button"
                            onClick={() => toggleDateMode('single')}
                            className={`px-3 py-1 text-xs rounded-md transition flex items-center gap-1 ${dateMode === 'single' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Calendar size={12}/> Fecha Única
                        </button>
                        <button 
                            type="button"
                            onClick={() => toggleDateMode('range')}
                            className={`px-3 py-1 text-xs rounded-md transition flex items-center gap-1 ${dateMode === 'range' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <CalendarRange size={12}/> Rango
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {dateMode === 'single' ? (
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Fecha del Evento</label>
                            <input
                                type="date"
                                value={formData.FechaCurso[0] || ""}
                                onChange={(e) => handleDateChange(0, e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Inicio</label>
                                <input
                                    type="date"
                                    value={formData.FechaCurso[0] || ""}
                                    onChange={(e) => handleDateChange(0, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div className="pb-3 text-slate-400"><ArrowRight size={16}/></div>
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Fin</label>
                                <input
                                    type="date"
                                    value={formData.FechaCurso[1] || ""}
                                    onChange={(e) => handleDateChange(1, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción Corta</label>
                <textarea
                  value={formData.Descripcion}
                  onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detalles Completos</label>
                <textarea
                  value={formData.Detalles}
                  onChange={(e) => setFormData({ ...formData, Detalles: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* COLUMNA DERECHA: FILTROS + MAPA */}
            <div className="lg:col-span-7 space-y-6 border-l border-slate-100 pl-6">
                {/* 2. MODALIDAD Y UBICACIÓN */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        {formData.Modalidad === 'online' ? <Globe className="text-blue-500"/> : <MapPin className="text-red-500"/>}
                        Modalidad y Ubicación
                    </h3>
                    
                    {/* Selector de Modalidad */}
                    <div className="flex gap-6 mb-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.Modalidad === 'online' ? 'border-blue-500' : 'border-slate-300'}`}>
                                {formData.Modalidad === 'online' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"/>}
                            </div>
                            <input 
                                type="radio" 
                                className="hidden" 
                                name="modalidad" 
                                value="online" 
                                checked={formData.Modalidad === 'online'}
                                onChange={() => setFormData({...formData, Modalidad: 'online'})}
                            />
                            <span className={`font-medium ${formData.Modalidad === 'online' ? 'text-blue-700' : 'text-slate-600'}`}>En Línea (Remoto)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.Modalidad === 'presencial' ? 'border-blue-500' : 'border-slate-300'}`}>
                                {formData.Modalidad === 'presencial' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"/>}
                            </div>
                            <input 
                                type="radio" 
                                className="hidden" 
                                name="modalidad" 
                                value="presencial" 
                                checked={formData.Modalidad === 'presencial'}
                                onChange={() => setFormData({...formData, Modalidad: 'presencial'})}
                            />
                            <span className={`font-medium ${formData.Modalidad === 'presencial' ? 'text-blue-700' : 'text-slate-600'}`}>Presencial</span>
                        </label>
                    </div>

                    {/* Contenido Dinámico según Modalidad */}
                    <div className="animate-fadeIn">
                        {formData.Modalidad === "online" ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Enlace de la reunión / Plataforma</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                                    <input
                                        type="url"
                                        value={formData.Url}
                                        onChange={(e) => setFormData({ ...formData, Url: e.target.value })}
                                        placeholder="https://zoom.us/..."
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Física</label>
                                        <input
                                            type="text"
                                            value={formData.DireccionUbicacion}
                                            onChange={(e) => setFormData({ ...formData, DireccionUbicacion: e.target.value })}
                                            placeholder="Calle, Número, Colonia..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ubicación en Mapa</label>
                                    <LocationPicker 
                                        lat={formData.Latitud}
                                        lng={formData.Longitud}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 1. REGLAS DE FILTRADO */}
                <div className="border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Box className="text-green-600" />
                        <h3 className="font-bold text-lg text-gray-800">Reglas de Filtrado</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Define quién puede ver este curso en su app.</p>
                    <ComponenteFiltrados
                        requerimientos={formData.Requerimientos}
                        changeRequerimientos={nuevosRequerimientos}
                    />
                </div>
            </div>
          </div>

          {/* Footer Formulario */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar Operación
            </button>
            <button
              type="submit"
              
              className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Save size={18} />
              {editingId ? "Guardar Cambios" : "Crear Curso"}
            </button>
          </div>
        </form>
      )}
      </div>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input 
                type="text" 
                placeholder="Buscar por nombre del programa..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input 
                type="date" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
            />
        </div>
        {(searchTerm || dateFilter) && (
            <button 
                onClick={() => {setSearchTerm(""); setDateFilter("");}}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
            >
                Limpiar filtros
            </button>
        )}
      </div>

      {/* --- LISTA DE CURSOS --- */}
      {loadingCursos ? (
          <LoadingSDloading/>
        ) : cursos.length === 0 && !showForm && !loadingCursos ?(
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20"/>
                <p>No hay cursos registrados aún.</p>
            </div>
        ) : cursosFilter.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
                No se encontraron coincidencias con tu búsqueda.
            </div>
        ) : (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((curso) => (
                <div
                    key={curso.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{curso.Titulo}</h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${curso.Modalidad === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {curso.Modalidad}
                        </span>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-grow">{curso.Descripcion}</p>
                    
                    <div className="space-y-2 text-xs text-slate-600 mb-5 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-400"/>
                            <span className="font-semibold">Tema:</span> {curso.Tema}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400"/>
                            <span className="font-semibold">Fecha:</span> 
                            {Array.isArray(curso.FechaCurso) 
                                ? (curso.FechaCurso.length > 1 
                                    ? `${curso.FechaCurso[0]} al ${curso.FechaCurso[curso.FechaCurso.length-1]}` 
                                    : curso.FechaCurso[0])
                                : curso.FechaCurso}
                        </div>
                        {curso.Requerimientos && curso.Requerimientos.length > 0 && (
                            <div className="pt-1 border-t border-slate-200 mt-1 text-orange-600 font-medium">
                                {curso.Requerimientos.length} Reglas de acceso
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-auto">
                    <button
                        onClick={() => handleEdit(curso)}
                        className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                        <Edit2 size={16} /> Editar
                    </button>
                    <button
                        onClick={() => handleDelete(curso.id)}
                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                        <Trash2 size={16} /> Eliminar
                    </button>
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
  );
}