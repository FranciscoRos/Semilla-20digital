import { useState } from "react";
import { ChevronLeft, MessageCircle, User, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { demoForoPublicaciones } from "@/services/api";

const temas = [
  { id: 1, nombre: "Cultivo de Maíz", publicaciones: 45 },
  { id: 2, nombre: "Ganadería", publicaciones: 32 },
  { id: 3, nombre: "Técnicas de Riego", publicaciones: 28 },
  { id: 4, nombre: "Plagas y Enfermedades", publicaciones: 52 },
];

export default function ForosDiscusion() {
  const [selectedTheme, setSelectedTheme] = useState(1);
  const [showNewPost, setShowNewPost] = useState(false);

  const filteredPublicaciones = demoForoPublicaciones.filter(
    (p) => p.tema_id === selectedTheme,
  );

  return (
    <div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Foros de Discusión
        </h1>
        <p className="text-gray-600 mb-8">
          Comparte experiencias y aprende de otros productores
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Temas */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-4">Temas</h2>
              <div className="space-y-2">
                {temas.map((tema) => (
                  <button
                    key={tema.id}
                    onClick={() => setSelectedTheme(tema.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedTheme === tema.id
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <p className="font-medium text-sm">{tema.nombre}</p>
                    <p
                      className={`text-xs mt-1 ${
                        selectedTheme === tema.id
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {tema.publicaciones} publicaciones
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {temas.find((t) => t.id === selectedTheme)?.nombre}
              </h2>
              <button
                onClick={() => setShowNewPost(!showNewPost)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Nueva Publicación
              </button>
            </div>

            {/* New Post Form */}
            {showNewPost && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Crear Nueva Publicación
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Título de tu publicación"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <textarea
                      placeholder="Comparte tu experiencia o pregunta..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
                      Publicar
                    </button>
                    <button
                      onClick={() => setShowNewPost(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Publicaciones */}
            <div className="space-y-4">
              {filteredPublicaciones.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {pub.titulo}
                    </h3>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                      {pub.respuestas} respuestas
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {pub.contenido}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {pub.autor}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {pub.fecha_creacion}
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {pub.respuestas} respuestas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
