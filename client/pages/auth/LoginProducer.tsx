import { useAuthUser } from "@/hooks/authUser";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logoSD from "@/assets/logoSD.jpg";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
export default function LoginProducer() {
  const navigate=useNavigate()
  const{state}=useLocation()

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    loading,
  } =useAuthUser()

useEffect(()=>{
  if(state){
  setEmail(state.correo || '')
  setPassword(state.contrasena || '')
  }
},[state])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoSD}
            alt="Logo Semilla Digital"
            className="w-20 h-20 mx-auto mb-4 hover:scale-110 hover:shadow-lg transition-all duration-300"
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

          <form onSubmit={(e)=>{e.preventDefault();
            handleLogin("Usuario")}} className="space-y-4">
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
              className="text-green-600 hover:text-green-700 font-bold"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
      <Toaster/>
    </div>
  );
}
