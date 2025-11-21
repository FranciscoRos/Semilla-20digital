import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuthUser } from "@/hooks/authUser";
import { Toaster } from "@/components/ui/toaster";
import SDloading from "@/assets/SDloading.svg"
export default function LoginAdmin() {

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 hover:scale-110 hover:shadow-lg transition-all duration-300">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Semilla Digital</h1>
          <p className="text-gray-600 mt-2">Portal de Administración</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Administrativo
          </h2>
          <p className="text-gray-600 text-sm mb-6">Solo personal autorizado</p>

          <form onSubmit={(e)=>{e.preventDefault();
            handleLogin("Administracion")}} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sedarpe.gob.mx"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Security Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Este es un acceso restringido. Los intentos de acceso no
                autorizado serán registrados.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        {/* Producer Link
        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Eres productor?{" "}
            <button
              onClick={() => navigate("/login-productor")}
              className="text-green-600 hover:text-green-700 font-bold"
            >
              Accede aquí
            </button>
          </p>
        </div>  */}
      </div>
       {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]">
              <img src={SDloading} alt="Cargando..." width="100" height="100"/>
        </div>
      )}
      <Toaster/>
    </div>
  );
}
