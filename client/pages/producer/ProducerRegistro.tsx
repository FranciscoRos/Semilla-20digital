import { useAuth } from "@/providers/authProvider";
import FormularioUsuarioParcelas from "../auth/RegisterProducer"; 
import { useQuery } from "@tanstack/react-query";
import { getRegistro } from "@/services/registroService";
import { AlertCircle, ChevronLeft, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { useNavigate } from "react-router-dom";
import LoadingSDloading from "@/components/loadingSDloading";

const InitialDatosUsuario = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['registroProducer', user?.idRegistro], 
        queryFn: () => getRegistro(user?.idRegistro),
        enabled: !!user?.idRegistro,
        refetchOnWindowFocus: false,
    });

    // 1. Estado de Carga
    if (isLoading) {
        return (
           <LoadingSDloading/>
        );
    }

    // 2. Estado de Error
    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4 text-red-600">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar datos</h3>
                    <p className="text-gray-500 mb-6">
                        {error?.message || "No pudimos obtener la información del registro. Por favor intenta nuevamente."}
                    </p>
                    <div className="flex justify-center">
                        <Button
                        onClick={() => navigate("/")}
                        className="border-red-200 items-center bg-green-600 text-white hover:bg-green-700 mr-4"
                        >
                        <ChevronLeft className="w-5 h-5" />
                        Volver
                        </Button>
                        <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900">
                        Intentar de nuevo
                    </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            
                <div className="text-center max-w-md">
                    <FileWarning className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700">Sin información disponible</h3>
                    <p className="text-gray-500 mt-2">
                        No se encontró un registro asociado a este usuario.
                    </p>
                </div>

                <div className="flex justify-center">
                        <Button
                        onClick={() => navigate("/")}
                        className="border-red-200 items-center bg-green-600 text-white hover:bg-green-700 mr-4"
                        >
                        <ChevronLeft className="w-5 h-5" />
                        Volver
                        </Button>
                        </div>
            </div>
        );
    }
    return (
        <>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>
        <FormularioUsuarioParcelas 
            key={data.id || 'producer-form'} 
            user={data} 
        />
        </>
    );
};

export default InitialDatosUsuario;