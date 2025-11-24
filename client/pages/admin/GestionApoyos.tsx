import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import {
  Apoyo,
  ApoyoPayload,
  getApoyos,
  createApoyo,
  updateApoyo,
  deleteApoyo,
} from "@/services/ApoyoService";

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "",
    institucion_encargada: "",
    institucion_acronimo: "",
    direccion: "",
    horarios_atencion: "",
    telefono_contacto: "",
    correo_contacto: "",
    redes_sociales: "",
    latitud_institucion: "",
    longitud_institucion: "",
    fechaInicio: "",
    fechaFin: "",
    numero_beneficiados_actual: "0",
  });

  // Cargar apoyos al entrar
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

  const resetForm = () => {
    setFormData({
      nombre_programa: "",
      descripcion: "",
      objetivo: "",
      tipo_objetivo: "",
      institucion_encargada: "",
      institucion_acronimo: "",
      direccion: "",
      horarios_atencion: "",
      telefono_contacto: "",
      correo_contacto: "",
      redes_sociales: "",
      latitud_institucion: "",
      longitud_institucion: "",
      fechaInicio: "",
      fechaFin: "",
      numero_beneficiados_actual: "0",
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este apoyo?")) return;

    try {
      await deleteApoyo(id);
      setApoyos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error eliminando apoyo", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ApoyoPayload = {
      nombre_programa: formData.nombre_programa,
      descripcion: formData.descripcion,
      objetivo: formData.objetivo,
      tipo_objetivo: formData.tipo_objetivo,
      institucion_encargada: formData.institucion_encargada,
      institucion_acronimo: formData.institucion_acronimo,
      direccion: formData.direccion,
      horarios_atencion: formData.horarios_atencion,
      telefono_contacto: formData.telefono_contacto,
      correo_contacto: formData.correo_contacto,
      redes_sociales: formData.redes_sociales,
      latitud_institucion: Number(formData.latitud_institucion),
      longitud_institucion: Number(formData.longitud_institucion),
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      numero_beneficiados_actual: Number(
        formData.numero_beneficiados_actual || "0"
      ),
      // Requerimientos / Beneficiados no se manejan desde el admin por ahora
      Requerimientos: [],
      Beneficiados: [],
    };

    try {
      if (editingId === null) {
        // Crear nuevo apoyo
        await createApoyo(payload);
      } else {
        // Actualizar apoyo existente
        await updateApoyo(editingId, payload);
      }

      // Recargar lista desde el backend
      const data = await getApoyos();
      setApoyos(data);

      // Limpiar formulario y cerrar
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error("Error guardando apoyo", error);
      console.log("Respuesta Laravel:", error.response?.data);
    }
  };

  const handleEdit = (apoyo: Apoyo) => {
    setEditingId(apoyo.id);
    setFormData({
      nombre_programa: apoyo.nombre_programa || "",
      descripcion: apoyo.descripcion || "",
      objetivo: apoyo.objetivo || "",
      tipo_objetivo: apoyo.tipo_objetivo || "",
      institucion_encargada: apoyo.institucion_encargada || "",
      institucion_acronimo: apoyo.institucion_acronimo || "",
      direccion: apoyo.direccion || "",
      horarios_atencion: apoyo.horarios_atencion || "",
      telefono_contacto: apoyo.telefono_contacto || "",
      correo_contacto: apoyo.correo_contacto || "",
      redes_sociales: apoyo.redes_sociales || "",
      latitud_institucion:
        apoyo.latitud_institucion?.toString() ?? "",
      longitud_institucion:
        apoyo.longitud_institucion?.toString() ?? "",
      fechaInicio: apoyo.fechaInicio || "",
      fechaFin: apoyo.fechaFin || "",
      numero_beneficiados_actual:
        apoyo.numero_beneficiados_actual?.toString() ?? "0",
    });
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Botón regresar */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Apoyos
          </h1>
          <p className="text-gray-600 mt-1">
            Crea y administra los programas de apoyo disponibles para los productores.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cerrar formulario" : "Nuevo Apoyo"}
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
            {/* Nombre & Objetivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del programa
                </label>
                <input
                  type="text"
                  value={formData.nombre_programa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_programa: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo
                </label>
                <input
                  type="text"
                  value={formData.objetivo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      objetivo: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descripcion: e.target.value,
                  })
                }
                required
                rows={3}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Tipo & Institución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de objetivo
                </label>
                <input
                  type="text"
                  placeholder="Productivo, social, ambiental..."
                  value={formData.tipo_objetivo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_objetivo: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institución encargada
                </label>
                <input
                  type="text"
                  value={formData.institucion_encargada}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institucion_encargada: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Acrónimo & Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acrónimo de la institución
                </label>
                <input
                  type="text"
                  placeholder="SADER, CONAZA, etc."
                  value={formData.institucion_acronimo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institucion_acronimo: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      direccion: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Horarios / Teléfono / Correo / Redes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios de atención
                </label>
                <input
                  type="text"
                  placeholder="Lunes a viernes, 9:00 a 15:00"
                  value={formData.horarios_atencion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      horarios_atencion: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de contacto
                </label>
                <input
                  type="text"
                  value={formData.telefono_contacto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono_contacto: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo de contacto
                </label>
                <input
                  type="email"
                  value={formData.correo_contacto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correo_contacto: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redes sociales / sitio web
                </label>
                <input
                  type="text"
                  value={formData.redes_sociales}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      redes_sociales: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Coordenadas y fechas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitud_institucion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitud_institucion: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitud_institucion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitud_institucion: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fechaInicio: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fechaFin: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Beneficiados actuales */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de beneficiados actuales
              </label>
              <input
                type="number"
                min={0}
                value={formData.numero_beneficiados_actual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numero_beneficiados_actual: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {editingId ? "Guardar cambios" : "Crear apoyo"}
            </button>
          </div>
        </form>
      )}

      {/* Lista de apoyos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {apoyos.map((apoyo) => (
          <div
            key={apoyo.id}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {apoyo.nombre_programa}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {apoyo.descripcion}
              </p>

              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <p>
                  <span className="font-semibold">Objetivo: </span>
                  {apoyo.objetivo}
                </p>
                <p>
                  <span className="font-semibold">Tipo: </span>
                  {apoyo.tipo_objetivo}
                </p>
                <p>
                  <span className="font-semibold">Institución: </span>
                  {apoyo.institucion_encargada} (
                  {apoyo.institucion_acronimo})
                </p>
                <p>
                  <span className="font-semibold">Vigencia: </span>
                  {apoyo.fechaInicio} – {apoyo.fechaFin}
                </p>
                <p>
                  <span className="font-semibold">
                    Beneficiados actuales:{" "}
                  </span>
                  {apoyo.numero_beneficiados_actual}
                </p>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <p>
                  <span className="font-semibold">Dirección: </span>
                  {apoyo.direccion}
                </p>
                <p>
                  <span className="font-semibold">Contacto: </span>
                  {apoyo.telefono_contacto} · {apoyo.correo_contacto}
                </p>
                <p>
                  <span className="font-semibold">Redes: </span>
                  {apoyo.redes_sociales}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(apoyo)}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(apoyo.id)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
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
