import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Eye,
  ChevronLeft,
  Plus,
  X,
  Tag,
  User,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { getComentarios, getTemas } from "@/services/useForo";
import { Tema } from "@/services/api";

export default function ForoTemas() {
  const { idSubCategoria } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newInput, setNewInput] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: temas,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["temas", idSubCategoria],
    queryFn: () => getTemas(idSubCategoria!),
    enabled: !!idSubCategoria,
    initialData: queryClient.getQueryData(["temas", idSubCategoria]) as Tema[],
  });

  const prefetchTema = (idTema: string) => {
    queryClient.prefetchQuery({
      queryKey: ["comentarios", idTema],
      queryFn: () => getComentarios(idTema),
      staleTime: 1000 * 60 * 2,
    });
  };

  const temasFilter = useMemo(() => {
    if (!temas) return [];
    if (!filterDate && !newInput) return temas;
    const input = newInput.toLowerCase().trim();

    const temasFilterFunc = (t: Tema) => {
      const trueInput = input
        ? t.Titulo.toLowerCase().includes(input) ||
          t.Autor.Nombre.toLowerCase().includes(input)
        : true;

      const trueDate = filterDate ? filterDate.includes(t.Creado) : true;

      return trueInput && trueDate;
    };
    return temas.filter(temasFilterFunc);
  }, [filterDate, temas, newInput]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    setIsSubmitting(true);

    console.log("Creando tema:", {
      title: newTopicTitle,
      content: newTopicContent,
      subCat: idSubCategoria,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      alert("Tema creado con éxito (Simulación)");
    }, 1500);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="flex justify-between items-end">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded-full" />
              <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-12 w-40 bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white h-48 rounded-3xl border border-slate-100 p-8"
              />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-green-100 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* ================= HEADER DE NAVEGACIÓN Y TÍTULO ================= */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 hover:text-green-700 transition-all mb-6 font-medium pl-1"
          >
            <div className="p-1.5 rounded-full bg-white border border-slate-200 shadow-sm group-hover:border-green-200 group-hover:bg-green-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="group-hover:translate-x-1 transition-transform">
              Volver a Categorías
            </span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-bl-[100%] -mr-16 -mt-16 opacity-60 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100 mb-3">
                <Sparkles className="w-3 h-3" /> Comunidad
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Discusiones Recientes
              </h2>
              <p className="text-slate-500 mt-2 text-lg max-w-xl">
                Explora ideas, resuelve dudas y conecta con otros miembros de la
                comunidad.
              </p>
            </div>

            <div className="gap-3 relative z-10 space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-green-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Iniciar Nuevo Tema</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-20 mb-5">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-2 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row gap-3 w-full">
              {/* Search Bar */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
                  placeholder="Buscar por título, autor o palabra clave..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Date Filter & Actions */}
              <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="relative group min-w-[160px]">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-700 font-medium appearance-none cursor-pointer"
                  />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden ${newInput || filterDate ? "w-auto opacity-100" : "w-0 opacity-0 px-0"}`}
                >
                  {(newInput || filterDate) && (
                    <button
                      onClick={() => {
                        setNewInput("");
                        setFilterDate("");
                      }}
                      className="flex px-3 py-4 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Separador vertical */}
                <div className="w-px bg-slate-200 my-2 mx-1 hidden lg:block" />

                {/* Botón Nuevo Tema */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-green-600/30 transition-all transform active:scale-95 whitespace-nowrap"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {["Todos", "Populares", "Sin Respuesta", "Mis Temas"].map(
                  (filter, idx) => (
                    <button
                      key={filter}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        idx === 0
                          ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-green-300 hover:text-green-700"
                      }`}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= LISTA DE TEMAS ================= */}
        <div className="space-y-5">
          {temas?.length === 0 ||
            (!temas && (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  Aún no hay temas aquí
                </h3>
                <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                  Sé la primera persona en iniciar una conversación interesante
                  en esta categoría.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-green-600 font-semibold hover:underline"
                >
                  Crear el primer tema
                </button>
              </div>
            ))}

          {temasFilter?.map((tema) => (
            <div
              key={tema.id}
              onClick={() => navigate(`/hilo/${tema.id}`)}
              onMouseEnter={() => prefetchTema(tema.id)}
              className="group bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-green-200 transition-all duration-300 relative overflow-hidden"
            >
              {/* Hover effect bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Contenido Principal */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tema.Tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-slate-100 group-hover:border-green-100 group-hover:bg-green-50 group-hover:text-green-700 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    {tema.Verificado && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-blue-100">
                        <Sparkles className="w-3 h-3" /> Verificado
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors mb-2 leading-snug">
                    {tema.Titulo}
                  </h3>

                  {/* Extracto del contenido (opcional si lo tienes en el objeto tema) */}
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    Haga clic para ver la discusión completa y participar en el
                    hilo...
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-white ring-1 ring-slate-100">
                        {tema.Autor.Nombre.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {tema.Autor.Nombre}
                      </span>
                    </div>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-xs text-slate-400">
                      {tema.Autor.Ubicacion || "Comunidad"}
                    </span>
                  </div>
                </div>

                {/* Estadísticas / Lateral derecho */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-green-600 transition-colors mb-1">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-lg font-bold text-slate-700 group-hover:text-green-700">
                        {tema.Comentarios}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Respuestas
                    </span>
                  </div>

                  <div className="hidden md:block w-8 h-px bg-slate-100 my-1" />

                  <div className="text-center flex md:block items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {tema.Vistas}
                      </span>
                    </div>
                  </div>

                  {/* Flecha móvil */}
                  <div className="md:hidden ml-auto">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL MEJORADO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  Crear Nuevo Tema
                </h3>
                <p className="text-sm text-slate-500">
                  Comparte tus dudas o conocimientos
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateTopic} className="p-6 md:p-8 space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Título del Tema <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ej: La optimizacion en el uso de insecticidas"
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Detalle del Tema <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  rows={6}
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Describe tu situación con el mayor detalle posible para obtener mejores respuestas..."
                  disabled={isSubmitting}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !newTopicTitle.trim() ||
                    !newTopicContent.trim()
                  }
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-slate-900/20 hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Publicar Tema</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Send(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}
