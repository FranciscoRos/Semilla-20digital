import { CryptoSimple } from '@/helper/encriptaciones';
import Cookies from 'js-cookie';

let token: string | null = null;

export default async function getToken(dataUser?: {
    Correo: string
    Contrasena: string
    Tipo: string
}): Promise<string> {
    try {
        // Si ya tenemos token en memoria, lo usamos
        if (token) return token;

        // Si no hay dataUser, intentamos recuperar de cookies (solo para renew)
        if (!dataUser) {
            const cookieUser = localStorage.getItem('user');
            if (!cookieUser) throw new Error('No hay usuario en sesión');
            
            const userData = JSON.parse(cookieUser);
            dataUser = {
                Correo: userData.Correo,
                Contrasena: await CryptoSimple.decryption(Cookies.get('conenc') || ''),
                Tipo: userData.Tipo
            };
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataUser)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        token = data.token;
        
        return token;
    } catch (error) {
        console.error('Error obteniendo token:', error);
        throw error; 
    }
}

// Función para limpiar el token (en logout)
export function clearToken(): void {
    token = null;
    localStorage.removeItem('user');
    Cookies.remove('conenc');
}