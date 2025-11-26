import { getParcelasGeomapa } from "@/services/parcelasService"
import { getUbicaciones } from "@/services/ubicacionEService"
import { useQuery } from "@tanstack/react-query"


export const useGeoMapa=()=>{


    const {data:ubicacionesEspeciales,isLoading:loadingUbicaciones,error:errorUbicaciones,isError:isErrorUbicaciones}=useQuery({
        queryKey:["ubicacionesGeoMapa"],
        queryFn:()=>getUbicaciones()
    })

    const {data:parcelas,isLoading:loadingParcelas,error:errorParcelas,isError:isErrorParcelas}=useQuery({
        queryKey:["parcelasGeoMapa"],
        queryFn:()=>getParcelasGeomapa()
    })

    return{
        ubicacionesEspeciales,
        loadingUbicaciones,

        parcelas,
        loadingParcelas
    }
}