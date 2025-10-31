import { useState } from "react";
import { Check, AlertCircle, Layers } from "lucide-react";
import MapaDibujo  from "@/components/mapaDrawForm";

// Estructura de datos para preguntas dinámicas
const QUESTION_SCHEMA = [
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
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      patternMessage: "Solo se permiten letras y espacios",
    },
    section: "Información Personal",
  },
  {
    id: "q2",
    fieldName: "curp",
    question: "CURP",
    type: "text",
    required: true,
    placeholder: "CURP de 18 caracteres",
    validations: {
      minLength: 18,
      maxLength: 18,
      pattern: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
      patternMessage: "Formato de CURP inválido",
    },
    section: "Información Personal",
  },
  {
    id: "q3",
    fieldName: "email",
    question: "Correo Electrónico",
    type: "email",
    required: true,
    placeholder: "correo@ejemplo.com",
    validations: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: "Correo electrónico inválido",
    },
    section: "Información Personal",
  },
  {
    id: "q4",
    fieldName: "phone",
    question: "Teléfono",
    type: "text",
    required: false,
    placeholder: "10 dígitos",
    validations: {
      pattern: /^\d{10}$/,
      patternMessage: "Debe contener 10 dígitos",
    },
    section: "Información Personal",
  },
  {
    id: "q5",
    fieldName: "age",
    question: "Edad",
    type: "number",
    required: true,
    validations: {
      min: 18,
      max: 120,
      minMessage: "Debes ser mayor de 18 años",
      maxMessage: "Por favor verifica tu edad",
    },
    section: "Información Personal",
  },
  {
    id: "q11",
    fieldName: "experience",
    question: "Años de experiencia como productor",
    type: "range",
    required: true,
    validations: {
      min: 0,
      max: 50,
    },
    defaultValue: 5,
    section: "Información de Cultivos",
  },
  {
    id: "q12",
    fieldName: "organicCertified",
    question: "¿Cuentas con certificación orgánica?",
    type: "radio",
    required: true,
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
      { value: "in_process", label: "En proceso" },
    ],
    section: "Información de Cultivos",
  },
  {
    id: "q13",
    fieldName: "additionalInfo",
    question: "Información adicional",
    type: "textarea",
    required: false,
    placeholder: "Cuéntanos más sobre tu parcela o experiencia (opcional)",
    validations: {
      maxLength: 500,
    },
    section: "Información de Cultivos",
  },
  {
    id: "q14",
    fieldName: "password",
    question: "Contraseña",
    type: "password",
    required: true,
    placeholder: "Mínimo 8 caracteres",
    validations: {
      minLength: 8,
      maxLength: 50,
    },
    section: "Seguridad",
  },
  {
    id: "q15",
    fieldName: "confirmPassword",
    question: "Confirmar Contraseña",
    type: "password",
    required: true,
    placeholder: "Repite tu contraseña",
    validations: {
      minLength: 8,
      maxLength: 50,
      matchField: "password",
      matchMessage: "Las contraseñas no coinciden",
    },
    section: "Seguridad",
  },
];

