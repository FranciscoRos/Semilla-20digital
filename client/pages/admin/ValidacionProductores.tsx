import { useState } from "react";
import { ChevronLeft, CheckCircle, XCircle, Eye } from "lucide-react";
import Header from "@/components/Header";
import { demoProductoresPendientes } from "@/services/api";

export default function ValidacionProductores() {
  const [pendientes, setPendientes] = useState(demoProductoresPendientes);
  const [selectedProducer, setSelectedProducer] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    // TODO: Llamar a API de Laravel
    // POST /api/admin/productores/{id}/validar
    setPendientes((prev) => prev.filter((p) => p.id !== id));
    alert("Productor aprobado correctamente");
  };

  const handleReject = (id: number) => {
    // TODO: Llamar a API de Laravel
    // POST /api/admin/productores/{id}/validar con aprobado: false
    setPendientes((prev) => prev.filter((p) => p.id !== id));
    alert("Productor rechazado");
  };

  const selectedData = pendientes.find((p) => p.id === selectedProducer);

  return (
    <div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Validación de Productores
        </h1>
        <p className="text-gray-600 mb-8">
          Revisa y aprueba los registros pendientes de verificación
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">
              Pendientes ({pendientes.length})
            </h2>
            <div className="space-y-2">
              {pendientes.map((productor) => (
                <button
                  key={productor.id}
                  onClick={() => setSelectedProducer(productor.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition border-2 ${
                    selectedProducer === productor.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {productor.nombre}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {productor.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {productor.fecha_registro}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <div className="lg:col-span-2">
            {selectedData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedData.nombre}
                </h2>

                {/* Información Personal */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">CURP</p>
                      <p className="font-semibold text-gray-900">
                        {selectedData.curp}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {selectedData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Registro</p>
                      <p className="font-semibold text-gray-900">
                        {selectedData.fecha_registro}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="font-semibold text-yellow-600 inline-block px-3 py-1 bg-yellow-100 rounded-full text-sm">
                        {selectedData.estado}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mapa de Parcela */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Polígono de Parcela
                  </h3>
                  <div className="bg-green-50 rounded-lg h-64 flex items-center justify-center border-2 border-green-200">
                    <p className="text-gray-600">
                      Mapa interactivo para visualizar la parcela
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    GeoJSON: {selectedData.poligono_parcela.substring(0, 50)}...
                  </p>
                </div>

                {/* Documentos */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Documentos Subidos
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Identificación_oficial.pdf
                      </span>
                      <Eye className="w-4 h-4 text-blue-600 cursor-pointer" />
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Comprobante_domicilio.pdf
                      </span>
                      <Eye className="w-4 h-4 text-blue-600 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedData.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprobar
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
                  Selecciona un productor para revisar sus detalles
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
