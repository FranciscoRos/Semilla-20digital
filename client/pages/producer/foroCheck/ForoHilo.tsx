import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ThumbsUp, 
  MessageCircle, 
  Send,
  CornerDownRight,
  ShieldCheck,
  MoreHorizontal,
  Sparkles
} from "lucide-react";
// Asumimos que las interfaces también se exportan desde aquí o desde un archivo de tipos compartido
import { getComentarios } from "@/services/useForo";
import { ComentariosTema } from "@/services/api";

export default function ForoHilo() {
  const { idTema } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState("");

  const comentariosQuery = useQuery({
    queryKey: ["comentarios", idTema],
    queryFn: () => getComentarios(idTema!),
    enabled: !!idTema,
    initialData:queryClient.getQueryData(["comentarios", idTema]) as ComentariosTema
  });

  // Mutación para agregar comentario (Asegúrate de conectar esto a tu API real)
  const mutation = useMutation({
    mutationFn: async (text: string) => {
      // Aquí iría tu llamada real a la API, ej: postComentario(idTema, text)
      return new Promise((resolve) => setTimeout(resolve, 1000)); 
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comentarios", idTema] });
      // Puedes reemplazar el alert por un toast notification
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      mutation.mutate(newComment);
    }
  };

  // Helper para formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  // Skeleton Loader
  if (comentariosQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        {/* Header Skeleton */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex gap-4 items-center mb-6">
             <div className="h-12 w-12 bg-gray-200 rounded-full" />
             <div className="space-y-2">
               <div className="h-4 w-32 bg-gray-200 rounded" />
               <div className="h-3 w-24 bg-gray-100 rounded" />
             </div>
           </div>
           <div className="h-8 w-3/4 bg-gray-200 rounded" />
           <div className="h-4 w-full bg-gray-100 rounded" />
           <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>
        {/* Comments Skeleton */}
        <div className="space-y-6 pl-4 md:pl-10 border-l-2 border-gray-100">
          {[1, 2].map(i => (
             <div key={i} className="bg-white h-40 rounded-2xl border border-gray-100 p-6 relative ml-4" />
          ))}
        </div>
      </div>
    );
  }

  // Si hay error o no hay datos
  if (comentariosQuery.isError || !comentariosQuery.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
         <p>No se pudo cargar el tema.</p>
         <button onClick={() => navigate(-1)} className="mt-4 text-green-600 hover:underline">Volver</button>
      </div>
    );
  }

  const data = comentariosQuery.data as ComentariosTema;
  const tema = data.Tema;
  const comentarios = data.Comentarios || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans selection:bg-green-100">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        
        {/* --- Navegación Superior --- */}
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-slate-500 hover:text-green-700 transition-all duration-300 font-medium pl-2"
          >
            <div className="p-2 rounded-full bg-white border border-slate-200 shadow-sm group-hover:border-green-200 group-hover:bg-green-50 transition-all">
               <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="group-hover:translate-x-1 transition-transform">Volver a la comunidad</span>
          </button>
        </nav>

        {/* ================= TEMA PRINCIPAL (HEADER) ================= */}
        <div className="relative mb-12">
          {/* Tarjeta del Tema Principal */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10">
            
            {/* Barra superior decorativa */}
            <div className="h-2 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400" />

            <div className="p-6 md:p-10">
              {/* Título */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight mt-2">
                {tema.Titulo}
              </h1>

              {/* Contenido Inicial */}
              <div className="prose prose-slate max-w-none mb-8 text-lg text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                {tema.ComentarioInicial}
              </div>

              {/* Footer del Autor del Tema */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-white">
                      {tema.Autor.Nombre.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white" title="Autor Original">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tema.Autor.Nombre}</p>
                    <p className="text-xs text-slate-500 font-medium">Iniciador del Hilo</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Línea conectora visual hacia los comentarios */}
          <div className="absolute left-8 md:left-12 top-full h-16 w-0.5 bg-gradient-to-b from-slate-200 to-transparent z-0" />
        </div>

        {/* ================= SECCIÓN DE RESPUESTAS ================= */}
        <div className="max-w-4xl ml-auto mr-0 md:mr-4 relative">
          
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700">
                <MessageCircle className="w-5 h-5" />
              </span>
              {comentarios.length} Respuestas
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-8 relative">
            {/* Línea de hilo continua */}
            <div className="absolute left-[-20px] md:left-[-30px] top-0 bottom-0 w-0.5 bg-slate-200/60 hidden md:block" />

            {comentarios.map((comentario) => {
              const esAutorDelTema = comentario.Autor.idUsuario === tema.Autor.idUsuario;
              
              return (
                <div 
                  key={comentario.id} 
                  className={`relative group transition-all duration-300 hover:translate-x-1 ${
                    esAutorDelTema ? 'md:-ml-4' : ''
                  }`}
                >
                  {/* Conector horizontal para escritorio */}
                  <div className="absolute top-8 -left-[30px] w-[30px] h-0.5 bg-slate-200 hidden md:block group-hover:bg-green-300 transition-colors" />

                  <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 ${
                    esAutorDelTema 
                      ? "bg-white border-green-200 shadow-green-100 ring-1 ring-green-100" 
                      : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                  }`}>
                    
                    {/* Header del Comentario */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          esAutorDelTema 
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {comentario.Autor.Nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {comentario.Autor.Nombre}
                            </span>
                            {esAutorDelTema && (
                              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-green-200">
                                Autor
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {formatDate(comentario.FechaPublicacion)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido del Comentario */}
                    <div className="text-slate-700 text-sm md:text-base leading-relaxed mb-4 pl-13">
                      {comentario.Contenido}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                      <button className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors group/btn">
                        <div className="p-1.5 rounded-full group-hover/btn:bg-green-50 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{comentario.Utilidad || 0} Útil</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group/btn ml-auto md:ml-0">
                        <div className="p-1.5 rounded-full group-hover/btn:bg-blue-50 transition-colors">
                          <CornerDownRight className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">Responder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= INPUT FLOTANTE ================= */}
        <div className="mt-12 sticky bottom-6 z-30">
          <div className="max-w-4xl ml-auto bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl shadow-slate-300/50 border border-green-100/50 ring-1 ring-slate-900/5">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <div className="hidden md:flex flex-col justify-end pb-3 pl-3">
                 <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                   Yo
                 </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="comment" className="sr-only">Escribe tu respuesta</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none resize-none text-slate-800 placeholder:text-slate-400 min-h-[50px] max-h-[150px]"
                  style={{
                    // Hack simple para auto-resize si se desea
                    fieldSizing: "content"
                  } as React.CSSProperties} 
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !newComment.trim()}
                className="mb-1 mr-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                 {mutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <Send className="w-5 h-5" />
                 )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}