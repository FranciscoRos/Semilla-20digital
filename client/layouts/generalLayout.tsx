import { useNavigate, useLocation, Outlet } from "react-router-dom";
// 1. Importa el icono 'LogOut'
import { Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import logoSD from "@/assets/logoSD.jpg";
import { useAuthUser } from "@/hooks/authUser";
import { useAuth } from "@/providers/authProvider";
import { Toaster } from "@/components/ui/toaster";
import SDloading from "@/assets/SDloading.svg"
export default function LayoutGeneral() {
  const { handleLogout, loginLogout } = useAuthUser();
  const navigate = useNavigate();
  const [rolado,setRolado]=useState(false)
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const {user}=useAuth()
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Inicio", path: "/" },
    { label: "Apoyos", path: "/apoyos" },
    { label: "Cursos", path: "/cursos" },
    { label: "Geomapa", path: "/geomapa" },
    { label: "Asistente", path: "/asistente" },
    { label: "Auditoría", path: "/auditoria" },
    { label: "Roles", path: "/login" },
  ];

  useEffect(()=>{
    if(!user)return 
    setRolado(user.Tipo==="Usuario"?true:false)
  },[user])

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Salir */}
            <div className="flex items-center gap-4">
              {/* 2. Botón Salir Desktop (Actualizado) */}
              <button
                onClick={()=>handleLogout()}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" /> {/* <-- Icono añadido */}
                Salir
              </button>

              {/* Logo */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:opacity-80 transition group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img
                    src={logoSD}
                    alt="Logo Semilla Digital"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="hidden sm:inline">Semilla Digital</span>
              </button>
            </div>

            {/* Navegación Desktop */}
            {rolado && <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`transition-colors text-sm font-medium ${
                    isActive(item.path)
                      ? "text-green-600 border-b-2 border-green-600 pb-2"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>}

            {/* 3. Botón Salir Mobile (Actualizado) */}
            <button
              onClick={()=>handleLogout()}
              className="md:hidden flex items-center gap-2 mr-2 px-3 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" /> {/* <-- Icono añadido */}
              Salir
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-200 py-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium ${
                    isActive(item.path)
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Overlay pantalla bloqueada cuando hay loading */}
      {loginLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]">
              <img src={SDloading} alt="Cargando..." width="100" height="100"/>
        </div>
      )}
            <Toaster/>
      
    </div>
  );
}