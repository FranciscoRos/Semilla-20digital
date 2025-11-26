import { authHeader } from "@/helper/authHeader";
import axios from "axios";
import { IParcela, ParcelaBack } from "./api";


const parcelaApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL+'parcelas',
    headers:{
        Accept:'application/json',
    }
})





export const getParcelas=async():Promise<ParcelaBack[]>=>{
    await authHeader(parcelaApi)
    const res=await parcelaApi.get('')
    return res.data.data
}


export const getParcelasGeomapa=async():Promise<IParcela[]>=>{
    const res=await getParcelas()
    return res.map(pb=>({
        id: pb.id,
        ciudad: pb.ciudad,
        municipio: pb.municipio,
        direccionAdicional: pb.direccionAdicional,
        area: pb.area,
        nombre: pb.nombre,
        usos:pb.usos,
        coordenadas: pb.coordenadas,
        fechaRegistro: pb.fechaRegistro
    }))
}