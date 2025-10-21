import { useState } from "react";
import { ChevronLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { demoApoyos } from "@/services/api";

export default function SolicitarApoyos() {
  const [selectedSupport, setSelectedSupport] = useState<number | null>(null);
  const [userApplications] = useState([
    {
      id: 1,
      apoyoId: 1,
      status: "approved" as const,
      solicitado: "2024-01-10",
      resultado: "2024-01-20",
    },
  ]);

  const isEligible = (apoyo: typeof demoApoyos[0]) => {
    // Lógica personalizada basada en perfil del usuario
    return true;
  };

  const getApplicationStatus = (apoyoId: number) => {
    return userApplications.find((app) => app.apoyoId === apoyoId);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      approved: {
        label: "Aprobado",
        color: "text-green-600 bg-green-50",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pending: {
        label: "En Revisión",
        color: "text-yellow-600 bg-yellow-50",
        icon: <Clock className="w-4 h-4" />,
      },
      rejected: {
        label: "Rechazado",
        color: "text-red-600 bg-red-50",
        icon: <AlertCircle className="w-4 h-4" />,
      },
    };
    return labels[status] || labels.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar Apoyos</h1>
        <p className="text-gray-600 mb-8">
          Conoce los programas disponibles y aplica a los que eres elegible
        </p>

        {/* Apoyos Disponibles */}
        <div className="space-y-4">
          {demoApoyos.map((apoyo) => {
            const application = getApplicationStatus(apoyo.id);
            const statusInfo = application
              ? getStatusLabel(application.status)
              : null;

            return (
              <div
                key={apoyo.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {apoyo.nombre}
                    </h3>
                    {isEligible(apoyo) && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        ✓ Cumples los requisitos
                      </p>
                    )}
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="font-semibold text-green-700">
                      ${apoyo.monto.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{apoyo.descripcion}</p>

                {/* Requisitos */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    Requisitos:
                  </h4>
                  <ul className="space-y-1">
                    {apoyo.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status y Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm">
                    <p className="text-gray-600">
                      Vigencia: {apoyo.vigencia_inicio} a {apoyo.vigencia_fin}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {apoyo.beneficiarios} beneficiarios
                    </p>
                  </div>

                  {application ? (
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}
                    >
                      {statusInfo?.icon}
                      {statusInfo?.label}
                    </div>
                  ) : (
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                      Aplicar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Historial de Solicitudes */}
        {userApplications.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Tu Historial de Solicitudes
            </h2>
            <div className="space-y-4">
              {userApplications.map((app) => {
                const apoyo = demoApoyos.find((a) => a.id === app.apoyoId);
                const statusInfo = getStatusLabel(app.status);
                return (
                  <div
                    key={app.id}
                    className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {apoyo?.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Solicitado: {app.solicitado}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}
                    >
                      {statusInfo?.icon}
                      {statusInfo?.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
