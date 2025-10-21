import { useState } from "react";
import { ChevronLeft, CheckCircle, XCircle, FileText } from "lucide-react";
import Header from "@/components/Header";

// DATOS DEMO - Reemplazar con API de Laravel
const solicitudesPendientes = [
  {
    id: 1,
    productor: "María Elena Vázquez",
    apoyo: "Apoyo para Siembra de Maíz",
    montoSolicitado: 15000,
    fecha: "2024-01-15",
    documentos: 3,
    estado: "pendiente" as const,
  },
  {
    id: 2,
    productor: "José Antonio Pérez",
    apoyo: "Fertilizantes Orgánicos",
    montoSolicitado: 8500,
    fecha: "2024-01-14",
    documentos: 2,
    estado: "pendiente" as const,
  },
];

export default function ValidacionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState(solicitudesPendientes);
  const [selectedSolicitud, setSelectedSolicitud] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    // TODO: POST /api/admin/solicitudes/{id}/procesar
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    alert("Solicitud aprobada");
  };

  const handleReject = (id: number) => {
    // TODO: POST /api/admin/solicitudes/{id}/procesar con aprobado: false
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    alert("Solicitud rechazada");
  };

  const selectedData = solicitudes.find((s) => s.id === selectedSolicitud);

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
          Validación de Solicitudes
        </h1>
        <p className="text-gray-600 mb-8">
          Revisa y aprueba las solicitudes de apoyo de productores
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">
              Pendientes ({solicitudes.length})
            </h2>
            <div className="space-y-2">
              {solicitudes.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() => setSelectedSolicitud(sol.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition border-2 ${
                    selectedSolicitud === sol.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {sol.productor}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{sol.apoyo}</p>
                  <p className="text-xs text-gray-400 mt-1">{sol.fecha}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <div className="lg:col-span-2">
            {selectedData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedData.productor}
                </h2>

                {/* Información de la Solicitud */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Información de la Solicitud
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Programa</p>
                      <p className="font-semibold text-gray-900">
                        {selectedData.apoyo}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Monto Solicitado
                        </p>
                        <p className="font-semibold text-gray-900">
                          ${selectedData.montoSolicitado.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha</p>
                        <p className="font-semibold text-gray-900">
                          {selectedData.fecha}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Documentos</h3>
                  <div className="space-y-2">
                    {Array.from({ length: selectedData.documentos }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-100 rounded-lg flex items-center gap-3"
                        >
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            Documento_{i + 1}.pdf
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Formulario de Decisión */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Decisión Administrativa
                  </h3>
                  <textarea
                    placeholder="Agregar comentarios o motivo de rechazo (opcional)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedData.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprobar Solicitud
                  </button>
                  <button
                    onClick={() => handleReject(selectedData.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Selecciona una solicitud para revisar
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
