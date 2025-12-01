import { useAuth } from "@/providers/authProvider";
import getToken from "@/services/getToken";
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  time: string;
}

export const useChatBot=()=>{
    const {user}=useAuth()
    const location=useLocation()
    const [loading,setLoading]=useState(false)
    const [messages, setMessages] = useState<Message[]>([]);


    const contextualizacion=(prompt:string)=>{
        if(user.Tipo==='Administracion'){
            return `Yo soy ${user.Nombre} ${user.Apellido1}, soy un Administrador de la plataforma de Semilla Digital que cuenta con informacion de la SEDARPE,
            me encuentro dentro de la plataforma en la seccion ${location.pathname}, utiliza este contexto para mi pregunta o comentario: ${prompt}`
        }

        return `Yo soy ${user.Nombre} ${user.Apellido1}, soy un usuario productor que esta utilizando la plataforma de Semilla Digital que cuenta con informacion de la SEDARPE,
        mis areas de produccion son ${user.Usos.map(us=>us.UsoGeneral).join(',')}, en mis parcelas practico las siguientes actividades ${user.Usos.flatMap(us=>us.UsosEspecificos).join(',')};
        me encuentro dentro de la plataforma en la seccion ${location.pathname},  utiliza este contexto para mi pregunta o comentario: ${prompt}`
         
    }

    const preguntaChat=async(prompt:string)=>{
        setLoading(true)
        try{
            const token=await getToken()
            const req=await fetch(`${import.meta.env.VITE_API_URL}gemini`,{
                method:'POST',
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body:JSON.stringify({prompt:prompt})
            })

        const reqJ=await req.json()

        setMessages(prev=>[...prev, {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            text: reqJ.respuesta,
            time: new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            }),
        }])
        }catch (error){
            setMessages(prev=>[...prev, {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            text: "Ha ocurrido un error intentalo",
            time: new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            }),
        }])
        }finally{
            setLoading(false)
        }
    }

    return{
        messages,
        loading,
        setMessages,
        setLoading,

        preguntaChat,
        contextualizacion
    }
}