import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Layers } from "lucide-react";

export default function RegisterProducer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    curp: "",
    email: "",
    phone: "",
    municipality: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [mapDrawn, setMapDrawn] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mapDrawn) {
      alert("Debes dibujar el polígono de tu parcela");
      return;
    }

    // TODO: Reemplazar con API de Laravel
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // })

    console.log("Registro:", formData);
    alert("¡Registro completado! Tu cuenta está pendiente de verificación.");
    navigate("/login-productor");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/login-productor")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a Login
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta de Productor
          </h1>
          <p className="text-gray-600 mb-8">
            Completa el siguiente formulario para registrarte
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Información Personal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CURP *
                  </label>
                  <input
                    type="text"
                    name="curp"
                    value={formData.curp}
                    onChange={handleChange}
                    placeholder="CURP de 18 caracteres"
                    required
                    maxLength={18}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Información de Domicilio */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Domicilio
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio *
                  </label>
                  <select
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar municipio</option>
                    <option value="chetumal">Chetumal</option>
                    <option value="playa_del_carmen">Playa del Carmen</option>
                    <option value="cancun">Cancún</option>
                    <option value="cozumel">Cozumel</option>
                    <option value="isla_mujeres">Isla Mujeres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Mapa de Parcela */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Ubicación de tu Parcela
              </h2>

              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-green-300 mb-4">
                <div className="text-center">
                  <Layers className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Mapa interactivo para dibujar tu parcela
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Este campo es obligatorio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapDrawn(true)}
                className={`w-full ${
                  mapDrawn
                    ? "bg-green-100 text-green-700"
                    : "bg-green-600 hover:bg-green-700 text-white"
                } font-semibold py-3 rounded-lg transition`}
              >
                {mapDrawn ? "✓ Parcela dibujada" : "Dibujar polígono de parcela"}
              </button>
            </div>

            {/* Contraseña */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Crear Contraseña
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
              >
                Crear Cuenta
              </button>
              <button
                type="button"
                onClick={() => navigate("/login-productor")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
