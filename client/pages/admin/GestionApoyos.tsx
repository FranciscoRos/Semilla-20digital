import React, { useEffect, useState, useMemo } from "react";
import {Plus, Edit2, Trash2, X, AlertCircle, Save, HelpCircle, Box, Check } from "lucide-react";
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


// --- 1. DATOS ESTÁTICOS (CONSTANTES) ---
// Estos datos no aparecen en el formulario pero se envían siempre al backend
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
  const [loadingApoyos, setLoadingApoyos]=useState(false)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Datos básicos
  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "",
    fechaInicio: "",
    fechaFin: "",
    Requerimientos:[]
  });


  useEffect(() => { loadApoyos(); }, []);

  const loadApoyos = async () => {
    setLoadingApoyos(true)
    try {
      const data = await getApoyos();
      setApoyos(data);
    } catch (e) { console.error(e); 

    }finally{
      setLoadingApoyos(false)
    }
  };

  const nuevosRequerimientos=(req)=>{
    setFormData(prev=>({...prev,Requerimientos:req}))
  }
  // --- SUBMIT ---
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
      setFormData({ nombre_programa: "", descripcion: "", objetivo: "", tipo_objetivo: "", fechaInicio: "", fechaFin: "",Requerimientos:[] });
      setEditingId(null);
  };

  // Cargar datos en edición y reconstruir el estado visual
  const handleEdit = (apoyo: Apoyo) => {
      setEditingId(apoyo.id);
      setFormData({
          nombre_programa: apoyo.nombre_programa,
          descripcion: apoyo.descripcion,
          objetivo: apoyo.objetivo,
          tipo_objetivo: apoyo.tipo_objetivo,
          fechaInicio: apoyo.fechaInicio,
          fechaFin: apoyo.fechaFin,
          Requerimientos:apoyo.Requerimientos
      })
      setShowForm(true);
  };

 function compoentepootagregaraquilareedireccionaquitienestulogica(id:string){
  console.log(id)
 }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Apoyos</h1>
        <button onClick={() => { setShowForm(!showForm); resetInternalForm(); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-green-700">
           <Plus size={20} /> {showForm ? "Cancelar" : "Nuevo Programa"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between">
                <h2 className="text-xl font-bold">{editingId ? "Editar" : "Nuevo"} Programa</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- IZQUIERDA: DATOS GENERALES (4 columnas) --- */}
                <div className="lg:col-span-4 space-y-4 border-r pr-6">
                    <h3 className="font-bold text-gray-400 uppercase text-xs">Datos Generales</h3>
                    <input required placeholder="Nombre del Programa" className="w-full border rounded p-2" value={formData.nombre_programa} onChange={e => setFormData({...formData, nombre_programa: e.target.value})} />
                    <textarea required placeholder="Descripción pública" rows={4} className="w-full border rounded p-2" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                    <input required placeholder="Tipo (Económico, Especie...)" className="w-full border rounded p-2" value={formData.tipo_objetivo} onChange={e => setFormData({...formData, tipo_objetivo: e.target.value})} />
                    <input required placeholder="Objetivo corto" className="w-full border rounded p-2" value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">Inicio</label><input type="date" required className="w-full border rounded p-2" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} /></div>
                        <div><label className="text-xs">Fin</label><input type="date" required className="w-full border rounded p-2" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} /></div>
                    </div>
                </div>

                {/* --- DERECHA: CONSTRUCTOR DE REGLAS (8 columnas) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Box className="text-green-600" />
                        <h3 className="font-bold text-lg text-gray-800">Reglas de Filtrado de Productores</h3>
                    </div>
                    <ComponenteFiltrados requerimientos={formData.Requerimientos} 
                    changeRequerimientos={nuevosRequerimientos}/>
                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex items-center gap-2"><Save size={18}/> Guardar Apoyo</button>
                    </div>
                </div>
            </div>
        </form>
      )}
      

      {loadingApoyos ? (
        <LoadingSDloading/>
      ) : apoyos.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No hay apoyos registrados.</div>
      ) : (
      <div className="grid grid-cols-1 gap-4">
        {apoyos.map(a => (
            <div key={a.id} className="bg-white p-4 border rounded shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{a.nombre_programa}</h3>
                    <p className="text-xs text-gray-500">{a.Requerimientos?.length || 0} Reglas configuradas</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => compoentepootagregaraquilareedireccionaquitienestulogica(a.id)} className="text-white bg-green-600 px-4 py-2 rounded text-xs">Ver Usuarios Inscritos</button>
                    <button onClick={() => handleEdit(a)} className="text-blue-600 bg-blue-50 px-3 py-1 rounded text-xs">Editar</button>
                    <button onClick={() => deleteApoyo(a.id).then(loadApoyos)} className="text-red-600 bg-red-50 px-3 py-1 rounded text-xs">Eliminar</button>
                </div>
            </div>
        ))}
      </div>
      )}
    </div>
  );
}