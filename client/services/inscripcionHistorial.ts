import { authHeader } from "@/helper/authHeader"
import axios from "axios"



const registroApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL+'registro',
    headers:{
        Accept:'application/json',
    }
})


export const registroApoyo=async(id:string,body)=>{
    try {
        await authHeader(registroApi)
        const res=await registroApi.post(`historialApoyo/${id}`,body)
        return res.data.data
    }catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}


export const registroCurso=async(id:string)=>{
    try {
        await authHeader(registroApi)
        const res=await registroApi.post(`historialCurso/${id}`)
        return res.data.data
    }catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}