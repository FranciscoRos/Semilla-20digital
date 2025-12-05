import React, { useEffect, useState } from 'react';
import { Save, MapPin, User, Home, FileText, AlertCircle, LayoutList } from 'lucide-react';
import MapaDibujo from '@/components/mapaDrawForm';
import { useRegisterProducer } from '@/hooks/useRegisterPro';
import { Toaster } from '@/components/ui/toaster';
import SDloading from "@/assets/SDloading.svg"
import { usePreguntas } from '@/hooks/usePreguntas';
import validateStaticForm from '@/helper/validacionRegis';

const FormularioUsuarioParcelas = ({ user = null }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  const { dataPreguntas, loadingPreguntas } = usePreguntas();
  const { handleRegister, loadingRegister } = useRegisterProducer();
  
  const [usuario, setDatosusuario] = useState({
    Nombre: '',
    Apellido1: '',
    Apellido2: '',
    Curp: '',
    Correo: '',
    Contrasena: '',
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

  // Cargar datos para edición
  useEffect(() => {
    if (user) {
      console.log(user)
      setDatosusuario(prev => ({ ...prev, ...user }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [erroreStatic, setErroreStatic] = useState({});

  const groupedQuestions = (dataPreguntas || []).reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  // --- Lógica de validación (Misma que original) ---
  const validateQuestion = (question, value) => {
    const val = question.validations || {};
    if (!val) {
      if (question.required && (!value || value === "" || (Array.isArray(value) && value.length === 0))) {
        return "Este campo es obligatorio";
      }
      return null;
    }
    if (question.required && (!value || value === "" || (Array.isArray(value) && value.length === 0))) {
      return "Este campo es obligatorio";
    }
    if (!value && !question.required) return null;
    if (val.minLength && value && value.length < val.minLength) return `Mínimo ${val.minLength} caracteres`;
    if (val.maxLength && value && value.length > val.maxLength) return `Máximo ${val.maxLength} caracteres`;
    // @ts-ignore
    if (val.pattern && value && !val.pattern.test(value)) return val.patternMessage || "Formato inválido";
    if (val.min != null && value != null && value !== "" && parseFloat(value) < val.min)return val.minMessage || `El valor mínimo es ${val.min}`;
    if (val.max != null && value != null && value !== "" && parseFloat(value) > val.max)return val.maxMessage || `El valor máximo es ${val.max}`;
    if (val.minSelected && Array.isArray(value) && value.length < val.minSelected) return val.minSelectedMessage || `Selecciona al menos ${val.minSelected}`;
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

      setDatosusuario(prev => ({ ...prev, [name]: newValues }));
      setErrors(prev => ({ ...prev, [name]: null }));
    } else {
      setDatosusuario(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validar estáticos
    const staticErrors = validateStaticForm(usuario);
    setErroreStatic(staticErrors);

    // Validar parcelas
    if (usuario.Parcela.length === 0 || !usuario.Parcela) {
      setErroreStatic(prev => ({ ...prev, Parcela: "Debe registrar al menos una parcela" }));
    }

    // Validar preguntas dinámicas
    if (dataPreguntas) {
      dataPreguntas.forEach((question) => {
        const error = validateQuestion(question, usuario[question.fieldName]);
        if (error) {
          newErrors[question.fieldName] = error;
          hasErrors = true;
        }
      });
    }
    setErrors(newErrors);

    const hasStaticErrors = !!Object.keys(staticErrors).length;
    const isParcelaError = staticErrors['Parcela'] || (usuario.Parcela.length === 0);

    if (hasStaticErrors || hasErrors || isParcelaError) {
      if (isParcelaError && !hasErrors) {
        setActiveTab('parcelas');
      } else {
        setActiveTab('general');
        // Scroll al error después de un breve timeout para permitir renderizado
        setTimeout(() => {
            const firstErrorField = hasErrors ? Object.keys(newErrors)[0] : Object.keys(staticErrors)[0];
            if(firstErrorField !== 'Parcela'){
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    // @ts-ignore
                    element.focus();
                }
            }
        }, 100);
      }
      
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    if (!confirm('¿Esta seguro de la informacion proporcionada?')) return;
    
    handleRegister(usuario);
  };

  // Renderizador de campos dinámicos (Mismo que original)
  const renderDynamicField = (question) => {
    const value = usuario[question.fieldName] || "";
    const error = errors[question.fieldName];

    if (question.conditionalDisplay) {
      const dependValue = usuario[question.conditionalDisplay.dependsOn];
      if (dependValue !== question.conditionalDisplay.value) {
        return null;
      }
    }

    const inputClasses = `w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
      error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
    }`;

    switch (question.type) {
      case "text":
      case "email":
      case "password":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
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
            {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
          </div>
        );
      case "number":
        return (
            <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
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
            {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
            </div>
        );
      case "select":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select name={question.fieldName} value={value} onChange={handleDynamicChange} className={inputClasses}>
              <option value="">Seleccionar...</option>
              {question.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
          </div>
        );
      case "checkbox":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options.map((opt) => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${error ? "border-red-300" : "border-gray-200"}`}>
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
            {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
          </div>
        );
      case "radio":
        return (
          <div key={question.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options.map((opt) => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${error ? "border-red-300" : "border-gray-200"}`}>
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
            {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
          </div>
        );
       case "range":
         return (
           <div key={question.id}>
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
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
               <span className="text-xl font-bold text-blue-600 w-12 text-center">{value || 0}</span>
             </div>
             {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
           </div>
         );
       case "textarea":
         return (
           <div key={question.id}>
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               {question.question} {question.required && <span className="text-red-500 ml-1">*</span>}
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
             {question.validations?.maxLength && <p className="mt-1 text-sm text-gray-500 text-right">{value.length} / {question.validations.maxLength}</p>}
             {error && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
           </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Título */}
            <div className="bg-white p-6 md:p-8 border-b border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                    {user ? 'Modificar Información' : 'Registro de Productor'}
                </h1>
                <p className="text-gray-500 text-center mt-2">
                    Gestione la información personal y las parcelas asociadas
                </p>
            </div>

            {/* Tabs de Navegación */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-lg font-semibold transition-all duration-300
                        ${activeTab === 'general' 
                            ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <LayoutList size={22} />
                    Datos Generales
                </button>
                <button
                    onClick={() => setActiveTab('parcelas')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-lg font-semibold transition-all duration-300
                        ${activeTab === 'parcelas' 
                            ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <MapPin size={22} />
                    Parcelas
                    {usuario.Parcela.length > 0 && (
                         <span className="ml-2 bg-green-100 text-green-700 text-xs py-1 px-2 rounded-full">
                            {usuario.Parcela.length}
                         </span>
                    )}
                </button>
            </div>

            {/* Contenido del Formulario */}
            <div className="p-6 md:p-8">
                
                {/* TAB: DATOS GENERALES */}
                {activeTab === 'general' && (
                    <div className="space-y-10 animate-fadeIn">
                        
                        {/* Sección 1: Información Básica */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <User size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Información Básica</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Campos inputs básicos... */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                                    <input type="text" name="Nombre" value={usuario.Nombre} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Nombre'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Nombre']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Primer Apellido *</label>
                                    <input type="text" name="Apellido1" value={usuario.Apellido1} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Apellido1'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Apellido1']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Segundo Apellido</label>
                                    <input type="text" name="Apellido2" value={usuario.Apellido2} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Apellido2'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Apellido2']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">CURP *</label>
                                    <input type="text" name="Curp" maxLength={18} value={usuario.Curp} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" />
                                    {erroreStatic['Curp'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Curp']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">RFC *</label>
                                    <input type="text" name="Rfc" maxLength={13} value={usuario.Rfc} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" />
                                    {erroreStatic['Rfc'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Rfc']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Teléfono *</label>
                                    <input type="tel" name="Telefono" value={usuario.Telefono} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Telefono'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Telefono']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Correo *</label>
                                    <input type="email" name="Correo" value={usuario.Correo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Correo'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Correo']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Contraseña *</label>
                                    <input type="password" name="Contrasena" value={usuario.Contrasena} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Contrasena'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Contrasena']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Fecha Nacimiento *</label>
                                    <input type="date" name="FechaNacimiento" value={usuario.FechaNacimiento} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['FechaNacimiento'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['FechaNacimiento']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">INE (Reverso) *</label>
                                    <input type="text" name="Ine" value={usuario.Ine} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Ine'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Ine']}</div>}
                                </div>
                            </div>
                        </section>

                        {/* Sección 2: Domicilio */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Home size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Domicilio</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Calle *</label>
                                    <input type="text" name="Calle" value={usuario.Domicilio.Calle} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Calle'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Calle']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Colonia *</label>
                                    <input type="text" name="Colonia" value={usuario.Domicilio.Colonia} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Colonia'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Colonia']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Código Postal *</label>
                                    <input type="text" maxLength={5} name="CodigoPostal" value={usuario.Domicilio.CodigoPostal} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['CodigoPostal'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['CodigoPostal']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Municipio *</label>
                                    <input type="text" name="Municipio" value={usuario.Domicilio.Municipio} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Municipio'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Municipio']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Ciudad *</label>
                                    <input type="text" name="Ciudad" value={usuario.Domicilio.Ciudad} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Ciudad'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Ciudad']}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Estado *</label>
                                    <input type="text" name="Estado" value={usuario.Domicilio.Estado} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    {erroreStatic['Estado'] && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {erroreStatic['Estado']}</div>}
                                </div>
                                <div className="md:col-span-3 space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Referencias</label>
                                    <textarea name="Referencia" rows={2} value={usuario.Domicilio.Referencia} onChange={handleDomicilioChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: Casa color azul, portón negro..." />
                                </div>
                            </div>
                        </section>

                        {/* Sección 3: Preguntas Adicionales */}
                         {!loadingPreguntas && (
                            <section>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <FileText size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Información Adicional</h2>
                                </div>
                                <div className="space-y-8">
                                    {Object.keys(groupedQuestions).map((sectionName) => (
                                        <div key={sectionName} className="bg-gray-50 p-6 rounded-xl">
                                            <h3 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">{sectionName}</h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                {groupedQuestions[sectionName].map((question) => renderDynamicField(question))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                         )}

                    </div>
                )}

                {/* TAB: PARCELAS */}
                {activeTab === 'parcelas' && (
                     <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold text-gray-700">Geolocalización de Parcelas</h2>
                             {erroreStatic['Parcela'] && 
                                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    {erroreStatic['Parcela']}
                                </div>
                             }
                        </div>
                        <div className="h-[600px] bg-gray-100 rounded-xl overflow-auto border-2 border-gray-200">
                             <MapaDibujo 
                                key={"registro1"}
                                 initialParcelas={usuario.Parcela} 
                                 onParcelasChange={(parcelas) => setDatosusuario(prev => ({...prev, Parcela: parcelas}))}
                             />
                        </div>
                     </div>
                )}

                {/* FOOTER DE ACCIONES */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                     <button
                        onClick={handleSubmit}
                        disabled={loadingPreguntas || loadingRegister}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <Save size={24} />
                        {loadingRegister ? 'Guardando...' : user ? 'Actualizar Información' : 'Registrar Productor'}
                    </button>
                </div>
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