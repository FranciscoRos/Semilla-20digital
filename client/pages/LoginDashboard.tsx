import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CheckSquare, Settings } from "lucide-react";

export default function LoginDashboard() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "producer",
      title: "Productor",
      description: "Accede a apoyos, cursos y recursos agrícolas",
      icon: <User className="w-12 h-12" />,
      color: "from-green-500 to-green-600",
      path: "/producer-dashboard",
    },
    {
      id: "validator",
      title: "Validador",
      description: "Revisa y valida solicitudes de productores",
      icon: <CheckSquare className="w-12 h-12" />,
      color: "from-blue-500 to-blue-600",
      path: "/validator-dashboard",
    },
    {
      id: "admin",
      title: "Administrador",
      description: "Gestiona el sistema y reportes",
      icon: <Settings className="w-12 h-12" />,
      color: "from-purple-500 to-purple-600",
      path: "/admin-dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            SD
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Semilla Digital Q. Roo
          </h1>
          <p className="text-gray-600 text-lg">
            Sistema de Apoyo Agrícola - Selecciona tu rol
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                navigate(role.path);
              }}
              className="group"
            >
              <div
                className={`bg-gradient-to-br ${role.color} rounded-lg p-8 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer`}
              >
                <div className="flex justify-center mb-4 opacity-80 group-hover:opacity-100 transition">
                  {role.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2">{role.title}</h2>
                <p className="text-sm text-white text-opacity-90">
                  {role.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>
            ¿Necesitas ayuda? Contacta al equipo de soporte en
            <span className="font-semibold"> support@semilladigital.mx</span>
          </p>
        </div>
      </div>
    </div>
  );
}
