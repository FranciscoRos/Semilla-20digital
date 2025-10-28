import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";

interface ValidationRecord {
  id: string;
  name: string;
  folio: string;
  status: "pending" | "valid" | "rejected";
  statusLabel: string;
  statusColor: string;
  submissionDate: string;
}

const validationRecords: ValidationRecord[] = [
  {
    id: "1",
    name: "María Elena Vázquez Hernández",
    folio: "QROO-2024-01234",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
    submissionDate: "2024-12-15",
  },
  {
    id: "2",
    name: "José Antonio Pérez Martín",
    folio: "QROO-2024-001235",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
    submissionDate: "2024-12-14",
  },
  {
    id: "3",
    name: "Carmen Rosa Jiménez",
    folio: "QROO-2024-001236",
    status: "pending",
    statusLabel: "Pendiente de Validación",
    statusColor: "bg-amber-100 text-amber-700",
    submissionDate: "2024-12-13",
  },
];

const validationStats = [
  { label: "Pendientes", value: "3", color: "text-amber-600", icon: "⏳" },
  { label: "Válidos", value: "12", color: "text-green-600", icon: "✓" },
  { label: "Rechazados", value: "2", color: "text-red-600", icon: "✕" },
];

export default function ValidatorDashboard() {
  const navigate = useNavigate();
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  return (
    <div>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Validación
          </h1>
          <p className="text-gray-600 mt-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full align-middle mr-2"></span>
            Sistema SEDARPE · Validador Autorizado
          </p>
        </div>

        {/* Validation Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
          {validationStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
                </div>
                <span className="text-4xl opacity-20">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Records Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Registros Pendientes de Validación
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Revisa y valida los registros de productores
          </p>

          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-semibold text-sm text-gray-700 mb-4">
            <div>Nombre</div>
            <div>Folio</div>
            <div>Estatus</div>
            <div>Fecha</div>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Folio
                      </p>
                      <p className="text-sm text-gray-900">{record.folio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Fecha
                      </p>
                      <p className="text-sm text-gray-900">
                        {record.submissionDate}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${record.statusColor}`}
                    >
                      {record.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {record.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">{record.folio}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${record.statusColor}`}
                    >
                      {record.statusLabel}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      {record.submissionDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm">
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm py-2 rounded bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm py-2 rounded bg-red-50">
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
