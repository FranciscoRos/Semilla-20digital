import { calcularTiempoTranscurrido } from "@/helper/calcularTiempo";
import { Notification, ParaTIAnswer } from "@/services/api";

const time=(fecha:string)=>{
    const timeFactor=calcularTiempoTranscurrido(fecha)
    if(typeof timeFactor==='string')return timeFactor
    console.log(timeFactor)
    return timeFactor.dias?`${timeFactor.dias} dias`:timeFactor.horas?`${timeFactor.horas} horas`:`${timeFactor.minutos} minutos`
}

export const resourceNotificaciones=(data):Notification[]=>{

    return [...data.Apoyos.map(ap=>({
        id:ap.id,
        title:ap.nombre_programa,
        description:ap.descripcion,
        time:ap.Actualizado?time(ap.Actualizado):time(ap.creado),
        color:'green',
        FechaCreacion:ap.Actualizado?ap.Actualizado:ap.creado
    })),...data.Cursos.map(cu=>({
        id:cu.id,
        title:cu.titulo,
        description:cu.descripcion,
        time:time(cu.fechacurso[0]),
        color:'blue',
        FechaCreacion:cu.Actualizado?cu.Actualizado:cu.creado
    }))].sort((a, b) => {
  return new Date(b.FechaCreacion).getTime() - new Date(a.FechaCreacion).getTime();
});


}