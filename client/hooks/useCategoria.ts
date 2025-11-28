import { Categoria } from "@/services/api"
import { getCategorias } from "@/services/useForo"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"




export const useCategoria=()=>{
    const queryClient=useQueryClient()


    const {data,isLoading,error,isError}=useQuery({
        queryKey:["categorias"],
        queryFn:()=>getCategorias(),
        initialData:()=>queryClient.getQueryData["categorias"] as Categoria[] || []
    })

    useEffect(()=>{

    },['err'])
    return{
        data,
        isLoading
    }
}