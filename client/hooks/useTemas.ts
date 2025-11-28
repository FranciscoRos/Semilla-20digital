import { getTemas } from "@/services/useForo"
import { useMutation, useQueryClient } from "@tanstack/react-query"




export const useTemas=()=>{

    const queryClient=useQueryClient()
    const getTemasId=(id:string)=>{
        return queryClient.ensureQueryData({
      queryKey: ['tema', id],
      queryFn: () => getTemas(id),
      staleTime: 1000 * 60 * 8,
      
    });
  };

    return{
        getTemasId
    }

}