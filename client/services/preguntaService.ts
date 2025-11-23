import { authHeader } from "@/helper/authHeader";
import axios from "axios";
import { ca } from "date-fns/locale";




const preguntasApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL+'preguntas',
    headers:{
        Accept:'application/json',
    }
})


export const getPreguntas=async()=>{
    try {
        // await authHeader(preguntasApi)
        const res=await preguntasApi.get('')
    return res.data.data
    }catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const postPregunta=async(data)=>{
    try {
        await authHeader(preguntasApi)
        const res=await preguntasApi.post('',data)
    return res.data
    } catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const deletePregunta=async(id:string)=>{
    try {
        await authHeader(preguntasApi)
        const res=await preguntasApi.delete(id)
    return res.data
    } catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const putPregunta=async(id:string,data:Record<string,any>)=>{
    try {
        await authHeader(preguntasApi)
        const res=await preguntasApi.put(id,data)
    return res.data
    } catch (error) {
        console.error('Error Peticion Preguntas: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}