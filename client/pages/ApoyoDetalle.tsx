import { ChevronLeft, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function ApoyoDetalle() {
  const navigate = useNavigate();

  return (
    <div>

        {/* Header with back button */}
        <button
          onClick={() => navigate("/apoyos")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a Apoyos
        </button>

        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
          {/* Amount Badge */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Apoyo para la Siembra de Maíz
              </h1>
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <span className="font-bold text-green-700 text-lg">
                $15,000 MXN
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-gray-700">
              Programa de apoyo económico para la compra de semillas de maíz
              criollo y mejorado para pequeños productores. Este programa está
              diseñado para fortalecer la producción agrícola en la región y
              mejorar los rendimientos de los cultivos.
            </p>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Vigencia
              </h3>
              <p className="text-gray-600">Hasta diciembre 2024</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Tipo de Programa
              </h3>
              <p className="text-gray-600">Subsidio Directo</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Requisitos Principales
            </h2>
            <ul className="space-y-3">
              {[
                "Ser productor agrícola activo en la zona sur de Quintana Roo",
                "Tener menos de 5 hectáreas de terreno",
                "Contar con CURP y comprobante de domicilio",
                "No estar siendo beneficiario de otro programa similar",
                "Presentar documentación de propiedad o usufructo del terreno",
                "Participar en capacitación obligatoria",
              ].map((req, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation Needed */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              Documentación Requerida
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Copia de CURP</li>
              <li>• Identificación oficial con fotografía</li>
              <li>• Comprobante de domicilio</li>
              <li>• Documentos de propiedad o título de la tierra</li>
              <li>• RFC (si aplica)</li>
              <li>• Comprobante de cuenta bancaria</li>
            </ul>
          </div>

          {/* Process Steps */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Proceso de Solicitud
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Registro",
                  desc: "Completa tu perfil en la plataforma",
                },
                {
                  step: 2,
                  title: "Solicitud",
                  desc: "Llena la solicitud del programa",
                },
                {
                  step: 3,
                  title: "Validación",
                  desc: "Revisión de documentos (5-10 días)",
                },
                {
                  step: 4,
                  title: "Aprobación",
                  desc: "Notificación del resultado",
                },
                {
                  step: 5,
                  title: "Disposición",
                  desc: "Recibe el apoyo en tu cuenta",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Button */}
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-lg">
            Aplicar Ahora
          </button>
        </div>
    </div>
  );
}
