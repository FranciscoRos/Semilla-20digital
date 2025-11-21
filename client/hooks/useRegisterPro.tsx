import { postRegistro } from "@/services/registroService"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"


export const useRegisterProducer=()=>{
const Navigate=useNavigate() 

    const {mutate:handleRegister,isPending:loadingRegister}=useMutation({
        mutationKey:['registerProducer'],
        mutationFn:(Usuario:Record<string,any>)=>postRegistro({Usuario}),
        onSuccess:(data)=>{
            alert(data.message||'Registro exitoso')
            Navigate("/login-productor",{state:{
                correo:data.Correo,
                contrasena:data.Contrasena
            }})
        },
        onError(error){
            console.error(error)
            alert('Ha ocurrido un error al registrarse. Hable con un administrador al respecto')
        }    
    })

    return{
        handleRegister,
        loadingRegister
    }
}