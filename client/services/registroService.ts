import { authHeader } from "@/helper/authHeader";
import unwrapCollection from "@/helper/checkColletion";
import axios from "axios";
import { id } from "date-fns/locale";
import { Parcela } from "./api";
import { PerfilRegistro } from "./PendientesReviService";

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
        return unwrapCollection<PerfilRegistro>(res.data);
        
    } catch (error) {
        console.error('Error Peticion Registro: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}

export const getRegistro=async(id:string)=>{
    try {
        await authHeader(registerApi)
        const res=await registerApi.get(id)
        return ({...res.data.data.Usuario,...res.data.data.CamposExtra,Estado:res.data.data.Estado})//Aqui
    } catch (error) {
        console.error('Error Peticion Registro: ',error)
       throw new Error(error.message || 'Error desconocido');
    }
}


export const putRevisionRegistro=async(data:{idProc:string,data:{
FechaRevision:Date,
ComentariosRevision:string
}})=>{
    try {
        await authHeader(registerApi)
        const res= await registerApi.put(`${data.idProc}/agendarRevision`,data.data)
        return unwrapCollection(res)
    } catch (error) {
        console.error(error)
        throw new Error("Error al Agendar: "+error)
    }    
}

export const putCitaRegistro=async(idProc:string,data:{
FechaCita:Date,
HoraCita:string,
PropositoCita:string
})=>{
    try {
        await authHeader(registerApi)
        const res= await registerApi.put(`${idProc}/agendarCita`,data)
        return unwrapCollection(res)
    } catch (error) {
        console.error(error)
        throw new Error("Error al Agendar: "+error)
    }    
}

export const putChangeStatus=async(idProc:string,data:{
      Estado: 'Verificado' | 'Rechazado'|'Pendiente'| 'Activo'
    })=>{
    try {
        await authHeader(registerApi)
        const res= await registerApi.put(idProc,data)
        return unwrapCollection(res)
    } catch (error) {
        console.error(error)
        throw new Error("Error al Agendar: "+error)
    }    
}

