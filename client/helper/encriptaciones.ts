// utils/cryptoSimple.ts

import { Import } from "lucide-react";

export class CryptoSimple {
  private static readonly ENCRYPTION_PASSWORD = import.meta.env.VITE_CRYPTO_ENCRYPTION_PASSWORD
;
  private static readonly SALT = new TextEncoder().encode(import.meta.env.VITE_CRYPTO_SALT);

  // Método público para encriptar - solo pasas el string
  static async encryption(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const encoder = new TextEncoder();
      
      // IV aleatorio
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encriptar
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );

      // Combinar IV + datos
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      throw new Error(`Error encriptando: ${error}`);
    }
  }

  // Método público para desencriptar - solo pasas el string encriptado
  static async decryption(encryptedData: string): Promise<string> {
    try {
      const key = await this.getKey();
      const decoder = new TextDecoder();
      
      // Decodificar Base64
      const binary = atob(encryptedData);
      const combined = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i);
      }

      // Separar IV y datos
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Desencriptar
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Error desencriptando: ${error}`);
    }
  }

  // Método interno - no necesitas llamarlo
  private static async getKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.ENCRYPTION_PASSWORD),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.SALT,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Verificar compatibilidad
  static isSupported(): boolean {
    return !!(crypto?.subtle && TextEncoder && TextDecoder);
  }
}