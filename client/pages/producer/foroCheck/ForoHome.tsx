import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Sprout, 
  Beef, 
  Fish, 
  House, 
  ChevronRight, 
  MessageCircle,
  Leaf,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { getCategorias, getTemas } from "@/services/useForo";
import { Categoria } from "@/services/api";

// 1. Mapa de Iconos
const iconMap: Record<string, React.ReactNode> = {
  sprout: <Sprout className="w-7 h-7" />,
  beef: <Beef className="w-7 h-7" />,
  fish: <Fish className="w-7 h-7" />,
  house: <House className="w-7 h-7" />,
};

export default function ForoHome() {
  const queryClient = useQueryClient();
  
  const { data: categorias, isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
    initialData: queryClient.getQueryData(["categorias"]) as Categoria[]
  });

  const prefetch = (idSub: string) => {
    queryClient.prefetchQuery({
        queryKey: ["temas", idSub],
        queryFn: () => getTemas(idSub),
        staleTime: 1000 * 60 * 2
    });
  };
  
  // Skeleton Loader Premium
  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded-full" />
            <div className="h-12 w-3/4 md:w-1/2 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-full md:w-1/3 bg-slate-200 rounded-lg" />
        </div>
        {/* Grid Skeleton */}
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 h-64">
              <div className="flex gap-5 mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-green-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* ================= HERO SECTION ================= */}
        <header className="mb-12 md:mb-16 relative">
          {/* Decoración de fondo sutil */}
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-green-500 text-green-500" />
              Comunidad Agrícola
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
              Foro <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Semilla Digital</span>
            </h1>
            
            <p className="text-slate-500 max-w-2xl text-lg md:text-xl leading-relaxed font-medium">
              Un ecosistema digital para compartir sabiduría, conectar generaciones y cultivar el futuro del campo juntos.
            </p>
          </div>
        </header>

        {/* ================= GRID DE CATEGORÍAS ================= */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {categorias?.map((cat) => (
            <div 
              key={cat.id} 
              className="group flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-green-900/5 hover:border-green-200 transition-all duration-500"
            >
              {/* --- Encabezado de la Tarjeta --- */}
              <div className="p-8 pb-6 relative overflow-hidden">
                {/* Fondo decorativo en hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[4rem]" />

                <div className="flex items-start gap-6 relative z-10">
                  {/* Icono Grande Estilizado */}
                  <div className="flex-shrink-0 p-4 bg-slate-50 text-slate-600 rounded-2xl shadow-inner group-hover:bg-green-600 group-hover:text-white group-hover:shadow-green-200 transition-all duration-300">
                    {iconMap[cat.Icono] || <Sprout className="w-7 h-7"/>}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 group-hover:text-green-800 transition-colors leading-tight">
                      {cat.Nombre}
                    </h2>
                    <p className="text-slate-500 mt-2 leading-relaxed text-sm font-medium">
                      {cat.Descripcion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divisor punteado */}
              <div className="px-8">
                <div className="h-px w-full border-t border-dashed border-slate-200 group-hover:border-green-100 transition-colors" />
              </div>

              {/* --- Lista de Subcategorías --- */}
              <div className="flex-1 p-6 pt-4 bg-gradient-to-b from-white to-slate-50/30">
                <div className="space-y-2">
                  {cat.SubCategorias.map((sub) => (
                    <Link
                      key={sub.idSub}
                      to={`/temas/${sub.idSub}`}
                      onMouseEnter={() => prefetch(sub.idSub)}
                      className="group/item flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:ring-1 hover:ring-slate-100 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {/* Indicador visual pequeño */}
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-green-500 transition-colors" />
                        
                        <span className="font-semibold text-slate-700 text-lg group-hover/item:text-green-700 transition-colors">
                          {sub.Nombre}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         {/* Badge de contador */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 group-hover/item:bg-green-50 group-hover/item:border-green-100 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-green-600" />
                          <span className="text-xs font-bold text-slate-500 group-hover/item:text-green-700">
                            {sub.CantidadTemas}
                          </span>
                        </div>

                        {/* Flecha solo visible en hover (o tenue) */}
                        <ArrowRight className="w-5 h-5 text-slate-300 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-green-600 transition-all duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Footer sutil de la tarjeta */}
              <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-green-400 opacity-50 transition-all duration-500" />
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}