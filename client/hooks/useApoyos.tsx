import { getApoyos } from "@/services/ApoyoService"
import { useQuery } from "@tanstack/react-query"




export const useApoyos=()=>{


    const {data:dataApoyos,isLoading:loadingApoyos}=useQuery({
        queryKey:["apoyosData"],
        queryFn:()=>getApoyos()
    })


    return{
        dataApoyos,
        loadingApoyos
    }
}