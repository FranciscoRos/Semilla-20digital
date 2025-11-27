import { getRegistro } from "@/services/registroService";
import { useQuery, useQueryClient } from "@tanstack/react-query"





export const useProducerRegister=(user)=>{
    const queryClient=useQueryClient()

   const{ data:dataRegistro, isLoading:loadingRegistro, isError:isErrorRegister, error:errorRegister, refetch:refetchRegister}=useQuery({
        queryKey: ['registroProducer', user?.idRegistro], 
        queryFn: () => getRegistro(user?.idRegistro),
        enabled: !!user?.idRegistro,
        refetchOnWindowFocus: false,
        initialData:()=>{
            return queryClient.getQueryData(['registroProducer', user?.idRegistro])
        }
    });

    return{
        dataRegistro,
        loadingRegistro,
        isErrorRegister,
        errorRegister,
        refetchRegister
    }
}