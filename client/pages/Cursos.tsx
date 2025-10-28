import { ChevronLeft, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  format: string;
  rating: number;
  featured: boolean;
}

const courses: Course[] = [
  {
    id: "1",
    title: "Gestión Financiera Agrícola",
    category: "Asesoría Financiera",
    description:
      "Aprende a administrar eficientemente los recursos financieros de tu producción agrícola.",
    format: "En Línea",
    rating: 4.8,
    featured: true,
  },
  {
    id: "2",
    title: "Técnicas Avanzadas de Siembra",
    category: "Técnicas de Cultivo",
    description:
      "Metodologías modernas para incrementar la productividad de tus cultivos.",
    format: "Presencial",
    rating: 4.6,
    featured: false,
  },
  {
    id: "3",
    title: "Introducción a la Asesoría Financiera",
    category: "Asesoría Financiera",
    description:
      "Fundamentos básicos para el manejo de finanzas en el sector agrícola.",
    format: "En Línea",
    rating: 4.7,
    featured: false,
  },
  {
    id: "4",
    title: "Sanidad Vegetal Integral",
    category: "Técnicas de Cultivo",
    description:
      "Control orgánico de plagas y enfermedades para cultivos sostenibles.",
    format: "Híbrido",
    rating: 4.9,
    featured: false,
  },
  {
    id: "5",
    title: "Agricultura Sostenible y Orgánica",
    category: "Sostenibilidad",
    description:
      "Prácticas agro-ecológicas para una agricultura rentable y responsable.",
    format: "En Línea",
    rating: 4.5,
    featured: false,
  },
];

const categories = [
  "Todos",
  "Asesoría Financiera",
  "Técnicas de Cultivo",
  "Sostenibilidad",
];

export default function Cursos() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter((course) => {
    const matchCategory =
      selectedCategory === "Todos" || course.category === selectedCategory;
    const matchSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div>
        {/* Header with back button */}
        <button
          onClick={() => navigate("/")}
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

        {/* Search Bar */}
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

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
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

        {/* Featured Course */}
        {filteredCourses.some((c) => c.featured) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cursos Destacados
            </h2>
            {filteredCourses
              .filter((c) => c.featured)
              .map((course) => (
                <div
                  key={course.id}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                        <span className="text-sm font-medium">Más Popular</span>
                      </div>
                      <h3 className="text-2xl font-bold">{course.title}</h3>
                    </div>
                  </div>
                  <p className="mb-4 opacity-90">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {course.format}
                    </span>
                    <button className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition">
                      Ver Curso
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* All Courses */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedCategory === "Todos"
              ? "Todos los Cursos"
              : `Cursos de ${selectedCategory}`}
          </h2>
          <div className="space-y-4">
            {filteredCourses
              .filter((c) => !c.featured)
              .map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">{course.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {course.format}
                    </span>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                      Inscribirse
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
    </div>
  );
}
