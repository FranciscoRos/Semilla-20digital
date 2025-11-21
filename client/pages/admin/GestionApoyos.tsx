import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import {
  Apoyo,
  getApoyos,
  createApoyo,
  updateApoyo,
  deleteApoyo,
} from "@/services/ApoyoService";

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

const [formData, setFormData] = useState({
  Titulo: "",
  Descripcion: "",
  Requisitos: "",
  Estatus: "",
  Creado: "",
  Actualizado: "",
});

    useEffect(() => {
    const loadApoyos = async () => {
      try {
        const data = await getApoyos();
        setApoyos(data);
      } catch (error) {
        console.error("Error cargando apoyos", error);
      }
    };

    loadApoyos();
  }, []);


  const handleDelete = async (id: number) => {
    try {
      await deleteApoyo(id);
      setApoyos((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error eliminando apoyo", error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Preparamos el payload sin id
    const payload: Omit<Apoyo, "_id"> = {
      Titulo: formData.Titulo,
    Descripcion: formData.Descripcion,
      Requisitos: formData.Requisitos,
      Estatus: formData.Estatus,
      Creado: formData.Creado,
      Actualizado: formData.Actualizado,
    };

    try {
      if (editingId === null) {
        // Crear nuevo apoyo
        const nuevo = await createApoyo(payload);
        setApoyos((prev) => [...prev, nuevo]);
      } else {
        // Actualizar apoyo existente
        const actualizado = await updateApoyo(editingId, payload);
        setApoyos((prev) =>
          prev.map((a) => (a._id === editingId ? actualizado : a))
        );
      }

      // Limpiar formulario y cerrar modal
      setShowForm(false);
      setEditingId(null);
      setFormData({
        Titulo: "",
        Descripcion: "",
        Requisitos: "",
        Estatus: "",
        Creado: "",
        Actualizado: "",
      });
    } catch (error) {
      console.error("Error guardando apoyo", error);
    }
  };


  return (
    <div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Apoyos
            </h1>
            <p className="text-gray-600 mt-1">
              Crea y administra los programas de apoyo disponibles
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Apoyo
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Apoyo" : "Crear Nuevo Apoyo"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Apoyo
                </label>
                <input
                  type="text"
                  value={formData.Titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, Titulo: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.Descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, Descripcion: e.target.value })
                  }
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
               


               
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Estado
  </label>

  <div className="w-full px-4 py-3 rounded-lg flex items-center gap-6 focus-within:ring-2 ">
    
      <input type="radio" name="estatus" value="activo"
        checked={formData.Estatus === "activo"}
        onChange={(e) =>
          setFormData({ ...formData, Estatus: e.target.value })
        }
        required
        className="text-green-600 focus:ring-green-500"
      />
      <span className="text-gray-700 text-sm">Activo</span>
   

    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="estatus" value="inactivo"
        checked={formData.Estatus === "inactivo"}
        onChange={(e) =>
          setFormData({ ...formData, Estatus: e.target.value })
        }
        required
        className="text-green-600 focus:ring-green-500"
      />
      <span className="text-gray-700 text-sm">Inactivo</span>
    </label>
  </div>
</div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisitos (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.Requisitos}
                    onChange={(e) =>
                      setFormData({ ...formData, Requisitos: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid gSrid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creado
                  </label>
                  <input
                    type="date"
                    value={formData.Creado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Creado: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actualizado
                  </label>
                  <input
                    type="date"
                    value={formData.Actualizado}
                    onChange={(e) =>
                      setFormData({ ...formData, Actualizado: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {editingId ? "Guardar Cambios" : "Crear Apoyo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista de Apoyos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apoyos.map((apoyo) => (
            <div
              key={apoyo._id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {apoyo.Titulo}
                </h3>
                
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {apoyo.Descripcion}
              </p>

              <div className="space-y-2 mb-4 text-sm text-gray-500">
                <p>
                  Creado: {apoyo.Creado} 
                </p>
                
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(apoyo._id)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(apoyo._id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
