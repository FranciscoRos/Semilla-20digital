import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-2">Página no encontrada</p>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Volver al Inicio
          </button>
        </div>
    </div>
  );
};

export default NotFound;
