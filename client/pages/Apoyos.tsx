import { ChevronLeft, Clock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface SupportProgram {
  id: string;
  title: string;
  amount: string;
  description: string;
  requirements: string[];
  deadline: string;
}

const supportPrograms: SupportProgram[] = [
  {
    id: "1",
    title: "Apoyo para la Siembra de Maíz",
    amount: "$15,000 MXN",
    description:
      "Programa de apoyo económico para la compra de semillas de maíz criollo y mejorado para pequeños productores.",
    requirements: [
      "Ser productor en la zona sur",
      "Tener menos de 5 hectáreas",
    ],
    deadline: "Vigente hasta dic 2024",
  },
  {
    id: "2",
    title: "Fertilizantes Orgánicos 2024",
    amount: "$8,500 MXN",
    description:
      "Subsidio para la adquisición de fertilizantes orgánicos certificados que mejoren la productividad del suelo.",
    requirements: [
      "Certificación orgánica vigente",
      "Máximo 10 hectáreas",
    ],
    deadline: "Vigente hasta dic 2024",
  },
  {
    id: "3",
    title: "Apoyo Ganadero Bovino",
    amount: "$25,000 MXN",
    description:
      "Programa de apoyo para mejorar la infraestructura y sanidad del ganado bovino de pequeños y medianos productores.",
    requirements: ["Poseer rebaño certificado", "Máximo 50 cabezas"],
    deadline: "Vigente hasta dic 2024",
  },
  {
    id: "4",
    title: "Riego y Tecnificación",
    amount: "$12,000 MXN",
    description:
      "Subsidio para sistemas de riego por goteo y tecnificación agrícola en parcelas menores a 2 hectáreas.",
    requirements: ["Acceso a agua", "Predios menores a 2 hectáreas"],
    deadline: "Vigente hasta dic 2024",
  },
];

export default function Apoyos() {
  const navigate = useNavigate();

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitar Apoyos
        </h1>
        <p className="text-gray-600 mb-8">
          Conoce los programas disponibles y solicita los beneficios que te
          corresponden
        </p>

        {/* Support Programs List */}
        <div className="space-y-4">
          {supportPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {program.title}
                </h3>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold text-green-700">
                    {program.amount}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{program.description}</p>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  Requisitos principales:
                </h4>
                <ul className="space-y-1">
                  {program.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{program.deadline}</span>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                  Aplicar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
