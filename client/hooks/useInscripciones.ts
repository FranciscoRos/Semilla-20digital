import { registroApoyo, registroCurso } from "@/services/inscripcionHistorial";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";



export const useInscripciones=(fn?:()=>void)=>{
    const mutationApoyo=useMutation({
    mutationFn:(data:{id:string,body:{
        parcelaId:string
    }})=>registroApoyo(data.id,data.body),
    onSuccess:()=>{
        toast({
        title: "Inscripcion Exitosa!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      })
        if(fn)fn()
    },
    onError:()=>( toast({
        title: "Error en el Registro",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      }))
    })
    

    const mutationCurso=useMutation({
        mutationFn:registroCurso,
         onSuccess:()=>{
        toast({
        title: "Registro Exitoso!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      })
        if(fn)fn()
    },
    onError:()=>( toast({
        title: "Error en el Registro",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      }))
    })

    return{
        handleInscripcionApoyo:mutationApoyo.mutate,
        handleInscripcionCurso:mutationCurso.mutate,

        loading:mutationApoyo.isPending || mutationCurso.isPending
    }
}

