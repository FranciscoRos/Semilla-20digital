import { authHeader } from "@/helper/authHeader"
import axios from "axios"
import { Notification } from "./api"
import { resourceNotificaciones } from "@/resources/resourceNotificaciones"


const paraTiApi=axios.create({
  baseURL: import.meta.env.VITE_API_URL+"paraTi", 
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})



export const getParaTi=async(usos):Promise<Notification[]>=>{
    try {
        await authHeader(paraTiApi)
        const res=await paraTiApi.post('',usos)
        return resourceNotificaciones(res.data)
    } catch (error) {
        console.error(error)
        throw new Error("Error ParaTi: "+error);
    }

}