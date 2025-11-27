import { getCursos } from "@/services/CursosService"
import { useQuery } from "@tanstack/react-query"




export const useCursos=()=>{


    const {data:dataCursos,isLoading:loadingCursos}=useQuery({
        queryKey:["cursosData"],
        queryFn:()=>getCursos()
    })


    return{
        dataCursos,
        loadingCursos
    }
}