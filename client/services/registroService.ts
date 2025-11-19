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
        console.log(res.data)
        return res.data
    } catch (error) {
        
    }
}