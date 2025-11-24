import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import {
  Curso,
  CursoPayload,
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "@/services/CursosService";
import { usePreguntas } from "@/hooks/usePreguntas";

export default function GestionCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { dataPreguntas, loadingPreguntas } = usePreguntas();


  const [formData, setFormData] = useState<CursoPayload>({
    Titulo: "",
    Descripcion: "",
    Detalles: "",
    Tema: "",
    Modalidad: "online",
    FechaCurso: "",
    DireccionUbicacion: "",
    Latitud: "",
    Longitud: "",
    Url: "",
    Creado: "",
    Actualizado: "",
  });

    useEffect(() => {
    const loadCursos = async () => {
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (error) {
        console.error("Error cargando cursos", error);
      }
    };

    loadCursos();
  }, []);


    const handleDelete = async (_id: string) => {
    try {
      await deleteCurso(_id);
      setCursos((prev) => prev.filter((c) => c._id !== _id));
    } catch (error) {
      console.error("Error eliminando curso", error);
    }
  };


    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Actualizamos fechas (puedes dejar que Laravel las llene, si quieres)
    const payload: CursoPayload = {
      ...formData,
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
          prev.map((c) => (c._id === editingId ? actualizado : c))
        );
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        Titulo: "",
        Descripcion: "",
        Detalles: "",
        Tema: "",
        Modalidad: "online",
        FechaCurso: "",
        DireccionUbicacion: "",
        Latitud: "",
        Longitud: "",
        Url: "",
        Creado: "",
        Actualizado: "",
      });
    } catch (error: any) {
      console.error("Error guardando curso", error);
      console.log("Respuesta Laravel:", error.response?.data);
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
              Gestión de Cursos
            </h1>
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
        {/* 
           id
            titulo
            tema 
            descripcion
            detalles
            modalidad
             Fechacurso
             direccion
             latitud
             longituf
             url
        
        */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Curso" : "Crear Nuevo Curso"}
            </h2>

            <div className=" grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
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

                  {/*Tema */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <input
                  type="text"
                  value={formData.Tema}
                  onChange={(e) =>
                    setFormData({ ...formData, Tema: e.target.value })
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

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalles
                  </label>
                  <textarea
                    
                    value={formData.Detalles}
                    onChange={(e) =>
                      setFormData({ ...formData, Detalles: e.target.value })
                    }
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad
                  </label>
                  <select
                    value={formData.Modalidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Modalidad: e.target.value as "online" | "presencial",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="online">En Línea</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>

              {formData.Modalidad === "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace de Plataforma
                  </label>
                  <input
                    type="url"
                    value={formData.Url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                )}

                {/*fechacurso */}
               
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>

                      <input
                        type="date"
                        value={formData.FechaCurso}
                        onChange={(e) =>
                          setFormData({ ...formData, FechaCurso: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                  focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                   

                      <div>
                               {/*direccion */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Direccion 
                      </label>

                        <input
                        type="text"
                        value={formData.DireccionUbicacion}
                        onChange={(e) =>
                          setFormData({ ...formData, DireccionUbicacion: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      </div>
                        

                       <div className="grid grid-cols-2 gap-4">
                    <div>
                       {/*latitud */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitud
                      </label>
                      <input
                        type="text"
                        value={formData.Latitud}
                        onChange={(e) =>
                          setFormData({ ...formData, Latitud: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                  focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      {/*longitud */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitud
                      </label>
                      <input
                        type="text"
                        value={formData.Longitud}
                        onChange={(e) =>
                          setFormData({ ...formData, Longitud: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                  focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>


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
               key={curso._id}
                className="bg-white rounded-xl border p-4 space-y-2"
              >
            <h3 className="font-semibold text-lg">{curso.Titulo}</h3>
            <p className="text-sm text-gray-600">{curso.Descripcion}</p>
            <p className="text-sm">
              <span className="font-medium">Tema:</span> {curso.Tema}
            </p>
            <p className="text-sm">
              <span className="font-medium">Modalidad:</span> {curso.Modalidad}
            </p>
            <p className="text-sm">
              <span className="font-medium">Fecha:</span> {curso.FechaCurso}
            </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(curso._id)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(curso._id)}
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
