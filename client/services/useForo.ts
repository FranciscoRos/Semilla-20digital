import { authHeader } from "@/helper/authHeader";
import axios from "axios";
import { Categoria, ComentariosTema, Tema } from "./api";


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

export const getTemas=async(idSubCa:string):Promise<Tema[]>=>{
    await authHeader(foroApi)
    const res=await foroApi.get(`temas/subCategoria/${idSubCa}`)
    return res.data.data
}

export const getComentarios=async(idTema:string):Promise<ComentariosTema>=>{
    await authHeader(foroApi)
    const res=await foroApi.get(`comentarios/tema/${idTema}`)
    return res.data.data
}

export const postTema=async(idCategoria:string,data)=>{
    await authHeader(foroApi)
    const res=await foroApi.post('temas/'+idCategoria,data)
    return res.data.data
}

export const postComentario=async(idTema:string,data)=>{
    await authHeader(foroApi)
    const res=await foroApi.post('comentarios/'+idTema,data)
    return res.data.data
}