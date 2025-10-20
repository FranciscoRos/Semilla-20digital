import { ChevronLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

interface ValidationRecord {
  id: string;
  name: string;
  folio: string;
  status: "pending" | "valid" | "rejected";
  statusLabel: string;
  statusColor: string;
}

const validationRecords: ValidationRecord[] = [
  {
    id: "1",
    name: "María Elena Vázquez Hernández",
    folio: "QROO-2024-01234",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "2",
    name: "José Antonio Pérez Martín",
    folio: "QROO-2024-001235",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "3",
    name: "Carmen Rosa Jiménez",
    folio: "QROO-2024-001236",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
  },
];

const validationStats = [
  { label: "Pendientes de Validación", value: "3", color: "text-amber-600" },
  { label: "Válido dos Hoy", value: "0", color: "text-green-600" },
  { label: "Rechazados Hoy", value: "0", color: "text-red-600" },
];

export default function Auditoria() {
  const navigate = useNavigate();
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header with back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Auditoría
          </h1>
          <p className="text-gray-600 mt-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full align-middle mr-2"></span>
            Sistema SEDARPE · Auditor Autorizado
          </p>
        </div>

        {/* Validation Stats */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Validación de Registros
          </h2>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
            {validationStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Records Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Registros Pendientes de Verificación
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Selecciona un registro para revisar los detalles
          </p>

          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-sm text-gray-700 mb-4">
            <div>Nombre Completo</div>
            <div>Folio Único</div>
            <div>Estatus</div>
            <div>Acciones</div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {validationRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Nombre
                    </p>
                    <p className="font-semibold text-gray-900">{record.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Folio
                      </p>
                      <p className="font-semibold text-gray-900">
                        {record.folio}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Estatus
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${record.statusColor}`}
                      >
                        {record.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{record.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{record.folio}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${record.statusColor}`}
                    >
                      {record.statusLabel}
                    </span>
                  </div>
                  <div>
                    <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm">
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>

                {/* Mobile Action Button */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
                  <button className="w-full text-green-600 hover:text-green-700 font-medium text-sm flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
