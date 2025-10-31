import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";

// Tipos de pregunta disponibles
const QUESTION_TYPES = [
  { value: "text", label: "Texto" },
  { value: "email", label: "Email" },
  { value: "password", label: "Contraseña" },
  { value: "number", label: "Número" },
  { value: "select", label: "Selección única" },
  { value: "radio", label: "Radio buttons" },
  { value: "checkbox", label: "Selección múltiple" },
  { value: "range", label: "Rango" },
  { value: "textarea", label: "Área de texto" }
];

// Preguntas iniciales de ejemplo
const INITIAL_QUESTIONS = [
  {
    id: "q1",
    fieldName: "fullName",
    question: "Nombre Completo",
    type: "text",
    required: true,
    placeholder: "Ingresa tu nombre completo",
    validations: {
      minLength: 3,
      maxLength: 100,
      pattern: "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$",
      patternMessage: "Solo se permiten letras y espacios"
    },
    section: "Información Personal",
    options: []
  },
  {
    id: "q2",
    fieldName: "email",
    question: "Correo Electrónico",
    type: "email",
    required: true,
    placeholder: "correo@ejemplo.com",
    validations: {
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      patternMessage: "Correo electrónico inválido"
    },
    section: "Información Personal",
    options: []
  },
  {
    id: "q3",
    fieldName: "municipality",
    question: "Municipio",
    type: "select",
    required: true,
    options: [
      { value: "chetumal", label: "Chetumal" },
      { value: "cancun", label: "Cancún" }
    ],
    section: "Ubicación de Parcela",
    validations: {}
  }
];

type Question = {
  id: string;
  fieldName: string;
  question: string;
  type: string;
  required: boolean;
  placeholder?: string;
  validations: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
    minSelected?: number;
    minSelectedMessage?: string;
    matchField?: string;
    matchMessage?: string;
    minMessage?: string;
    maxMessage?: string;
  };
  section: string;
  options: Array<{ value: string; label: string }>;
  step?: string;
  defaultValue?: number;
};

export default function GestionPadron() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const emptyQuestion: Question = {
    id: "",
    fieldName: "",
    question: "",
    type: "text",
    required: false,
    placeholder: "",
    validations: {},
    section: "",
    options: []
  };

  const [formData, setFormData] = useState<Question>(emptyQuestion);
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Editar pregunta existente
      setQuestions(questions.map(q => 
        q.id === editingId ? { ...formData, id: editingId } : q
      ));
    } else {
      // Crear nueva pregunta
      const newId = `q${questions.length + 1}`;
      setQuestions([...questions, { ...formData, id: newId }]);
    }

    resetForm();
  };

  const handleEdit = (question: Question) => {
    setFormData(question);
    setEditingId(question.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta pregunta?")) {
      setQuestions(questions.filter(q => q.id !== id));
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
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const needsOptions = ["select", "radio", "checkbox"].includes(formData.type);
  const needsRange = formData.type === "range";

  // Agrupar por sección
  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.section]) {
      acc[q.section] = [];
    }
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Preguntas
            </h1>
            <p className="text-gray-600 mt-1">
              Crea, edita y elimina preguntas del formulario
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Pregunta
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-green-500 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Editar Pregunta" : "Crear Nueva Pregunta"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Pregunta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pregunta *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Campo *
                  </label>
                  <input
                    type="text"
                    value={formData.fieldName}
                    onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                    required
                    placeholder="nombreCampo (sin espacios)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Tipo y Sección */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sección *
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    placeholder="Ej: Información Personal"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Campo obligatorio
                    </span>
                  </label>
                </div>
              </div>

              {/* Placeholder */}
              {!needsOptions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder || ""}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Opciones (para select, radio, checkbox) */}
              {needsOptions && (
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Opciones *
                  </label>

                  {formData.options.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <span className="flex-1 text-sm">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-gray-500"> ({opt.value})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption.value}
                      onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                      placeholder="Valor (ej: cancun)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                      placeholder="Etiqueta (ej: Cancún)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Validaciones */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Validaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.type === "text" || formData.type === "textarea" || formData.type === "password") && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Longitud mínima
                        </label>
                        <input
                          type="number"
                          value={formData.validations.minLength || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            validations: { ...formData.validations, minLength: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Longitud máxima
                        </label>
                        <input
                          type="number"
                          value={formData.validations.maxLength || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            validations: { ...formData.validations, maxLength: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </>
                  )}

                  {(formData.type === "number" || needsRange) && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Valor mínimo
                        </label>
                        <input
                          type="number"
                          value={formData.validations.min || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            validations: { ...formData.validations, min: parseFloat(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Valor máximo
                        </label>
                        <input
                          type="number"
                          value={formData.validations.max || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            validations: { ...formData.validations, max: parseFloat(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Patrón (Regex)
                    </label>
                    <input
                      type="text"
                      value={formData.validations.pattern || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        validations: { ...formData.validations, pattern: e.target.value }
                      })}
                      placeholder="^[a-zA-Z]+$"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {formData.validations.pattern && (
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Mensaje de error del patrón
                      </label>
                      <input
                        type="text"
                        value={formData.validations.patternMessage || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          validations: { ...formData.validations, patternMessage: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {editingId ? "Guardar Cambios" : "Crear Pregunta"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Preguntas por Sección */}
        <div className="space-y-6">
          {Object.keys(groupedQuestions).map(sectionName => (
            <div key={sectionName} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-green-600 mb-4 pb-2 border-b-2 border-green-500">
                {sectionName}
              </h2>

              <div className="space-y-3">
                {groupedQuestions[sectionName].map((question) => {
                  const isExpanded = expandedQuestions[question.id];
                  const typeLabel = QUESTION_TYPES.find(t => t.value === question.type)?.label;

                  return (
                    <div
                      key={question.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">
                              {question.question}
                            </h3>
                            {question.required && (
                              <span className="text-red-500 text-sm font-bold">*</span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="font-medium">Tipo: <span className="font-normal">{typeLabel}</span></span>
                            <span className="font-medium">Campo: <span className="font-mono font-normal">{question.fieldName}</span></span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExpand(question.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Detalles expandidos */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
                          {question.placeholder && (
                            <p className="text-gray-600">
                              <span className="font-medium">Placeholder:</span> {question.placeholder}
                            </p>
                          )}

                          {question.options.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Opciones:</p>
                              <div className="flex flex-wrap gap-2">
                                {question.options.map((opt, idx) => (
                                  <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                                    {opt.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Object.keys(question.validations).length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Validaciones:</p>
                              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                                {question.validations.minLength && (
                                  <p>• Longitud mínima: {question.validations.minLength}</p>
                                )}
                                {question.validations.maxLength && (
                                  <p>• Longitud máxima: {question.validations.maxLength}</p>
                                )}
                                {question.validations.min !== undefined && (
                                  <p>• Valor mínimo: {question.validations.min}</p>
                                )}
                                {question.validations.max !== undefined && (
                                  <p>• Valor máximo: {question.validations.max}</p>
                                )}
                                {question.validations.pattern && (
                                  <p>• Patrón: <code className="bg-white px-1 py-0.5 rounded">{question.validations.pattern}</code></p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No hay preguntas creadas</p>
            <p className="text-gray-400 text-sm mt-2">Haz clic en "Nueva Pregunta" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}