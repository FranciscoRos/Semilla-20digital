import { useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, Eye, EyeOff, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

 import { useAuthUser } from "@/hooks/authUser";
import logoSD from "@/assets/logoSD.jpg";
import SDloading from "@/assets/SDloading.svg";
import { Toaster } from "@/components/ui/toaster";



export default function LoginProducer() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    loading,
  } = useAuthUser();

  useEffect(() => {
    if (state) {
      setEmail(state.correo || "");
      setPassword(state.contrasena || "");
    }
  }, [state, setEmail, setPassword]);

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 flex flex-col">
  
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={logoSD}
              alt="Logo Semilla Digital"
              className="w-20 h-20 mx-auto mb-4 hover:scale-110 hover:shadow-lg transition-all duration-300 rounded-xl"
            />
            <h1 className="text-3xl font-bold text-green-900">Semilla Digital</h1>
            <p className="text-gray-600 mt-2">
              Portal para Productores Agrícolas
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Iniciar Sesión
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin("Usuario");
              }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Recuérdame</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/recuperar-contrasena")}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            {/* Register Link */}
            <button
              type="button"
              onClick={() => navigate("/registro-productor")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition"
            >
              Crear Cuenta como Productor
            </button>
          </div>

          {/* Admin Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              ¿Eres administrador?{" "}
              <button
                onClick={() => navigate("/login-admin")}
                className="font-bold hover:text-green-700 transition"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <img src={SDloading} alt="Cargando..." width="100" height="100" />
        </div>
      )}
      <Toaster />

      {/* Footer SEDARPE - Ahora fuera del contenedor centrado */}
      <footer className="bg-stone-900 text-stone-300 border-t-4 border-emerald-600">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Columna 1: Identidad */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white p-1">
                  <img
                    src={logoSD}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  SEDARPE
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-400">
                Secretaría de Desarrollo Agropecuario, Rural y Pesca.
                Impulsando el campo quintanarroense hacia un futuro sostenible y
                productivo.
              </p>
            </div>

            {/* Columna 2: Contacto */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-emerald-700 pb-2 inline-block">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Av. Venustiano Carranza 201, Col. Centro
                    <br />
                    Chetumal, Quintana Roo, México
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="hover:text-emerald-400 transition-colors">
                    (983) 832 1234
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                  <a
                    href="mailto:contacto@sedarpe.gob.mx"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    contacto@sedarpe.gob.mx
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Enlaces de Gobierno */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-emerald-700 pb-2 inline-block">
                Enlaces Institucionales
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://qroo.gob.mx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Gobierno del Estado
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Transparencia
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Aviso de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 mt-10 pt-6 text-center text-xs text-stone-500">
            <p>
              © {new Date().getFullYear()} Semilla Digital - Plataforma
              impulsada por SEDARPE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}