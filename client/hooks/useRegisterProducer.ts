import { getRegistro } from "@/services/registroService";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react";
import { toast } from "./use-toast";





export const useProducerRegister=(user)=>{
    const queryClient=useQueryClient()

   const{ data:dataRegistro, isLoading:loadingRegistro, isError:isErrorRegister, error:errorRegister, refetch:refetchRegister}=useQuery({
        queryKey: ['registroProducer', user?.idRegistro], 
        queryFn: () => getRegistro(user?.idRegistro),
        enabled: !!user?.idRegistro,
        refetchOnWindowFocus: false,
        initialData: queryClient.getQueryData(['registroProducer', user?.idRegistro]) as any

    });

    useEffect(()=>{
        if(isErrorRegister){
            toast({
            title:"Fallo al Cargar las Preguntas. " +errorRegister.message,
            description: "Intentelo de nuevo o si el problema persiste trata de contactar con un administrador.",
            variant: "default", 
            className: "bg-red-50 border-red-200 text-red-900" 
      })
            console.error('Error al cargar las preguntas:',errorRegister)
        }
    },[isErrorRegister,errorRegister])

    return{
        dataRegistro,
        loadingRegistro,
        isErrorRegister,
        errorRegister,
        refetchRegister
    }
}