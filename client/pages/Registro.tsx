import { ChevronLeft, MapPin, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

const cultivoTypes = [
  "Maíz",
  "Frijol",
  "Chile",
  "Tomate",
  "Frutas",
  "Verduras",
  "Ganadería",
];

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "Jorge García",
    curp: "",
    location: "Chetumal, Q. Roo",
    cultivoType: "Maíz",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header with back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Semilla Digital Q. Roo
        </h1>
        <p className="text-gray-600 mb-8">Registro de Productor</p>

        {/* Profile Avatar Section */}
        <div className="bg-white rounded-lg p-8 text-center mb-8 shadow-sm border border-gray-200">
          <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-gray-500">Foto de perfil</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nombre Completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* CURP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CURP
              </label>
              <input
                type="text"
                name="curp"
                value={formData.curp}
                onChange={handleChange}
                placeholder="CURP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localidad/Municipio
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Localidad/Municipio"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo de Cultivo/Actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cultivo/Actividad
              </label>
              <select
                name="cultivoType"
                value={formData.cultivoType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer bg-white"
              >
                {cultivoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Satellite Map Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mapa Satelital
              </label>
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg h-40 flex items-center justify-center border-2 border-dashed border-green-300">
                <div className="text-center">
                  <Layers className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Mapa interactivo de tu parcela
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition"
              >
                DIBUJAR POLÍGONO DE MI PARCELA
              </button>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
              >
                CREAR CUENTA
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
