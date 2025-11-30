import { putChangeStatus, putCitaRegistro, putRevisionRegistro } from "@/services/registroService"
import { useMutation } from "@tanstack/react-query"
import { toast } from "./use-toast"
import { Loader2 } from "lucide-react"




export const useRevisionRegistro=(fn?:()=>void)=>{

    const handleRevisionProductor=useMutation({
        mutationKey:["revisionProductor"],
        mutationFn:putRevisionRegistro,
        onMutate: () => {
            const { dismiss } = toast({
                title: "Procesando...",
                description: (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Guardando revisión...</span> 
                    </div>
                ),
                duration: Infinity, 
            })
            
            return { dismiss }
        },
    onSuccess:(_,__,context)=>{
        if (context?.dismiss) {
            context.dismiss();
        }
        toast({
                title: "Revision Guardada",
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900",
                duration:3000
            })
        if(fn)fn()

        },
        onError:(_,__,context)=>
            {
                if (context?.dismiss) {
                    context.dismiss();
                }
                toast({
                        title: "Error al Guardar la Revision",
                        variant: "default",
                        className: "bg-red-50 border-red-200 text-red-900",
                        duration:3000
                    })
                }
})


    const handleCitaProductor=useMutation({
        mutationKey:["revisionProductor"],
        mutationFn:(data:{idProc: string, data: {
            FechaCita: Date;
            HoraCita: string;
            PropositoCita: string;
        }})=>putCitaRegistro(data.idProc,data.data),
    onMutate: () => {
            const { dismiss } = toast({
                title: "Procesando...",
                description: (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Guardando Cita...</span> 
                    </div>
                ),
                duration: Infinity, 
            })
            
            return { dismiss }
        },
    onSuccess:(_,__,context)=>{
        if (context?.dismiss) {
            context.dismiss();
        }
        toast({
                title: "Cita Agendada",
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900",
                duration:3000
            })
        if(fn)fn()
        },
        onError:(_,__,context)=>
            {
                if (context?.dismiss) {
                    context.dismiss();
                }
                toast({
                        title: "Error al Agendar la Cita",
                        variant: "default",
                        className: "bg-red-50 border-red-200 text-red-900",
                        duration:3000
                    })
                }
})

    const handleChangeEstado=useMutation({
        mutationKey:["estadoProductor"],
        mutationFn:(data:{idProc: string, data: {
      Estado: 'Verificado' | 'Rechazado'|'Pendiente'| 'Activo'
     }})=>putChangeStatus(data.idProc,data.data),
    onMutate: () => {
            const { dismiss } = toast({
                title: "Procesando...",
                description: (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cambiado Estado...</span> 
                    </div>
                ),
                duration: Infinity, 
            })
            
            return { dismiss }
        },
    onSuccess:(_,__,context)=>{
        if (context?.dismiss) {
            context.dismiss();
        }
        toast({
                title: "Estado Cambiado Exitosamente",
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900",
                duration:3000
            })
                if(fn)fn()

        },
        onError:(_,__,context)=>
        {
            if (context?.dismiss) {
                context.dismiss();
            }
            toast({
                    title: "Error al Cambiar el Estado",
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-900",
                    duration:3000

                })
            }
})

    return{
        handleCitaProductor,
        handleRevisionProductor,
        handleChangeEstado,
        loadingCita:handleCitaProductor.isPending,
        loadingRevision:handleRevisionProductor.isPending
    }
}