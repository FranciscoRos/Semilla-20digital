import React, { useEffect, useState, useMemo, useRef } from "react";
import { 
  Plus, Save, Box, Search, Calendar, ChevronLeft, ChevronRight, 
  Edit2
} from "lucide-react";
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

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 6; // Cantidad de tarjetas por página

const CONSTANTES_INSTITUCION = {
  institucion_encargada: "Secretaría de Desarrollo Agropecuario Agriculturo, Rural y Pesca",
  institucion_acronimo: "SEDARPE",
  direccion: "Av. Belice #201 entre San Salvador y Venustiano Carranza. Colonia Centro, C.P. 77000., Chetumal, Mexico",
  horarios_atencion: "L-V 9:00 a 15:00",
  telefono_contacto: "983 835 1630",
  correo_contacto: "null@null.null",
  redes_sociales: "https://www.facebook.com/desarrolloagropecuarioqroo",
  latitud_institucion: 18.5069468,
  longitud_institucion: -88.2960919,
};

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [loadingApoyos, setLoadingApoyos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA FILTROS Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Referencia para el scroll automático
  const formTopRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "",
    fechaInicio: "",
    fechaFin: "",
    Requerimientos: [] as any[]
  });

  useEffect(() => { loadApoyos(); }, []);

  // Efecto para hacer scroll al formulario cuando se abre
  useEffect(() => {
    if (showForm && formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const loadApoyos = async () => {
    setLoadingApoyos(true);
    try {
      const data = await getApoyos();
      setApoyos(data);
    } catch (e) { console.error(e); } 
    finally { setLoadingApoyos(false); }
  };

  const nuevosRequerimientos = (req: any) => {
    setFormData(prev => ({ ...prev, Requerimientos: req }));
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  

  const filteredApoyos = useMemo(() => {
    return apoyos.filter(apoyo => {
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

  // Resetear página si cambia el filtro
  useEffect(() => { setCurrentPage(1); }, [searchTerm, dateFilter]);

  // --- HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ApoyoPayload = {
      ...formData,
      ...CONSTANTES_INSTITUCION,
      Beneficiados: [],
    };

    try {
      if (editingId) await updateApoyo(editingId, payload);
      else await createApoyo(payload);
      
      await loadApoyos();
      setShowForm(false);
      resetInternalForm();
    } catch (error) { console.error(error); }
  };

  const resetInternalForm = () => {
      setFormData({ nombre_programa: "", descripcion: "", objetivo: "", tipo_objetivo: "", fechaInicio: "", fechaFin: "", Requerimientos: [] });
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
          fechaFin: apoyo.fechaFin,
          Requerimientos: apoyo.Requerimientos || []
      });
      setShowForm(true);
      // El useEffect con formTopRef se encargará del scroll
  };

  function compoentepootagregaraquilareedireccionaquitienestulogica(id: string) {
    console.log(id);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Gestión de Apoyos</h1>
           <p className="text-gray-500 text-sm mt-1">Administra los programas y subsidios activos.</p>
        </div>
        <button 
            onClick={() => { setShowForm(!showForm); resetInternalForm(); }} 
            className={`${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white px-5 py-2.5 rounded-lg flex gap-2 transition shadow-sm font-medium`}
        >
           <Plus size={20} className={showForm ? "rotate-45 transition-transform" : "transition-transform"} /> 
           {showForm ? "Cerrar Formulario" : "Nuevo Programa"}
        </button>
      </div>

      {/* --- FORMULARIO (MODAL/EXPANDIBLE) --- */}
      <div ref={formTopRef}> {/* <-- Referencia para el Scroll */}
        {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl border border-gray-200 mb-10 overflow-hidden animate-fadeIn">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingId ? <Edit2 size={20} className="text-blue-600"/> : <Plus size={20} className="text-green-600"/>}
                        {editingId ? "Editar Programa Existente" : "Registrar Nuevo Programa"}
                    </h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* IZQUIERDA: DATOS GENERALES */}
                    <div className="lg:col-span-4 space-y-5 border-r pr-6">
                        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Información Básica</h3>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Nombre del Programa</label>
                            <input required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                                value={formData.nombre_programa} onChange={e => setFormData({...formData, nombre_programa: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Descripción Pública</label>
                            <textarea required rows={4} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none" 
                                value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Tipo (Económico...)</label>
                                <input required className="w-full border border-gray-300 rounded-lg p-2.5" 
                                    value={formData.tipo_objetivo} onChange={e => setFormData({...formData, tipo_objetivo: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Objetivo Corto</label>
                                <input required className="w-full border border-gray-300 rounded-lg p-2.5" 
                                    value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Inicio Vigencia</label>
                                <input type="date" required className="w-full border border-gray-300 rounded bg-white p-2 text-sm" 
                                    value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Fin Vigencia</label>
                                <input type="date" required className="w-full border border-gray-300 rounded bg-white p-2 text-sm" 
                                    value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: REGLAS */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                            <Box className="text-green-600" />
                            <h3 className="font-bold text-lg text-gray-800">Reglas de Filtrado de Productores</h3>
                        </div>
                        
                        <ComponenteFiltrados 
                            requerimientos={formData.Requerimientos} 
                            changeRequerimientos={nuevosRequerimientos}
                        />

                        <div className="pt-6 border-t flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                            <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                                <Save size={18}/> {editingId ? "Guardar Cambios" : "Crear Apoyo"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )}
      </div>

      {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
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
      
      {/* --- LISTA DE APOYOS --- */}
      {loadingApoyos ? (
        <LoadingSDloading/>
      ) : filteredApoyos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No se encontraron apoyos con estos criterios.</p>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 gap-4 mb-6">
                {paginatedApoyos.map(a => (
                    <div key={a.id} className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-gray-900">{a.nombre_programa}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${a.Requerimientos?.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {a.Requerimientos?.length || 0} Reglas
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{a.descripcion}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                <span>Inicio: {a.fechaInicio}</span>
                                <span>Fin: {a.fechaFin}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => compoentepootagregaraquilareedireccionaquitienestulogica(a.id)} className="flex-1 md:flex-none text-white bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg text-xs font-medium transition">
                                Ver Inscritos
                            </button>
                            <button onClick={() => handleEdit(a)} className="flex-1 md:flex-none text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-medium transition">
                                Editar
                            </button>
                            <button onClick={() => deleteApoyo(a.id).then(loadApoyos)} className="flex-1 md:flex-none text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-medium transition">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- COMPONENTE DE PAGINACIÓN --- */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600"/>
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600"/>
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}