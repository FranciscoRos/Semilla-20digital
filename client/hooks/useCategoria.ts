import { Categoria } from "@/services/api"
import { getCategorias } from "@/services/useForo"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "./use-toast"




export const useCategoria=()=>{
    const queryClient=useQueryClient()
    const {data,isLoading,error,isError}=useQuery({
        queryKey:["categorias"],
        queryFn:()=>getCategorias(),
        initialData:()=>queryClient.getQueryData["categorias"] as Categoria[] || []
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
    },[error,isError])
    return{
        data,
        isLoading
    }
}