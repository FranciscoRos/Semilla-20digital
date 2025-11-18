import { useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { demoApoyos } from "@/services/api";

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState(demoApoyos);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    monto: 0,
    requisitos: "",
    estatus:"",
    creado: "",
    actualizado: "",
  });

  const handleDelete = (id: number) => {
    // TODO: DELETE /api/admin/apoyos/{id}
    setApoyos(apoyos.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST/PUT /api/admin/apoyos
    setShowForm(false);
    setFormData({
       nombre: "",
    descripcion: "",
    monto: 0,
    requisitos: "",
    estatus:"",
    creado: "",
    actualizado: "",
    });
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
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
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
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.monto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monto: parseInt(e.target.value),
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>


               
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Estado
  </label>

  <div className="w-full px-4 py-3 rounded-lg flex items-center gap-6 focus-within:ring-2 ">
    
      <input type="radio" name="estatus" value="activo"
        checked={formData.estatus === "activo"}
        onChange={(e) =>
          setFormData({ ...formData, estatus: e.target.value })
        }
        required
        className="text-green-600 focus:ring-green-500"
      />
      <span className="text-gray-700 text-sm">Activo</span>
   

    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="estatus" value="inactivo"
        checked={formData.estatus === "inactivo"}
        onChange={(e) =>
          setFormData({ ...formData, estatus: e.target.value })
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
                    value={formData.requisitos}
                    onChange={(e) =>
                      setFormData({ ...formData, requisitos: e.target.value })
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
                    value={formData.creado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        creado: e.target.value,
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
                    value={formData.actualizado}
                    onChange={(e) =>
                      setFormData({ ...formData, actualizado: e.target.value })
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
              key={apoyo.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {apoyo.nombre}
                </h3>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold text-green-700 text-sm">
                    ${apoyo.monto.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {apoyo.descripcion}
              </p>

              <div className="space-y-2 mb-4 text-sm text-gray-500">
                <p>
                  Vigencia: {apoyo.vigencia_inicio} a {apoyo.vigencia_fin}
                </p>
                <p>Beneficiarios: {apoyo.beneficiarios}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(apoyo.id)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(apoyo.id)}
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
