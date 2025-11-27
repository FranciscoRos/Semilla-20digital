import { registroApoyo, registroCurso } from "@/services/inscripcionHistorial";
import { useMutation } from "@tanstack/react-query";



export const useInscripciones=()=>{
    const mutationApoyo=useMutation({
    mutationFn:(data:{id:string,body:{
        parcelaId:string
    }})=>registroApoyo(data.id,data.body)
    })

    const mutationCurso=useMutation({
        mutationFn:registroCurso
    })

    return{
        handleInscripcionApoyo:mutationApoyo.mutate,
        handleInscripcionCurso:mutationCurso.mutate
    }
}

