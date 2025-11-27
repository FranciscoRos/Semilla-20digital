import { postRegistro } from "@/services/registroService"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "./use-toast"


export const useRegisterProducer=()=>{
const Navigate=useNavigate() 

    const {mutate:handleRegister,isPending:loadingRegister}=useMutation({
        mutationKey:['registerProducer'],
        mutationFn:(Usuario:Record<string,any>)=>postRegistro({Usuario}),
        onSuccess:(data)=>{
                    toast({
                title: "Registro Exitoso!",
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900",
            })
            Navigate("/login-productor",{state:{
                correo:data.Correo,
                contrasena:data.Contrasena
            }})
        },
        onError(error){
            console.error(error)
            toast({
                    title: "Error al Registrase!",
                    description: `Error: ${error.message}. Intentelo de nuevo o contacte con un administrador.`,
                    variant: "default",
                    className: "bg-red-50 border-red-200 text-red-900",
                })
        }    
    })

    return{
        handleRegister,
        loadingRegister
    }
}