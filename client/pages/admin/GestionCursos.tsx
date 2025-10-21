import { useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { demoCursos } from "@/services/api";

export default function GestionCursos() {
  const [cursos, setCursos] = useState(demoCursos);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    modalidad: "online" as const,
    enlace_plataforma: "",
  });

  const handleDelete = (id: number) => {
    // TODO: DELETE /api/admin/cursos/{id}
    setCursos(cursos.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST/PUT /api/admin/cursos
    setShowForm(false);
    setFormData({ titulo: "", descripcion: "", categoria: "", modalidad: "online", enlace_plataforma: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
            <p className="text-gray-600 mt-1">
              Crea, edita y elimina cursos de capacitación
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Curso" : "Crear Nuevo Curso"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad
                  </label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modalidad: e.target.value as "online" | "presencial",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="online">En Línea</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              </div>

              {formData.modalidad === "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace de Plataforma
                  </label>
                  <input
                    type="url"
                    value={formData.enlace_plataforma}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enlace_plataforma: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {editingId ? "Guardar Cambios" : "Crear Curso"}
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

        {/* Lista de Cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {curso.titulo}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {curso.descripcion}
              </p>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500">
                  Categoría: <span className="font-medium">{curso.categoria}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Modalidad:{" "}
                  <span className="font-medium">
                    {curso.modalidad === "online" ? "En Línea" : "Presencial"}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(curso.id)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(curso.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
