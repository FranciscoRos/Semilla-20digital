import { getRegistros } from "@/services/registroService"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "./use-toast"
import { PerfilRegistro } from "@/services/PendientesReviService"




export const useRegistros=()=>{
    const queryClient=useQueryClient()

    const {data:productores=[],isLoading:loadingRegistros,refetch:refetchRegistros,isError,error}=useQuery({
        queryKey:["RegistrosAdmin"],
        queryFn:()=>getRegistros(),
        initialData:()=>queryClient.getQueryData(["RegistrosAdmin"]) as PerfilRegistro[] 
    })

    useEffect(()=>{
        if(isError){
             toast({
            title:"Ha Ocurrido un Error al Cargar los Registros",
            variant: "default",
            className: "bg-red-50 border-red-200 text-red-900",
        })
        return console.error(error)
    }
    },[isError,error])
   
    const pendientes = productores.filter(dr => dr.Estado === "Pendiente");
    const revisados = productores.filter(dr => ["Activo", "Verificado"].includes(dr.Estado)).length.toString();
    const pendientesLenght = pendientes.length.toString();

    return{
        productores,
        pendientes,
        pendientesLenght,
        revisados,

        loadingRegistros,
        refetchRegistros
    }
}