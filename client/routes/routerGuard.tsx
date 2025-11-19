// components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/authProvider";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // 1. AÚN CARGANDO
  if (user === undefined) return <div>Cargando...</div>;

  // 2. NO HAY USUARIO
  if (user === null) return <Navigate to="/login-productor" />;

  // 3. EXISTE USUARIO PERO NO TIENE EL ROL
  if (role && user.Tipo !== role) return <Navigate to="/login-productor" />;

  // 4. TODO BIEN
  return children;
}
