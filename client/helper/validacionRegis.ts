import { Productor } from "@/services/api";

// Expresiones Regulares (Regex) para validaciones comunes
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/, // 10 dígitos exactos
  // CURP Genérico (ajustar estrictez según necesidad)
  CURP: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/, 
  // RFC Genérico (Persona física)
  RFC: /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/,
  ONLY_TEXT: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  POSTAL_CODE: /^\d{5}$/
};

/**
 * Valida los datos personales del usuario
 * @param {Object} usuario - Objeto con datos del usuario
 * @returns {Object} - Objeto con errores (key: mensaje)
 */

export const validatePersonalData = (usuario) => {
  const errors:Record<string,any>= {};

  if (!usuario.Nombre || usuario.Nombre.trim()==="") {
    errors.Nombre = "El nombre es obligatorio";
  } else if (!REGEX.ONLY_TEXT.test(usuario.Nombre)) {
    errors.Nombre = "Solo se permiten letras";
  }

  if (!usuario.Apellido1?.trim()) {
    errors.Apellido1 = "El primer apellido es obligatorio";
  }

  if (!usuario.Curp?.trim()) {
    errors.Curp = "El CURP es obligatorio";
  } else if (!REGEX.CURP.test(usuario.Curp.toUpperCase())) {
    errors.Curp = "Formato de CURP inválido";
  }

  if (!usuario.Correo?.trim()) {
    errors.Correo = "El correo es obligatorio";
  } else if (!REGEX.EMAIL.test(usuario.Correo)) {
    errors.Correo = "Correo electrónico inválido";
  }

  if (!usuario.Telefono?.trim()) {
    errors.Telefono = "El teléfono es obligatorio";
  } else if (!REGEX.PHONE.test(usuario.Telefono)) {
    errors.Telefono = "El teléfono debe tener 10 dígitos";
  }

  if (!usuario.Contrasena?.trim()) {
    errors.Contrasena = "La contraseña es obligatoria";
  } else if (usuario.Contrasena.length < 6) {
    errors.Contrasena = "Mínimo 6 caracteres";
  }

  if (!usuario.FechaNacimiento) {
    errors.FechaNacimiento = "La fecha de nacimiento es obligatoria";
  }else{
    const today = new Date();
    const birthDate = new Date(usuario.FechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 18) {
        errors.FechaNacimiento = "Debes ser mayor de 18 años para acceder a la plataforma";
    }
  }

  if (!usuario.Ine?.trim()) errors.Ine = "El número de INE es obligatorio";
  
  if (!usuario.Rfc?.trim()) {
    errors.Rfc = "El RFC es obligatorio";
  } else if (!REGEX.RFC.test(usuario.Rfc.toUpperCase())) {
    errors.Rfc = "Formato de RFC inválido";
  }

  return errors;
};

/**
 * Valida los datos del domicilio
 * @param {Object} domicilio - Objeto anidado de domicilio
 * @returns {Object} - Objeto con errores flat (para que coincidan con los names de los inputs)
 */
export const validateAddressData = (domicilio) => {
  const errors:Record<string,any>= {};

  if (!domicilio.Calle?.trim()) errors.Calle = "La calle es obligatoria";
  if (!domicilio.Colonia?.trim()) errors.Colonia = "La colonia es obligatoria";
  if (!domicilio.Municipio?.trim()) errors.Municipio = "El municipio es obligatorio";
  if (!domicilio.Ciudad?.trim()) errors.Ciudad = "La ciudad es obligatoria";
  if (!domicilio.Estado?.trim()) errors.Estado = "El estado es obligatorio";
  
  if (!domicilio.CodigoPostal?.trim()) {
    errors.CodigoPostal = "El C.P. es obligatorio";
  } else if (!REGEX.POSTAL_CODE.test(domicilio.CodigoPostal)) {
    errors.CodigoPostal = "El C.P. debe ser de 5 dígitos";
  }

  return errors;
};

/**
 * Helper principal que combina todas las validaciones estáticas
 */
const validateStaticForm = (usuario:Productor) => {
  const personalErrors = validatePersonalData(usuario);
  const addressErrors = validateAddressData(usuario.Domicilio);
  
  return { ...personalErrors, ...addressErrors };
};

export default validateStaticForm;