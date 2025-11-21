import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UsuarioPendiente {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  creado: string;
}

// Datos de ejemplo, luego los cambiamos por la API
const demoUsuariosPendientes: UsuarioPendiente[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    correo: "juan@example.com",
    rol: "productor",
    creado: "2025-11-15 10:30",
  },
  {
    id: 2,
    nombre: "María López",
    correo: "maria@example.com",
    rol: "técnico",
    creado: "2025-11-16 09:15",
  },
];

export default function UsuariosRevision() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioPendiente[]>(demoUsuariosPendientes);

  const handleAprobar = (id: number) => {
    // TODO: aquí luego llamamos al endpoint /aprobar
    console.log("Aprobar usuario", id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const handleRechazar = (id: number) => {
    // TODO: aquí luego llamamos al endpoint /rechazar
    console.log("Rechazar usuario", id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header simple */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-full border p-1 hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Revisión de usuarios</h1>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Aquí puedes revisar y decidir si apruebas o rechazas a los usuarios que se han registrado en la plataforma.
      </p>

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Nombre</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Correo</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Rol</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Fecha de registro</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.nombre}</td>
                <td className="px-3 py-2">{u.correo}</td>
                <td className="px-3 py-2 capitalize">{u.rol}</td>
                <td className="px-3 py-2">{u.creado}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAprobar(u.id)}
                      className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRechazar(u.id)}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {usuarios.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-sm text-gray-500"
                >
                  No hay usuarios pendientes de revisión.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
