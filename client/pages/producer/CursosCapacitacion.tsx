import { useState } from "react";
import { ChevronLeft, Search, Star, MapPin, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { demoCursos } from "@/services/api";

const categorias = [
  "Todos",
  "Asesoría Financiera",
  "Técnicas de Siembra",
  "Ganadería Sostenible",
];

export default function CursosCapacitacion() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCursos = demoCursos.filter((curso) => {
    const matchCategory =
      selectedCategory === "Todos" || curso.categoria === selectedCategory;
    const matchSearch = curso.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cursos y Capacitación
        </h1>
        <p className="text-gray-600 mb-8">
          Desarrolla tus habilidades con nuestros programas de capacitación
        </p>

        {/* Búsqueda */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cursos */}
        <div className="space-y-4">
          {filteredCursos.map((curso) => (
            <div
              key={curso.id}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {curso.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{curso.categoria}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">
                    {curso.calificacion}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{curso.descripcion}</p>

              <div className="space-y-2 mb-4">
                {curso.modalidad === "presencial" && curso.fecha_inicio && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {curso.fecha_inicio}
                  </div>
                )}
                {curso.modalidad === "presencial" && curso.ubicacion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {curso.ubicacion}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      curso.modalidad === "online"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {curso.modalidad === "online" ? "En Línea" : "Presencial"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {curso.inscritos} inscritos
                  </span>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                  Inscribirse
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCursos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No se encontraron cursos con esos criterios
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
