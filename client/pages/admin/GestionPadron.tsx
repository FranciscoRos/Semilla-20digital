import { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Settings, 
  ListChecks, 
  AlertCircle,
  Type,
  CheckSquare,
  Save,
  ArrowLeft
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import SDloading from "@/assets/SDloading.svg";
import { usePreguntas } from "@/hooks/usePreguntas";
import { usePreguntasDetalles } from "@/hooks/usePreguntasDetalles";
import { Question } from "@/services/api";
import GoBack from "@/components/goBack";

// Constantes
const QUESTION_TYPES = [
  { value: "text", label: "Texto Corto", icon: <Type className="w-4 h-4"/> },
  { value: "textarea", label: "Párrafo", icon: <Type className="w-4 h-4"/> },
  { value: "email", label: "Correo Electrónico", icon: <Type className="w-4 h-4"/> },
  { value: "number", label: "Numérico", icon: <Type className="w-4 h-4"/> },
  { value: "select", label: "Lista Desplegable", icon: <ListChecks className="w-4 h-4"/> },
  { value: "radio", label: "Opción Única", icon: <CheckSquare className="w-4 h-4"/> },
  { value: "checkbox", label: "Opción Múltiple", icon: <CheckSquare className="w-4 h-4"/> },
  { value: "range", label: "Rango", icon: <Settings className="w-4 h-4"/> },
  { value: "password", label: "Contraseña", icon: <Settings className="w-4 h-4"/> },
];

export default function GestionPadron() {
  const { dataPreguntas, loadingPreguntas, refetch } = usePreguntas();
  const { handlePostPregunta, handlePutPregunta, HandleDeletePregunta, loadingAcciones } = usePreguntasDetalles(() => refetch());
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loadingPreguntas && dataPreguntas) setQuestions(dataPreguntas);
  }, [dataPreguntas, loadingPreguntas]);

  const emptyQuestion: Question = {
    id: "",
    fieldName: "",
    question: "",
    type: "text",
    required: false,
    placeholder: "",
    validations: {},
    section: "",
    options: [],
  };

  const [formData, setFormData] = useState<Question>(emptyQuestion);
  const [newOption, setNewOption] = useState({ value: "", label: "" });
  const [changeSelect, setChangeSelect] = useState(true);

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await handlePutPregunta({ id: editingId, data: formData });
    } else {
      await handlePostPregunta(formData);
    }
    resetForm();
  };

  const handleEdit = (question: Question) => {
    setFormData(question);
    setEditingId(question.id);
    setShowForm(true);
    // Verificar si la sección existe en las agrupaciones actuales
    const sectionExists = Object.keys(groupedQuestions).includes(question.section);
    setChangeSelect(sectionExists);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta pregunta permanentemente?")) {
      await HandleDeletePregunta(id);
    }
  };

  const resetForm = () => {
    setFormData(emptyQuestion);
    setEditingId(null);
    setShowForm(false);
    setNewOption({ value: "", label: "" });
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption]
      });
      setNewOption({ value: "", label: "" });
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Helpers Lógicos ---
  const needsOptions = ["select", "radio", "checkbox"].includes(formData.type);
  const needsRange = formData.type === "range";

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* Header Principal */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
             <div className="flex items-center gap-4 mb-2">
                 <GoBack />
                 <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Configuración del Padrón</h1>
             </div>
             <div className="flex justify-between items-center ml-10">
                <p className="text-slate-500 text-sm">Diseña el formulario de registro para los productores.</p>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-slate-900 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Pregunta
                    </button>
                )}
             </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ================= FORMULARIO DE EDICIÓN / CREACIÓN ================= */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-50/80 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {editingId ? <Edit2 className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-green-600"/>}
                    {editingId ? "Editar Pregunta Existente" : "Configurar Nueva Pregunta"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Define los parámetros del campo que verán los usuarios.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-8 space-y-8">
              
              {/* SECCIÓN 1: DATOS BÁSICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <label className="block text-sm font-bold text-slate-700 mb-2">Pregunta / Etiqueta <span className="text-red-500">*</span></label>
                   <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Ej: ¿Cuál es su cultivo principal?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium"
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Identificador (fieldName) <span className="text-red-500">*</span></label>
                   <input
                      type="text"
                      value={formData.fieldName}
                      onChange={(e) => setFormData({ ...formData, fieldName: e.target.value.replace(/\s+/g, '') })}
                      placeholder="cultivoPrincipal"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-mono text-sm"
                   />
                   <p className="text-[10px] text-slate-400 mt-1 ml-1">Sin espacios ni caracteres especiales.</p>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Campo <span className="text-red-500">*</span></label>
                   <div className="relative">
                       <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none appearance-none"
                       >
                          {QUESTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                       </select>
                       <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none"/>
                   </div>
                </div>
              </div>

              {/* SECCIÓN 2: UBICACIÓN Y COMPORTAMIENTO */}
              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Configuración General
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Sección del Formulario <span className="text-red-500">*</span></label>
                        {Object.keys(groupedQuestions).length > 0 && changeSelect ? (
                            <div className="relative">
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none"
                                >
                                    <option value="">Selecciona una sección...</option>
                                    {Object.keys(groupedQuestions).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none"/>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                placeholder="Ej: Información Personal"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                            />
                        )}
                        
                        {Object.keys(groupedQuestions).length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="useExisting"
                                    checked={changeSelect}
                                    onChange={(e) => {
                                        setFormData({...formData, section: ''});
                                        setChangeSelect(e.target.checked)
                                    }}
                                    className="rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor="useExisting" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                                    Usar una sección existente
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                        {!needsOptions && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Placeholder (Ejemplo)</label>
                                <input
                                    type="text"
                                    value={formData.placeholder || ""}
                                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                />
                            </div>
                        )}
                        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.required}
                                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-800">Campo Obligatorio</span>
                                <span className="block text-xs text-slate-500">El usuario no podrá continuar sin llenar esto.</span>
                            </div>
                        </label>
                    </div>
                 </div>
              </div>

              {/* SECCIÓN 3: OPCIONES (CONDICIONAL) */}
              {needsOptions && (
                 <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                     <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                        <ListChecks className="w-3 h-3" /> Opciones de Selección
                     </h3>
                     
                     <div className="flex gap-2">
                        <input
                           type="text"
                           value={newOption.label}
                           onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                           placeholder="Etiqueta visible (Ej: Maíz)"
                           className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                         <input
                           type="text"
                           value={newOption.value}
                           onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                           placeholder="Valor interno (Ej: maiz)"
                           className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                        />
                        <button
                           type="button"
                           onClick={addOption}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                           <Plus className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="space-y-2 mt-4">
                        {formData.options.length === 0 && <p className="text-sm text-blue-400 italic">No hay opciones agregadas aún.</p>}
                        {formData.options.map((opt, idx) => (
                           <div key={idx} className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                              <div className="flex items-center gap-2 text-sm">
                                 <span className="font-bold text-slate-700">{opt.label}</span>
                                 <span className="text-slate-400 text-xs font-mono">({opt.value})</span>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => removeOption(idx)}
                                 className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                 </div>
              )}

              {/* SECCIÓN 4: VALIDACIONES AVANZADAS */}
              <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                 <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Reglas de Validación
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {/* Campos de texto */}
                    {(["text", "textarea", "password"].includes(formData.type)) && (
                        <>
                           <div>
                              <label className="block text-slate-600 text-xs font-bold mb-1">Mínimo Caracteres</label>
                              <input type="number" 
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                                value={formData.validations.minLength || ""}
                                onChange={(e) => setFormData({...formData, validations: {...formData.validations, minLength: parseInt(e.target.value) || undefined}})}
                              />
                           </div>
                           <div>
                              <label className="block text-slate-600 text-xs font-bold mb-1">Máximo Caracteres</label>
                              <input type="number" 
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                                value={formData.validations.maxLength || ""}
                                onChange={(e) => setFormData({...formData, validations: {...formData.validations, maxLength: parseInt(e.target.value) || undefined}})}
                              />
                           </div>
                        </>
                    )}

                    {/* Campos numéricos */}
                    {(formData.type === "number" || needsRange) && (
                        <>
                           <div>
                              <label className="block text-slate-600 text-xs font-bold mb-1">Valor Mínimo</label>
                              <input type="number" 
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                                value={formData.validations.min || ""}
                                onChange={(e) => setFormData({...formData, validations: {...formData.validations, min: parseFloat(e.target.value) || undefined}})}
                              />
                           </div>
                           <div>
                              <label className="block text-slate-600 text-xs font-bold mb-1">Valor Máximo</label>
                              <input type="number" 
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                                value={formData.validations.max || ""}
                                onChange={(e) => setFormData({...formData, validations: {...formData.validations, max: parseFloat(e.target.value) || undefined}})}
                              />
                           </div>
                        </>
                    )}
                    
                    {/* Regex */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-600 text-xs font-bold mb-1">Expresión Regular (Regex)</label>
                            <input type="text" 
                                placeholder="^[a-zA-Z]+$"
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                                value={formData.validations.pattern || ""}
                                onChange={(e) => setFormData({...formData, validations: {...formData.validations, pattern: e.target.value}})}
                            />
                        </div>
                        {formData.validations.pattern && (
                            <div>
                                <label className="block text-slate-600 text-xs font-bold mb-1">Mensaje de Error Personalizado</label>
                                <input type="text" 
                                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                                    value={formData.validations.patternMessage || ""}
                                    onChange={(e) => setFormData({...formData, validations: {...formData.validations, patternMessage: e.target.value}})}
                                />
                            </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* ACTIONS FOOTER */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                 <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all flex justify-center items-center gap-2 active:scale-95"
                 >
                    <Save className="w-5 h-5" />
                    {editingId ? "Guardar Cambios" : "Crear Pregunta"}
                 </button>
                 <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-colors"
                 >
                    Cancelar
                 </button>
              </div>

            </form>
          </div>
        )}

        {/* ================= LISTADO DE PREGUNTAS ================= */}
        <div className="space-y-8">
            {loadingPreguntas ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <img src={SDloading} alt="Cargando..." className="w-16 h-16 animate-pulse opacity-70" />
                    <p className="text-slate-400 font-medium mt-4">Cargando configuración...</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListChecks className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No hay preguntas configuradas</p>
                    <p className="text-slate-400 text-sm mt-1 mb-6">Comienza agregando la primera pregunta a tu formulario.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-green-600 font-bold hover:underline"
                    >
                        Crear Pregunta
                    </button>
                </div>
            ) : (
                Object.keys(groupedQuestions).map(sectionName => (
                    <div key={sectionName} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-slate-800">{sectionName}</h2>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
                                {groupedQuestions[sectionName].length} campos
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {groupedQuestions[sectionName].map((question) => {
                                const isExpanded = expandedQuestions[question.id];
                                const typeInfo = QUESTION_TYPES.find(t => t.value === question.type);

                                return (
                                    <div 
                                        key={question.id} 
                                        className={`
                                            group border border-slate-200 rounded-xl p-4 transition-all duration-200
                                            ${isExpanded ? 'bg-slate-50/50 ring-1 ring-slate-200' : 'bg-white hover:border-green-200 hover:shadow-md'}
                                        `}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            
                                            {/* Icono del tipo */}
                                            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500 mt-1">
                                                {typeInfo?.icon || <Type className="w-5 h-5"/>}
                                            </div>

                                            {/* Info Principal */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 text-lg">
                                                        {question.question}
                                                    </h3>
                                                    {question.required && (
                                                        <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wide">
                                                            Requerido
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{typeInfo?.label}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="font-mono text-xs bg-slate-50 border border-slate-100 px-1 rounded">{question.fieldName}</span>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleExpand(question.id)}
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                                    title={isExpanded ? "Colapsar" : "Expandir detalles"}
                                                >
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(question)}
                                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(question.id)}
                                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles Expandidos */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 pl-[3.25rem]">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                                                    {question.placeholder && (
                                                        <div><span className="font-semibold text-slate-800">Placeholder:</span> {question.placeholder}</div>
                                                    )}
                                                    
                                                    {question.options.length > 0 && (
                                                        <div className="md:col-span-2">
                                                            <span className="font-semibold text-slate-800 block mb-1">Opciones:</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {question.options.map((opt, i) => (
                                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs shadow-sm">
                                                                        {opt.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {Object.keys(question.validations).length > 0 && (
                                                        <div className="md:col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                                                            <span className="font-bold text-amber-700 text-xs uppercase tracking-wide mb-2 block">Validaciones Activas</span>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                                {Object.entries(question.validations).map(([key, val]) => (
                                                                    <div key={key} className="flex justify-between border-b border-amber-100/50 last:border-0 py-1">
                                                                        <span className="text-amber-900">{key}:</span>
                                                                        <span className="font-mono text-amber-700">{String(val)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingAcciones && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
                <img src={SDloading} alt="Procesando..." className="w-16 h-16 animate-pulse" />
                <p className="text-slate-700 font-bold mt-4">Guardando cambios...</p>
            </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}