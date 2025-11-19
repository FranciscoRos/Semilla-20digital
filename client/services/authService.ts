import axios from "axios";
import getToken,{clearToken} from "./getToken";
import { authHeader } from "@/helper/authHeader";

const authApi=axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        Accept:'application/json',
    }
})


export const authService=async(dataUser:{
    Correo:string
    Contrasena:string
    Tipo:string
})=>{
    try {
        await authHeader(authApi,dataUser)
        const res=await authApi.get('me')
        return res.data
    } catch (error) {
        console.error('Error Peticion Auth: ',error)
        throw new Error(error.message || 'Error desconocido');

    }
}

export const logoutService=async()=>{
try {
        await authHeader(authApi)
        const res=await authApi.post('logout')
        clearToken();
        return res.data
    } catch (error) {
        console.error('Error Peticion Auth: ',error)
        throw new Error(error.message || 'Error desconocido');

    }
}

