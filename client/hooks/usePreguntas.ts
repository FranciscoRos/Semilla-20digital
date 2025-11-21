import { getPreguntas } from "@/services/preguntaService"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "./use-toast"




export const usePreguntas = () => {

    const {data:dataPreguntas, isLoading:loadingPreguntas,error,isError,refetch}=useQuery({
        queryKey: ['preguntas'],
        queryFn:()=>getPreguntas()
    })
useEffect(()=>{
    if(isError){
        toast({
        title:"Fallo al Cargar las Preguntas. " +error.message,
        description: "Intentelo de nuevo o si el problema persiste trata de contactar con un administrador.",
        variant: "default", 
        className: "bg-red-50 border-red-200 text-red-900" 
  })
        console.error('Error al cargar las preguntas:',error)
    }
},[isError,error])


    return{
        dataPreguntas,
        loadingPreguntas,
        refetch
    }
}