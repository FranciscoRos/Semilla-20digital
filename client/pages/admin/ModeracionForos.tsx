import { useState } from "react";
import { ChevronLeft, Trash2, Ban, Eye } from "lucide-react";
import Header from "@/components/Header";
import { demoForoPublicaciones } from "@/services/api";

interface Publicacion {
  id: number;
  titulo: string;
  autor: string;
  contenido: string;
  fecha_creacion: string;
  estado: "aprobada" | "pendiente" | "rechazada";
  reportes: number;
}

const publicacionesConEstado: Publicacion[] = demoForoPublicaciones.map((p) => ({
  ...p,
  estado: "aprobada" as const,
  reportes: Math.floor(Math.random() * 5),
}));

export default function ModeracionForos() {
  const [publicaciones, setPublicaciones] = useState(publicacionesConEstado);
  const [selectedPublication, setSelectedPublication] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todas" | "reportadas">(
    "todas"
  );

  const handleDeletePublication = (id: number) => {
    // TODO: DELETE /api/admin/foros/publicaciones/{id}
    setPublicaciones(publicaciones.filter((p) => p.id !== id));
    alert("Publicación eliminada");
  };

  const handleSuspendUser = (autor: string) => {
    // TODO: POST /api/admin/usuarios/{userId}/suspender
    alert(`Usuario ${autor} suspendido del foro`);
  };

  const filteredPublicaciones =
    filterStatus === "reportadas"
      ? publicaciones.filter((p) => p.reportes > 0)
      : publicaciones;

  const selectedData = publicaciones.find((p) => p.id === selectedPublication);

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moderación de Foros
        </h1>
        <p className="text-gray-600 mb-8">
          Gestiona contenido y usuarios en los foros comunitarios
        </p>

        {/* Filtros */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilterStatus("todas")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filterStatus === "todas"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Todas las Publicaciones
          </button>
          <button
            onClick={() => setFilterStatus("reportadas")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filterStatus === "reportadas"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Reportadas ({publicaciones.filter((p) => p.reportes > 0).length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">
              Publicaciones ({filteredPublicaciones.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPublicaciones.map((pub) => (
                <button
                  key={pub.id}
                  onClick={() => setSelectedPublication(pub.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition border-2 ${
                    selectedPublication === pub.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${pub.reportes > 0 ? "bg-red-50" : ""}`}
                >
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {pub.titulo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Por: {pub.autor}</p>
                  <p className="text-xs text-gray-400 mt-1">{pub.fecha_creacion}</p>
                  {pub.reportes > 0 && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      🚩 {pub.reportes} reporte(s)
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <div className="lg:col-span-2">
            {selectedData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedData.titulo}
                </h2>

                {/* Info del Autor */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Autor</p>
                  <p className="font-semibold text-gray-900">
                    {selectedData.autor}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Publicado: {selectedData.fecha_creacion}
                  </p>
                </div>

                {/* Contenido */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">Contenido</h3>
                  <p className="text-gray-700">{selectedData.contenido}</p>
                </div>

                {/* Reportes */}
                {selectedData.reportes > 0 && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-bold text-red-900 mb-3">
                      Reportes de Usuarios
                    </h3>
                    <p className="text-red-800">
                      Esta publicación ha recibido {selectedData.reportes}{" "}
                      reporte(s) de la comunidad
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                      <Eye className="w-5 h-5" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleDeletePublication(selectedData.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Eliminar
                    </button>
                  </div>

                  <button
                    onClick={() => handleSuspendUser(selectedData.autor)}
                    className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Ban className="w-5 h-5" />
                    Suspender Usuario
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Selecciona una publicación para revisar
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
