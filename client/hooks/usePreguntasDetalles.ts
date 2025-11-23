import {
  deletePregunta,
  postPregunta,
  putPregunta,
} from "@/services/preguntaService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { Handle } from "vaul";
import { Question } from "@/services/api";

export const usePreguntasDetalles = (fn:()=>void) => {
  const postMutation = useMutation({
    mutationKey: ["preguntasPost"],
    mutationFn: (data:any) => postPregunta(data),
    onSuccess: () =>
      toast({
        title: "Creacion Exitosa!",
        description: `Pregunta creada correctamente.`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      }),
    onError: (error) =>
      toast({
        title: error.message,
        description:
          "Intentelo de nuevo o si el problema persiste trata de contactar con un administrador.",
        variant: "default",
        className: "bg-red-50 border-red-200 text-red-900",
      }),
      onSettled:()=>fn()
  });

  const putMutation = useMutation({
    mutationKey: ["preguntasPut"],
    mutationFn: (data:{id: string, data:Question}) => putPregunta(data.id, data.data),
    onSuccess: () =>
      toast({
        title: "Modificación Exitosa!",
        description: `Pregunta modificada correctamente.`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      }),
    onError: (error) =>
      toast({
        title: error.message,
        description:
          "Intentelo de nuevo o si el problema persiste trata de contactar con un administrador.",
        variant: "default",
        className: "bg-red-50 border-red-200 text-red-900",
      }),
            onSettled:()=>fn()

  });

  const deleteMutation = useMutation({
    mutationKey: ["preguntasDelete"],
    mutationFn: (id: string) => deletePregunta(id),
    onSuccess: () =>
      toast({
        title: "Eliminación Exitosa!",
        description: `Pregunta eliminada correctamente.`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-900",
      }),
    onError: (error) =>
      toast({
        title: error.message,
        description:
          "Intentelo de nuevo o si el problema persiste trata de contactar con un administrador.",
        variant: "default",
        className: "bg-red-50 border-red-200 text-red-900",
      }),
            onSettled:()=>fn()

  });

  return{
    handlePostPregunta: postMutation.mutate,
    loadingAcciones: postMutation.isPending || putMutation.isPending || deleteMutation.isPending,
    handlePutPregunta: putMutation.mutate,
    HandleDeletePregunta: deleteMutation.mutate
  }
};
