import getToken from "@/services/getToken"
import { AxiosInstance } from "axios"



export const authHeader=async(axios:AxiosInstance,dataUser?:{
    Correo:string
    Contrasena:string
    Tipo:string
})=>{
    try{
    const token=await getToken(dataUser)
        axios.defaults.headers['Authorization']=`Bearer ${token}`
    } catch (error) {
        console.error(error)
        throw new Error(error)
    }
}
