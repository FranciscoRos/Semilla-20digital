import { usePreguntas } from "@/hooks/usePreguntas";
import { Check, HelpCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import SDloading from "@/assets/SDloading.svg";

const USOS_PARCELA: any = {
  agricultura: {
    label: "Agricultura",
    color: "bg-green-100 text-green-800 border-green-200",
    actividades: [
      { value: "maiz", label: "Maíz" },
      { value: "frijol", label: "Frijol" },
      { value: "sorgo", label: "Sorgo" },
      { value: "citricos", label: "Cítricos" },
      { value: "hortalizas", label: "Hortalizas" },
    ],
  },
  ganaderia: {
    label: "Ganadería",
    color: "bg-red-100 text-red-800 border-red-200",
    actividades: [
      { value: "bovino", label: "Bovinos" },
      { value: "porcino", label: "Porcinos" },
      { value: "caprino", label: "Caprinos" },
      { value: "avicola", label: "Avícola" },
    ],
  },
  pesca: {
    label: "Pesca/Acuacultura",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    actividades: [
      { value: "camaron", label: "Camarón" },
      { value: "tilapia", label: "Tilapia" },
      { value: "pesca_altura", label: "Pesca de Altura" },
    ],
  },
  apicultura: {
    label: "Apicultura",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    actividades: [
      { value: "produccion_miel", label: "Producción de Miel" },
      { value: "cria_reinas", label: "Cría de Abejas Reina" },
      { value: "meliponicultura", label: "Meliponicultura (Abeja nativa)" },
      { value: "subproductos", label: "Cera, Propóleo y Jalea Real" },
    ],
},
};

export default function ComponenteFiltrados({
  requerimientos,
  changeRequerimientos,
}) {
  const { dataPreguntas, loadingPreguntas } = usePreguntas();

  // Estados Locales
  const [parcelaRule, setParcelaRule] = useState<{
    areas: string[];
    actividades: string[];
    hectareas: {
      habilitado: boolean;
      tipo: "mayor" | "menor" | "entre";
      min: string;
      max: string;
    };
  }>({
    areas: [],
    actividades: [],
    hectareas: { habilitado: false, tipo: "mayor", min: "", max: "" },
  });

  const [preguntaRules, setPreguntaRules] = useState<any[]>([]);

  // Estados Temporales
  const [tempQuestionId, setTempQuestionId] = useState("");
  const [tempOperator, setTempOperator] = useState("igual");
  const [tempValue, setTempValue] = useState<any>("");
  const [tempValueArray, setTempValueArray] = useState<string[]>([]);

  // --- EFECTO DE CARGA INICIAL (EDICIÓN) ---
  useEffect(() => {
    if (requerimientos && requerimientos.length > 0 && dataPreguntas) {
      // A. Recuperar Parcela
      const pRule = requerimientos.find((r: any) => r.type === "regla_parcela");
      if (pRule && pRule.config) {
        setParcelaRule({
          areas: pRule.config.areas || [],
          actividades: pRule.config.actividades || [],
          hectareas: pRule.config.hectareas
            ? {
                habilitado: true,
                tipo: pRule.config.hectareas.operador,
                min: pRule.config.hectareas.min,
                max: pRule.config.hectareas.max,
              }
            : { habilitado: false, tipo: "mayor", min: "", max: "" },
        });
      }

      // B. Recuperar Preguntas
      const qRules = requerimientos
        .filter((r: any) => r.type === "regla_pregunta")
        .map((r: any) => {
          const originalQ = dataPreguntas.find(
            (q) => q.fieldName === r.fieldName,
          );
          return {
            ...r,
            id: Math.random().toString(), // ID UI
            questionLabel: originalQ
              ? originalQ.question
              : `Campo: ${r.fieldName}`,
            inputType: originalQ ? originalQ.type : "text",
          };
        });
      setPreguntaRules(qRules);
    }
  }, [requerimientos, dataPreguntas]);

  // --- FUNCIÓN HELPER PARA ENVIAR DATOS AL PADRE ---
  const notificarCambios = (
    nuevaParcelaRule: any,
    nuevasPreguntaRules: any[],
  ) => {
    // 1. Construir objeto parcela estructurado
    const parcelaReqObject = {
      type: "regla_parcela",
      config: {
        areas: nuevaParcelaRule.areas,
        actividades: nuevaParcelaRule.actividades,
        hectareas: nuevaParcelaRule.hectareas.habilitado
          ? {
              operador: nuevaParcelaRule.hectareas.tipo,
              min: Number(nuevaParcelaRule.hectareas.min) || 0,
              max: Number(nuevaParcelaRule.hectareas.max) || 0,
            }
          : null,
      },
    };

    // 2. Limpiar reglas de preguntas (quitar datos visuales)
    const preguntasLimpias = nuevasPreguntaRules.map(
      ({ id, questionLabel, inputType, ...rest }) => rest,
    );

    // 3. Enviar ARRAY al padre
    changeRequerimientos([parcelaReqObject, ...preguntasLimpias]);
  };

  // --- HANDLERS PARCELA ---

  const toggleArea = (areaKey: string) => {
    // Calculamos el nuevo estado pero NO lo seteamos directamente para enviarlo al helper
    let nuevaParcela = { ...parcelaRule };
    const exists = nuevaParcela.areas.includes(areaKey);

    if (exists) {
      nuevaParcela.areas = nuevaParcela.areas.filter((a) => a !== areaKey);
      // Limpiar actividades de esa área
      const actividadesDelArea = USOS_PARCELA[areaKey].actividades.map(
        (a: any) => a.value,
      );
      nuevaParcela.actividades = nuevaParcela.actividades.filter(
        (act) => !actividadesDelArea.includes(act),
      );
    } else {
      nuevaParcela.areas = [...nuevaParcela.areas, areaKey];
    }

    setParcelaRule(nuevaParcela);
    notificarCambios(nuevaParcela, preguntaRules);
  };

  const toggleActividad = (actValue: string) => {
    let nuevaParcela = { ...parcelaRule };
    const exists = nuevaParcela.actividades.includes(actValue);

    nuevaParcela.actividades = exists
      ? nuevaParcela.actividades.filter((a) => a !== actValue)
      : [...nuevaParcela.actividades, actValue];

    setParcelaRule(nuevaParcela);
    notificarCambios(nuevaParcela, preguntaRules);
  };

  const updateHectareas = (campo: string, valor: any) => {
    const nuevaParcela = {
      ...parcelaRule,
      hectareas: { ...parcelaRule.hectareas, [campo]: valor },
    };
    setParcelaRule(nuevaParcela);
    notificarCambios(nuevaParcela, preguntaRules);
  };

  // --- HANDLERS PREGUNTAS ---

  const handleAddPreguntaRule = () => {
    if (!tempQuestionId) return alert("Selecciona una pregunta");

    const question = dataPreguntas.find((q) => q.id === tempQuestionId);
    if (!question) return;

    let valorFinal = tempValue;
    if (
      ["checkbox", "multiselect", "radio", "select"].includes(question.type)
    ) {
      if (tempValueArray.length === 0 && !tempValue)
        return alert("Selecciona opción"); // Validación mejorada
      if (tempValueArray.length > 0) valorFinal = tempValueArray; // Prioridad array
    } else {
      if (!tempValue) return alert("Define un valor");
    }

    const nuevaRegla = {
      id: Date.now().toString(),
      type: "regla_pregunta",
      fieldName: question.fieldName,
      questionLabel: question.question,
      inputType: question.type,
      validation: {
        operator: tempOperator,
        value: valorFinal,
      },
    };

    const nuevasReglas = [...preguntaRules, nuevaRegla];
    setPreguntaRules(nuevasReglas);
    notificarCambios(parcelaRule, nuevasReglas); // Enviamos array

    // Reset temps
    setTempQuestionId("");
    setTempValue("");
    setTempValueArray([]);
  };

  const removePreguntaRule = (idx: number) => {
    const nuevasReglas = preguntaRules.filter((_, i) => i !== idx);
    setPreguntaRules(nuevasReglas);
    notificarCambios(parcelaRule, nuevasReglas);
  };

  const toggleTempValueArray = (val: string) => {
    if (tempValueArray.includes(val)) {
      setTempValueArray(tempValueArray.filter((v) => v !== val));
    } else {
      setTempValueArray([...tempValueArray, val]);
    }
  };

  const dataPreguntasFilter=()=>{
    if(!dataPreguntas)return []
    return dataPreguntas.filter(dp=>!preguntaRules.some(pr=>pr.fieldName===dp.fieldName))
  }
  return (
    <>
      {loadingPreguntas ? (
        <div className="flex items-center justify-center">
          <img src={SDloading} alt="Cargando..." width="120" height="120" />
        </div>
      ) : (
        <div>
          {/* SECCION 1: PARCELAS */}
          <div className="bg-gray-50 p-4 rounded-xl border">
            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase">
              1. Requisitos de Parcela
            </h4>

            {/* A. Selector de Areas */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Áreas permitidas:</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(USOS_PARCELA).map(([key, val]: any) => {
                  const isSelected = parcelaRule.areas.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArea(key)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition flex items-center gap-2 ${isSelected ? val.color + " ring-2 ring-offset-1 ring-green-500" : "bg-white border-gray-300 text-gray-500"}`}
                    >
                      {val.label} {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Selector de Actividades */}
            {parcelaRule.areas.length > 0 && (
              <div className="mb-4 animate-fadeIn">
                <p className="text-xs text-gray-500 mb-2">
                  Actividades específicas:
                </p>
                <div className="flex gap-2 flex-wrap bg-white p-3 rounded border">
                  {parcelaRule.areas.map((areaKey) =>
                    USOS_PARCELA[areaKey].actividades.map((act: any) => {
                      const isSelected = parcelaRule.actividades.includes(
                        act.value,
                      );
                      return (
                        <button
                          key={act.value}
                          type="button"
                          onClick={() => toggleActividad(act.value)}
                          className={`px-2 py-1 rounded text-xs border transition ${isSelected ? "bg-green-600 text-white border-green-700" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                        >
                          {act.label}
                        </button>
                      );
                    }),
                  )}
                </div>
              </div>
            )}

            {/* C. Hectáreas */}
            <div className="flex items-center gap-4 border-t pt-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={parcelaRule.hectareas.habilitado}
                  onChange={(e) =>
                    updateHectareas("habilitado", e.target.checked)
                  }
                  className="rounded text-green-600 focus:ring-green-500"
                />
                Restringir por Tamaño de Hectarea
              </label>

              {parcelaRule.hectareas.habilitado && (
                <div className="flex gap-2 items-center animate-fadeIn">
                  <select
                    className="border rounded p-1.5 text-sm"
                    value={parcelaRule.hectareas.tipo}
                    onChange={(e) => updateHectareas("tipo", e.target.value)}
                  >
                    <option value="mayor">Mayor a</option>
                    <option value="menor">Menor a</option>
                    <option value="entre">Entre</option>
                  </select>

                  <input
                    type="number"
                    className="w-20 border rounded p-1.5 text-sm"
                    placeholder="Min"
                    value={parcelaRule.hectareas.min}
                    onChange={(e) => updateHectareas("min", e.target.value)}
                  />

                  {parcelaRule.hectareas.tipo === "entre" && (
                    <>
                      <span className="text-gray-500 text-sm">y</span>
                      <input
                        type="number"
                        className="w-20 border rounded p-1.5 text-sm"
                        placeholder="Max"
                        value={parcelaRule.hectareas.max}
                        onChange={(e) => updateHectareas("max", e.target.value)}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECCION 2: PREGUNTAS */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
            <h4 className="font-bold text-sm text-blue-800 mb-3 uppercase flex items-center gap-2">
              <HelpCircle size={16} /> 2. Filtros por Censo
            </h4>

            {/* ... Aquí van tus inputs de preguntas (sin cambios mayores, solo asegúrate de usar los estados temporales correctos) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <select
                className="border rounded p-2 text-sm w-full"
                value={tempQuestionId}
                onChange={(e) => {
                  setTempQuestionId(e.target.value);
                  setTempValue("");
                  setTempValueArray([]);
                  setTempOperator("igual");
                }}
              >
                <option value="">-- Seleccionar Pregunta --</option>
                {dataPreguntasFilter().map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question.substring(0, 60)}...
                  </option>
                ))}
              </select>

              {/* Input Dinámico del Valor */}
              {tempQuestionId &&
                (() => {
                  const q = dataPreguntasFilter().find(
                    (qp) => qp.id === tempQuestionId,
                  );
                  if (!q) return null;

                  // CASO: SELECCION MULTIPLE / CHECKBOX (El admin define los permitidos)
                  if (q.type === "checkbox" || q.type === "multiselect") {
                    return (
                      <div className="col-span-1 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                        <p className="text-xs text-gray-500 mb-1">
                          Permitir si usuario tiene uno de:
                        </p>
                        {q.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 text-xs py-1"
                          >
                            <input
                              type="checkbox"
                              checked={tempValueArray.includes(opt.value)}
                              onChange={() => toggleTempValueArray(opt.value)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    );
                  }

                  // CASO: SELECT SIMPLE (El admin define el requerido)
                  if (q.options && q.options.length > 0) {
                    return (
                      <select
                        className="border rounded p-2 text-sm w-full"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                      >
                        <option value="">Valor Requerido...</option>
                        {q.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    );
                  }

                  // CASO: NUMERO
                  if (q.type === "number") {
                    return (
                      <div className="flex gap-2">
                        <select
                          className="border rounded text-sm bg-white"
                          value={tempOperator}
                          onChange={(e) => setTempOperator(e.target.value)}
                        >
                          <option value="igual">Igual a</option>
                          <option value="mayor">Mayor a</option>
                          <option value="menor">Menor a</option>
                        </select>
                        <input
                          type="number"
                          className="border rounded p-2 text-sm w-full"
                          placeholder="Valor"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                        />
                      </div>
                    );
                  }

                  return (
                    <input
                      className="border rounded p-2 text-sm w-full"
                      placeholder="Texto exacto..."
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                    />
                  );
                })()}
            </div>

            <button
              type="button"
              onClick={handleAddPreguntaRule}
              className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
            >
              + Agregar Regla de Censo
            </button>

            <div className="mt-3 space-y-2">
              {preguntaRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded border flex justify-between items-center text-sm"
                >
                  <div>
                    <span className="font-bold text-gray-700">
                      {rule.questionLabel}
                    </span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-blue-600 font-mono">
                      {Array.isArray(rule.validation.value)
                        ? `[${rule.validation.value.join(", ")}]`
                        : rule.validation.value}
                    </span>
                  </div>
                  <button type="button" onClick={() => removePreguntaRule(idx)}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
