import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, X, LogOut, Home, HandHeart, BookOpen, Map, Bot, FileSearch, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import logoSD from "@/assets/logoSD.jpg";
import { useAuthUser } from "@/hooks/authUser";
import { useAuth } from "@/providers/authProvider";
import { Toaster } from "@/components/ui/toaster";
import LoadingSDloading from "@/components/loadingSDloading";

export default function LayoutGeneral() {
  const { handleLogout, loginLogout } = useAuthUser();
  const navigate = useNavigate();
  const [rolado, setRolado] = useState(false);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Inicio", path: "/", icon: Home },
    { label: "Apoyos", path: "/apoyos", icon: HandHeart },
    { label: "Cursos", path: "/cursos", icon: BookOpen },
    { label: "Geomapa", path: "/geomapa", icon: Map },
    { label: "Asistente", path: "/asistente", icon: Bot },
    { label: "Auditoría", path: "/auditoria", icon: FileSearch },
    { label: "Roles", path: "/login", icon: UserCog },
  ];

  useEffect(() => {
    if (!user) return;
    setRolado(user.Tipo === "Usuario" ? true : false);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 relative">
      <header className="bg-white border-b-2 border-emerald-100 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo + Salir */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLogout()}
                className="hidden md:flex items-center gap-0 overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:gap-3 group"
              >
                <span className="flex items-center justify-center w-12 h-12">
                  <LogOut className="w-5 h-5" />
                </span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 pr-0 group-hover:pr-4 whitespace-nowrap text-sm">
                  Salir
                </span>
              </button>

              {/* Logo */}
              <button
                onClick={() => (rolado ? navigate("/") : navigate("/admin-panel"))}
                className="flex items-center gap-3 font-bold text-xl text-gray-800 hover:opacity-80 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden ">
                  <img
                    src={logoSD}
                    alt="Logo Semilla Digital"
                    className="w-full h-full object-contain "
                  />
                </div>
                <span className="hidden sm:inline bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                  Semilla Digital
                </span>
              </button>
            </div>

            {/* Navegación Desktop */}
            {rolado && (
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Botones Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Botón Salir Mobile con efecto expandible */}
              <button
                onClick={() => handleLogout()}
                className="flex items-center gap-0 overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:gap-2 group"
              >
                <span className="flex items-center justify-center w-10 h-10">
                  <LogOut className="w-4 h-4" />
                </span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 pr-0 group-hover:pr-3 whitespace-nowrap text-sm">
                  Salir
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t-2 border-emerald-100 py-4 bg-gradient-to-b from-white to-stone-50">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 text-base font-semibold rounded-lg mx-2 my-1 transition-all ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Overlay pantalla bloqueada cuando hay loading */}
      {loginLogout && (
        <LoadingSDloading/>
      )}
      <Toaster />
    </div>
  );
}