import { useState } from "react";
import { ChevronLeft, TrendingUp, Users, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import { demoApoyos, demoTransparencia } from "@/services/api";

export default function PanelTransparencia() {
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  const selectedData = selectedProgram
    ? demoApoyos.find((a) => a.id === selectedProgram)
    : null;

  return (
    <div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Transparencia
        </h1>
        <p className="text-gray-600 mb-8">
          Visualiza cómo se distribuyen los recursos públicos
        </p>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Monto Total Distribuido
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ${demoTransparencia.monto_total_distribuido.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Beneficiarios Totales
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {demoTransparencia.beneficiarios_total.toLocaleString()}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Programas Activos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {demoTransparencia.programas_activos}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Detalle por Programa */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Programas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">Programas</h2>
            <div className="space-y-2">
              {demoApoyos.map((apoyo) => (
                <button
                  key={apoyo.id}
                  onClick={() => setSelectedProgram(apoyo.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedProgram === apoyo.id
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium truncate">{apoyo.nombre}</p>
                  <p
                    className={`text-xs mt-1 ${
                      selectedProgram === apoyo.id
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    ${apoyo.monto.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detalles del Programa */}
          <div className="lg:col-span-3">
            {selectedData ? (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedData.nombre}
                </h2>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">
                      Presupuesto Total
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${selectedData.monto.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-2">Beneficiarios</p>
                    <p className="text-2xl font-bold text-green-900">
                      {selectedData.beneficiarios}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">
                      Porcentaje Ejercido
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {Math.round(
                        (selectedData.beneficiarios /
                          demoTransparencia.beneficiarios_total) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-600">{selectedData.descripcion}</p>
                </div>

                {/* Distribución Municipal */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">
                    Distribución por Municipio
                  </h3>
                  <div className="space-y-3">
                    {["Chetumal", "Playa del Carmen", "Cancún", "Cozumel"].map(
                      (municipio) => (
                        <div key={municipio}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">
                              {municipio}
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                              {Math.floor(Math.random() * 40) + 20}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.floor(Math.random() * 40) + 20}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500 text-lg">
                  Selecciona un programa para ver sus detalles
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
