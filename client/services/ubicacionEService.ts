import { authHeader } from "@/helper/authHeader";
import axios from "axios";
import { IUbicacionEspecial } from "./api";




const ubicacionesApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL+'ubicacionEspecial',
    headers:{
        Accept:'application/json',
    }
})



export const getUbicaciones=async():Promise<IUbicacionEspecial[]>=>{
    await authHeader(ubicacionesApi)
    const res=await ubicacionesApi.get('')
    return res.data.data
}