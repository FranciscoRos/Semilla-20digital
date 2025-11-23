import { IUbicacionEspecial } from "@/services/api";
import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import LocationPicker from "./selectMapa";  // Asegúrate de importar el componente nuevo

const AddLocationModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<IUbicacionEspecial, 'id'>) => void }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    municipio: "Othón P. Blanco",
    tipo: "sede_gobierno" as IUbicacionEspecial['tipo'],
    descripcion: "",
    lat: "",
    lng: "",
    telefono: "",
    direccion: "",  
    horario: "",
    institucion: ""
  });

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
        (position)=>{
        setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toString(),
                    lng: position.coords.longitude.toString()
                }))
            },
            (error) => {
            console.warn("Geolocalización falló o permiso denegado:", error);
            }
        );
        
  })

  if (!isOpen) return null;

  // Esta es la función que pasamos al hijo
  const handleLocationSelect = (lat: string, lng: string) => {
    setFormData(prev => ({
        ...prev,
        lat: lat,
        lng: lng
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        coordenadas: { 
            lat: parseFloat(formData.lat), 
            lng: parseFloat(formData.lng) 
        }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
            <h2 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5"/> Nueva Ubicación Especial</h2>
            <button onClick={onClose}><X className="w-5 h-5 hover:text-green-200"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[85vh] overflow-y-auto">
            
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Lugar *</label>
                    <input required className="w-full border rounded p-2 text-sm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tipo *</label>
                        <select className="w-full border rounded p-2 text-sm" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as any})}>
                            <option value="sede_gobierno">Sede Gobierno</option>
                            <option value="centro_acopio">Centro de Acopio</option>
                            <option value="mercado_local">Mercado Local</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Municipio *</label>
                        <input required className="w-full border rounded p-2 text-sm" value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción *</label>
                    <textarea required className="w-full border rounded p-2 text-sm h-20 resize-none" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                        <input className="w-full border rounded p-2 text-sm" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Institución</label>
                        <input className="w-full border rounded p-2 text-sm" value={formData.institucion} onChange={e => setFormData({...formData, institucion: e.target.value})} />
                    </div>
                </div>
            </div>
            {/* COLUMNA DERECHA: Componente Mapa */}
            <div className="h-full min-h-[300px]">
                <LocationPicker 
                    lat={formData.lat}
                    lng={formData.lng}
                    onLocationSelect={handleLocationSelect}
                />
            </div>

            {/* Footer */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 pt-4 border-t mt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Ubicación
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;