import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Save, MapPin, User, Home, FileText, AlertCircle } from 'lucide-react';
import MapaDibujo from '@/components/mapaDrawForm';
import { useRegisterProducer } from '@/hooks/useRegisterPro';
import { Toaster } from '@/components/ui/toaster';
import SDloading from "@/assets/SDloading.svg"
import { usePreguntas } from '@/hooks/usePreguntas';
import validateStaticForm from '@/helper/validacionRegis';
import { Question } from '@/services/api';


const FormularioUsuarioParcelas = () => {
  const [seccionAbierta, setSeccionAbierta] = useState('basica');
  const {dataPreguntas,loadingPreguntas}=usePreguntas()
  const {handleRegister,loadingRegister}=useRegisterProducer()
  const [usuario, setDatosusuario] = useState({
    Nombre: '',
    Apellido1: '',
    Apellido2: '',
    Curp: '',
    Correo: '',
    Contrasena:'',
    Telefono: '',
    FechaNacimiento: '',
    Ine: '',
    Rfc: '',
    Domicilio: {
      Calle: '',
      Colonia: '',
      Municipio: '',
      Ciudad: '',
      Estado: '',
      CodigoPostal: '',
      Referencia: ''
    },
    Parcela: [],
});

  const [errors, setErrors] = useState({});
  const [erroreStatic, setErroreStatic] = useState({});


  const groupedQuestions = (dataPreguntas || []).reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  // Validar una pregunta específica
  const validateQuestion = (question:Question, value) => {
    const val = question.validations || {};
    
    if (!val) {
      if (question.required && (!value || value === "" || (Array.isArray(value) && value.length === 0))) {
        return "Este campo es obligatorio";
      }
      return null;
    }

    // Requerido
    if (question.required && (!value || value === "" || (Array.isArray(value) && value.length === 0))) {
      return "Este campo es obligatorio";
    }

    // Si no hay valor y no es requerido, no validar más
    if (!value && !question.required) return null;

    // Longitud mínima
    if (val.minLength && value && value.length < val.minLength) {
      return `Mínimo ${val.minLength} caracteres`;
    }

    // Longitud máxima
    if (val.maxLength && value && value.length > val.maxLength) {
      return `Máximo ${val.maxLength} caracteres`;
    }

    // Patrón
    if (val.pattern && value && !val.pattern.test(value)) {
      return val.patternMessage || "Formato inválido";
    }

    // Número mínimo
    if (val.min !== undefined && value !== undefined && value !== "" && parseFloat(value) < val.min) {
      return val.minMessage || `El valor mínimo es ${val.min}`;
    }

    // Número máximo
    if (val.max !== undefined && value !== undefined && value !== "" && parseFloat(value) > val.max) {
      return val.maxMessage || `El valor máximo es ${val.max}`;
    }

    // Mínimo seleccionados (checkbox)
    if (val.minSelected && Array.isArray(value) && value.length < val.minSelected) {
      return val.minSelectedMessage || `Selecciona al menos ${val.minSelected}`;
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosusuario(prev => ({
      ...prev,
        [name]: value
    }));
  };

  const handleDomicilioChange = (e) => {
    console.log(e.target)
    const { name, value } = e.target;
    setDatosusuario(prev => ({
      ...prev,
      Domicilio: {
        ...prev.Domicilio,
        [name]: value
      }
    }));
  };

  const handleDynamicChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const currentValues = usuario[name] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);

      setDatosusuario(prev => ({
        ...prev,
          [name]: newValues
      }));
      setErrors(prev => ({ ...prev, [name]: null }));
    } else {
      setDatosusuario(prev => ({
        ...prev,
          [name]: value
        
      }));
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleSeccion = (seccion) => {
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  };

    const handleSubmit = () => {
    const newErrors = {};
    let hasErrors = false;

    setErroreStatic(validateStaticForm(usuario));
    if(usuario.Parcela.length===0){
      setErroreStatic(prev=>({...prev,Parcela:"Debe registrar al menos una parcela"}))
    }

    // Validar preguntas dinámicas
    if (dataPreguntas) {
      dataPreguntas.forEach((question:Question) => {
/* if (question.conditionalDisplay) {
        const dependValue = usuario[question.conditionalDisplay.dependsOn];
        if (dependValue !== question.conditionalDisplay.value) {
          return; // No validar si no se muestra
        }} */
       const error = validateQuestion(question, usuario[question.fieldName]);
        if (error) {
          newErrors[question.fieldName] = error;
          hasErrors = true;
        }
      });
    }
    setErrors(newErrors);

    if (!!Object.keys(erroreStatic).length || hasErrors) {
      // Scroll al primer error

      const firstErrorField = hasErrors?Object.keys(newErrors)[0]:Object.keys(erroreStatic)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        //@ts-ignore
        element.focus();
      }
      alert('Por favor corrige los errores en el formulario');
      return;
    }
    if(!confirm('¿Esta seguro de la informacion proporcionada?'))
    console.log('Datos completos:', JSON.stringify(usuario));
    handleRegister(usuario)
    setErrors({})
    setDatosusuario({
    Nombre: '',
    Apellido1: '',
    Apellido2: '',
    Curp: '',
    Correo: '',
    Contrasena:'',
    Telefono: '',
    FechaNacimiento: '',
    Ine: '',
    Rfc: '',
    Domicilio: {
      Calle: '',
      Colonia: '',
      Municipio: '',
      Ciudad: '',
      Estado: '',
      CodigoPostal: '',
      Referencia: ''
    },
    Parcela: [],
})
  };

  // Renderizar campo según tipo
  const renderDynamicField = (question) => {
    const value = usuario[question.fieldName] || "";
    const error = errors[question.fieldName];

    // Verificar si debe mostrarse (condicional)
    if (question.conditionalDisplay) {
      const dependValue = usuario[question.conditionalDisplay.dependsOn];
      if (dependValue !== question.conditionalDisplay.value) {
        return null;
      }
    }

    const inputClasses = `w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
      error
        ? "border-red-300 focus:ring-red-500"
        : "border-gray-300 focus:ring-blue-500"
    }`;

    switch (question.type) {
      case "text":
      case "email":
      case "password":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={question.type}
              name={question.fieldName}
              value={value}
              onChange={handleDynamicChange}
              placeholder={question.placeholder}
              maxLength={question.validations?.maxLength}
              className={inputClasses}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              name={question.fieldName}
              value={value}
              onChange={handleDynamicChange}
              min={question.validations?.min}
              max={question.validations?.max}
              className={inputClasses}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              name={question.fieldName}
              value={value}
              onChange={handleDynamicChange}
              className={inputClasses}
            >
              <option value="">Seleccionar...</option>
              {question.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    error ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={question.fieldName}
                    value={opt.value}
                    checked={(usuario[question.fieldName] || []).includes(opt.value)}
                    onChange={handleDynamicChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    error ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.fieldName}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={handleDynamicChange}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "range":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name={question.fieldName}
                value={value || 0}
                onChange={handleDynamicChange}
                min={question.validations?.min || 0}
                max={question.validations?.max || 100}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xl font-bold text-blue-600 w-12 text-center">
                {value || 0}
              </span>
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={question.fieldName}
              value={value}
              onChange={handleDynamicChange}
              placeholder={question.placeholder}
              maxLength={question.validations?.maxLength}
              rows={4}
              className={`${inputClasses} resize-none`}
            />
            {question.validations?.maxLength && (
              <p className="mt-1 text-sm text-gray-500 text-right">
                {value.length} / {question.validations.maxLength}
              </p>
            )}
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const SeccionHeader = ({ id, titulo, icono: Icono }) => (
    <button
      onClick={() => toggleSeccion(id)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
    >
      <div className="flex items-center gap-3">
        <Icono size={24} />
        <span className="font-semibold text-lg">{titulo}</span>
      </div>
      {seccionAbierta === id ? <ChevronUp /> : <ChevronDown />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Registro de usuario y Parcelas
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Complete todos los campos para registrar su información
          </p>

          <div className="space-y-6">
            
            {/* Sección: Información Básica */}
            <div>
              <SeccionHeader id="basica" titulo="Información Básica" icono={User} />
              {seccionAbierta === 'basica' && (
                <div className="mt-4 p-6 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="Nombre"
                        value={usuario.Nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    {erroreStatic['Nombre'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Nombre']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primer Apellido *
                      </label>
                      <input
                        type="text"
                        name="Apellido1"
                        value={usuario.Apellido1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Apellido1'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Apellido1']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Segundo Apellido
                      </label>
                      <input
                        type="text"
                        name="Apellido2"
                        value={usuario.Apellido2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Apellido2'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Apellido2']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CURP *
                      </label>
                      <input
                        type="text"
                        name="Curp"
                        value={usuario.Curp}
                        onChange={handleInputChange}
                        maxLength={18}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                      {erroreStatic['Curp'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Curp']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="Correo"
                        value={usuario.Correo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Correo'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Correo']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contrase&ntilde;a *
                      </label>
                      <input
                        type="contrasena"
                        name="Contrasena"
                        value={usuario.Contrasena}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Contrasena'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Contrasena']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="Telefono"
                        value={usuario.Telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Telefono'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Telefono']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        name="FechaNacimiento"
                        value={usuario.FechaNacimiento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['FechaNacimiento'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['FechaNacimiento']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de INE (reverso) *
                      </label>
                      <input
                        type="text"
                        name="Ine"
                        value={usuario.Ine}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Ine'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Ine']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RFC *
                      </label>
                      <input
                        type="text"
                        name="Rfc"
                        value={usuario.Rfc}
                        onChange={handleInputChange}
                        maxLength={13}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                      {erroreStatic['Rfc'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Rfc']}
                      </div>
                    }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Domicilio */}
            <div>
              <SeccionHeader id="domicilio" titulo="Domicilio" icono={Home} />
              {seccionAbierta === 'domicilio' && (
                <div className="mt-4 p-6 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle *
                      </label>
                      <input
                        type="text"
                        name="Calle"
                        value={usuario.Domicilio.Calle}
                        onChange={handleDomicilioChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Calle'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Calle']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Colonia *
                      </label>
                      <input
                        type="text"
                        name="Colonia"
                        value={usuario.Domicilio.Colonia}
                        onChange={handleDomicilioChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Colonia'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Colonia']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Municipio *
                      </label>
                      <input
                        type="text"
                        name="Municipio"
                        value={usuario.Domicilio.Municipio}
                        onChange={handleDomicilioChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Municipio'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Municipio']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="Ciudad"
                        value={usuario.Domicilio.Ciudad}
                        onChange={handleDomicilioChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Ciudad'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Ciudad']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        name="Estado"
                        value={usuario.Domicilio.Estado}
                        onChange={handleDomicilioChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['Estado'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Estado']}
                      </div>
                    }
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="CodigoPostal"
                        value={usuario.Domicilio.CodigoPostal}
                        onChange={handleDomicilioChange}
                        maxLength={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {erroreStatic['CodigoPostal'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['CodigoPostal']}
                      </div>
                    }
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencias
                      </label>
                      <textarea
                        name="Referencia"
                        value={usuario.Domicilio.Referencia}
                        onChange={handleDomicilioChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Entre calle X y Y, cerca de..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Parcelas */}
            <div>
              <SeccionHeader id="parcelas" titulo="Parcelas" icono={MapPin} />
              {seccionAbierta === 'parcelas' && (
                <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                  {erroreStatic['Parcela'] && 
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {erroreStatic['Parcela']}
                      </div>
                    }
                  <MapaDibujo 
                    onParcelasChange={(parcelas) => setDatosusuario(prev => ({...prev,Parcela:parcelas}))}
                  />
                </div>
              )}
            </div>

            {/* Sección: Preguntas Dinámicas */}
            <div>
              <SeccionHeader id="dinamicas" titulo="Información Adicional" icono={FileText} />
              {seccionAbierta === 'dinamicas' && !loadingPreguntas && (
                <div className="mt-4 p-6 bg-gray-50 rounded-lg space-y-8">
                  {Object.keys(groupedQuestions).map((sectionName) => (
                    <div key={sectionName} className="border-b-2 border-gray-200 pb-6 last:border-b-0">
                      <h3 className="text-lg font-bold text-blue-600 mb-4">{sectionName}</h3>
                      <div className="space-y-6">
                        {groupedQuestions[sectionName].map((question) => (
                          renderDynamicField(question)
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón Submit */}
            <button
              onClick={handleSubmit}
              disabled={loadingPreguntas || loadingRegister}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              <Save size={24} />
             { loadingRegister?'Registrando...':'Registrarse'}
            </button>
          </div>
        </div>

      </div>
       {loadingRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]">
              <img src={SDloading} alt="Cargando..." width="100" height="100"/>
        </div>
      )}
      <Toaster/>
    </div>  
  );
};

export default FormularioUsuarioParcelas;