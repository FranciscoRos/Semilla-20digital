import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Home, MapPin, Phone, Mail, Search, BadgeCheck } from "lucide-react";
import { getProductoresRegistrados } from "@/services/ProductoresService";
import type { PerfilRegistro } from "@/services/PendientesReviService";
import { useRegistros } from "@/hooks/useRegistros";

export default function GestionProductores() {
  const navigate = useNavigate();
  const {productores,loadingRegistros}=useRegistros()
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const filtrados = useMemo(() => {
    if (!searchTerm) return productores;
    const term = searchTerm.toLowerCase();

    return productores.filter((p) => {
      const u = p.Usuario;
      const nombreCompleto = `${u.Nombre || ""} ${u.Apellido1 || ""} ${u.Apellido2 || ""}`.toLowerCase();
      const curp = (u.Curp || "").toLowerCase();
      const correo = (u.Correo || "").toLowerCase();

      return (
        nombreCompleto.includes(term) ||
        curp.includes(term) ||
        correo.includes(term)
      );
    });
  }, [productores, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Productores registrados
              </h1>
              
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, CURP o correo..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loadingRegistros && (
          <p className="text-sm text-gray-600">Cargando productores registrados...</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loadingRegistros && !error && filtrados.length === 0 && (
          <p className="text-sm text-gray-600">
            No se encontraron productores registrados con el criterio de búsqueda.
          </p>
        )}

        {!loadingRegistros && !error && filtrados.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Productor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    CURP
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Domicilio
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Parcela principal
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Estado registro
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const u = p.Usuario;
                  const dom = u.Domicilio || {
                    Municipio: null,
                    Ciudad: null,
                    Estado: null,
                  };
                  const parcelaPrincipal = u.Parcela && u.Parcela.length > 0 ? u.Parcela[0] : null;

                  const nombreCompleto = `${u.Nombre || ""} ${u.Apellido1 || ""} ${u.Apellido2 || ""}`.trim();

                  return (
                    <tr
                      key={p.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      {/* Productor */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                            <User className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {nombreCompleto || "Sin nombre"}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID Usuario: {u.idUsuario || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CURP */}
                      <td className="px-4 py-3 text-gray-700">
                        {u.Curp || "-"}
                      </td>

                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{u.Telefono || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">
                              {u.Correo || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Domicilio */}
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-gray-700">
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span>
                              {dom.Municipio || dom.Ciudad || "-"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {dom.Ciudad && dom.Estado
                              ? `${dom.Ciudad}, ${dom.Estado}`
                              : dom.Estado || ""}
                          </p>
                        </div>
                      </td>

                      {/* Parcela principal */}
                      <td className="px-4 py-3">
                        {parcelaPrincipal ? (
                          <div className="space-y-1 text-gray-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>
                                {parcelaPrincipal.municipio ||
                                  parcelaPrincipal.ciudad ||
                                  "-"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {parcelaPrincipal.localidad ||
                                parcelaPrincipal.direccionAdicional ||
                                ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Sin parcela registrada
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              p.Estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          <BadgeCheck className="w-3 h-3" />
                          {p.Estado || "Sin estado"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