export default function DynamicFormDemo() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [parcelPolygon, setParcelPolygon] = useState([]);
  // Agrupar preguntas por sección
  const groupedQuestions = QUESTION_SCHEMA.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  const handlePolygonChange = (coordinates) => {
    console.log("Polígono actualizado:", coordinates);
    setParcelPolygon(coordinates);

    // Limpiar error si hay al menos 3 puntos
    if (coordinates.length >= 3) {
      setErrors((prev) => ({ ...prev, parcelPolygon: null }));
    }
  };

  // Validar una pregunta específica
  const validateQuestion = (question, value) => {
    const val = question.validations;
    if (!val) {
      if (
        question.required &&
        (!value || value === "" || (Array.isArray(value) && value.length === 0))
      ) {
        return "Este campo es obligatorio";
      }
      return null;
    }

    // Requerido
    if (
      question.required &&
      (!value || value === "" || (Array.isArray(value) && value.length === 0))
    ) {
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
    if (
      val.min !== undefined &&
      value !== undefined &&
      value !== "" &&
      parseFloat(value) < val.min
    ) {
      return val.minMessage || `El valor mínimo es ${val.min}`;
    }

    // Número máximo
    if (
      val.max !== undefined &&
      value !== undefined &&
      value !== "" &&
      parseFloat(value) > val.max
    ) {
      return val.maxMessage || `El valor máximo es ${val.max}`;
    }

    // Mínimo seleccionados (checkbox)
    if (
      val.minSelected &&
      Array.isArray(value) &&
      value.length < val.minSelected
    ) {
      return val.minSelectedMessage || `Selecciona al menos ${val.minSelected}`;
    }

    // Coincidencia de campos (para confirmar contraseña)
    if (val.matchField && value !== formData[val.matchField]) {
      return val.matchMessage || "Los campos no coinciden";
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const currentValues = formData[name] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);

      setFormData((prev) => ({ ...prev, [name]: newValues }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasErrors = false;

    // Validar todas las preguntas
    QUESTION_SCHEMA.forEach((question) => {
      const error = validateQuestion(question, formData[question.fieldName]);
      if (error) {
        newErrors[question.fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      // Scroll al primer error
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField === "mapDrawn") {
        const element = document.querySelector("#parcel-map");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    setSubmitted(true);
  };

  // Renderizar campo según tipo
  const renderField = (question) => {
    const value = formData[question.fieldName] || "";
    const error = errors[question.fieldName];

    const inputClasses = `w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
      error
        ? "border-red-300 focus:ring-red-500"
        : "border-gray-300 focus:ring-green-500"
    }`;

    switch (question.type) {
      case "text":
      case "email":
      case "password":
        return (
          <div>
            <input
              type={question.type}
              name={question.fieldName}
              value={value}
              onChange={handleChange}
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
          <div>
            <input
              type="number"
              name={question.fieldName}
              value={value}
              onChange={handleChange}
              min={question.validations?.min}
              max={question.validations?.max}
              step={question.step || "1"}
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
          <div>
            <select
              name={question.fieldName}
              value={value}
              onChange={handleChange}
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
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    checked={(formData[question.fieldName] || []).includes(
                      opt.value,
                    )}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
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
          <div>
            <div className="space-y-3">
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
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
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
          <div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name={question.fieldName}
                value={value || question.defaultValue || 0}
                onChange={handleChange}
                min={question.validations?.min || 0}
                max={question.validations?.max || 100}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <span className="text-xl font-bold text-green-600 w-12 text-center">
                {value || question.defaultValue || 0}
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
          <div>
            <textarea
              name={question.fieldName}
              value={value}
              onChange={handleChange}
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Registro Completado!
              </h2>
              <p className="text-gray-600">
                Tus respuestas han sido guardadas exitosamente
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">
                Resumen de tus respuestas:
              </h3>
              <div className="space-y-6">
                {Object.keys(groupedQuestions).map((sectionName) => (
                  <div key={sectionName}>
                    <h4 className="font-semibold text-green-600 mb-3 pb-2 border-b border-green-200">
                      {sectionName}
                    </h4>
                    <div className="space-y-3">
                      {groupedQuestions[sectionName].map((q) => {
                        const value = formData[q.fieldName];
                        let displayValue = value;

                        if (Array.isArray(value)) {
                          displayValue = value.join(", ");
                        } else if (q.type === "select" || q.type === "radio") {
                          const option = q.options?.find(
                            (opt) => opt.value === value,
                          );
                          displayValue = option?.label || value;
                        } else if (q.type === "password") {
                          displayValue = "••••••••";
                        }

                        return (
                          <div
                            key={q.id}
                            className="grid grid-cols-1 md:grid-cols-2 gap-2"
                          >
                            <p className="text-sm text-gray-600">
                              {q.question}:
                            </p>
                            <p className="font-semibold text-gray-900">
                              {displayValue || "No respondido"}
                            </p>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({});
                  setErrors({});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Realizar Nuevo Registro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registro de Productor
            </h1>
            <p className="text-gray-600">
              Completa todos los campos del formulario para crear tu cuenta
            </p>
          </div>

          <div className="space-y-8">
            {Object.keys(groupedQuestions).map((sectionName) => (
              <div
                key={sectionName}
                className="border-2 border-gray-200 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-500">
                  {sectionName}
                </h2>
                {sectionName === "Información de Cultivos" && (
                    <div id="parcel-map">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ubicación de Parcelas
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <MapaDibujo />
                    </div>
                  )}

                <div className="space-y-6">
                  {groupedQuestions[sectionName].map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {question.question}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderField(question)}
                    </div>
                  ))}

                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Completar Registro
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({});
                  setErrors({});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 rounded-lg transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
