import { authHeader } from "@/helper/authHeader";
import axios from "axios";

const registerApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL+'registro',
    headers:{
        Accept:'application/json',
    }
})


export const postRegistro=async(data)=>{
    try {
        const res=await registerApi.post('',data)
        return res.data
    } catch (error) {
        console.error('Error Peticion Registro: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const getRegistros=async()=>{
    try {
        await authHeader(registerApi)
        const res=await registerApi.get('')
        return res.data
    } catch (error) {
        console.error('Error Peticion Registro: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const getRegistro=async(id:string)=>{
    try {
        await authHeader(registerApi)
        const res=await registerApi.get(id)
        return ({...res.data.data.Usuario,...res.data.data.CamposExtra})
    } catch (error) {
        console.error('Error Peticion Registro: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}