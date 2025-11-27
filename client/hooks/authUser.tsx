import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { authService, logoutService } from "@/services/authService";
import { CryptoSimple } from "@/helper/encriptaciones";
import { useAuth } from "@/providers/authProvider";
import { useToast } from "./use-toast";
export function useAuthUser() {
  const navigate = useNavigate();
  const {loadData}=useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {toast} = useToast();

  const { mutate: handleLogin, isPending: loading } = useMutation({
    mutationKey: ["auth"],
    mutationFn: (Tipo:string) =>
      authService({
        Correo: email,
        Contrasena: password,
        Tipo: Tipo,
      }),
    onSuccess: async(data) => {
        toast({
                title: "Inicio de Sesion Exitoso!",
                variant: "default", 
                className: "bg-green-50 border-green-200 text-green-900" 
            });
      Cookies.set("conenc", await CryptoSimple.encryption(password), {
        secure: true,
        sameSite: "Strict",
      });
      loadData(data)
      localStorage.setItem("user", JSON.stringify(data));
      if(data.Tipo==="Usuario")return navigate("/")
      navigate("/admin-panel");
    },
    onError: (error) =>
      toast({
        title:"Fallo en el Login. " +error.message,
        description: "Revise sus creedenciales o si el problema persiste trata de contactar con un administrador.",
        variant: "default", 
        className: "bg-red-50 border-red-200 text-red-900" 
  }),
  });


  const logoutMutation=useMutation({
    mutationFn:()=>logoutService(),
    onMutate: () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user")); 

        if (!userData) {
          console.error("No se encontró usuario en localStorage al cerrar sesión");
          return { tipo: null }; 
        }

        const tipo = userData.Tipo;
        return { tipo };
      } catch (error) {
        console.error("Error en onMutate de logout:", error);
        return { tipo: null }; // Maneja cualquier error de parseo
      }
    },
    onSuccess:(_,__,context)=>{
    toast({
            title: "Sesion Cerrada!",
            variant: "default", 
            className: "bg-green-50 border-green-200 text-green-900" 
        });    if(context.tipo==='Administracion')return navigate("/login-admin")

    navigate("/login-productor")
},
    onError:(error)=>toast({
        title:"Fallo al Cerrar Sesion. " +error.message,
        description: "Intentelo de nuevo. Si el problema persiste trata de contactar con un administrador.",
        variant: "default", 
        className: "bg-red-50 border-red-200 text-red-900" 
  }),
  })

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    loading,


    handleLogout:logoutMutation.mutate,
    loginLogout:logoutMutation.isPending
  };
}
