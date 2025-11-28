import { authHeader } from "@/helper/authHeader";
import axios from "axios";
import { Categoria } from "./api";


const foroApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        Accept:'application/json',
    }
})


export const getCategorias=async():Promise<Categoria[]>=>{
    await authHeader(foroApi)
    const res=await foroApi.get('categorias')
    return res.data.data
}

export const getTemas=async(idSubCa)=>{
    await authHeader(foroApi)
    const res=await foroApi.get(`temas/${idSubCa}`)
    return res.data.data
}

export const getComentarios=async(idTema)=>{
    await authHeader(foroApi)
    const res=await foroApi.get('comentario/'+idTema)
    return res.data.data
}

export const postComentario=async(idTema,data)=>{
    await authHeader(foroApi)
    const res=await foroApi.post('comentario/'+idTema,data)
    return res.data.data
}