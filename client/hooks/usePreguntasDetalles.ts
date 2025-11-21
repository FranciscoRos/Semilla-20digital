import { deletePregunta, postPregunta, putPregunta } from "@/services/preguntaService"
import { useMutation } from "@tanstack/react-query"




export const usePreguntasDetalles=()=>{



    const postMutation=useMutation({
        mutationKey:['preguntasPost'],
        mutationFn:(data)=>postPregunta(data),
        onSuccess:(data)=>{/**/},
        onError:(error)=>{/**/}
    })

    const putMutation=useMutation({
        mutationKey:['preguntasPut'],
        mutationFn:(id:string,data)=>putPregunta(id,data),
        onSuccess:(data)=>{/**/},
        onError:(error)=>{/**/}
    })


    const deleteMutation=useMutation({
        mutationKey:['preguntasDelete'],
        mutationFn:(id:string)=>deletePregunta(id),
        onSuccess:(data)=>{/**/},
        onError:(error)=>{/**/}
    })
}