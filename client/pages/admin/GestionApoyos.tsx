import React, { useEffect, useState, useMemo } from "react";
import {Plus, Edit2, Trash2, X, AlertCircle, Save, HelpCircle, Box, Check } from "lucide-react";
import {
  Apoyo,
  ApoyoPayload,
  getApoyos,
  createApoyo,
  updateApoyo,
  deleteApoyo,
} from "@/services/ApoyoService";
import { usePreguntas } from "@/hooks/usePreguntas";
import SDloading from '@/assets/SDloading.svg'

// --- 1. DATOS ESTÁTICOS (CONSTANTES) ---
// Estos datos no aparecen en el formulario pero se envían siempre al backend
const CONSTANTES_INSTITUCION = {
  institucion_encargada: "Secretaría de Desarrollo Agropecuario Agriculturo, Rural y Pesca",
  institucion_acronimo: "SEDARPE",
  direccion: "Av. Belice #201 entre San Salvador y Venustiano Carranza. Colonia Centro, C.P. 77000., Chetumal, Mexico",
  horarios_atencion: "L-V 9:00 a 15:00",
  telefono_contacto: "983 835 1630",
  correo_contacto: "No Definido",
  redes_sociales: "https://www.facebook.com/desarrolloagropecuarioqroo",
  latitud_institucion: 18.5069468,
  longitud_institucion: -88.2960919,
};
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
    color: "bg-amber-100 text-amber-800 border-amber-200",
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
};

export default function GestionApoyos() {
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const { dataPreguntas, loadingPreguntas } = usePreguntas();
  const [loadingApoyos, setLoadingApoyos]=useState(false)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Datos básicos
  const [formData, setFormData] = useState({
    nombre_programa: "",
    descripcion: "",
    objetivo: "",
    tipo_objetivo: "",
    fechaInicio: "",
    fechaFin: "",
  });

  // --- ESTADO DEL GENERADOR DE REGLAS ---
  
  // 1. Estado para REGLAS DE PARCELA (Objeto único complejo)
  const [parcelaRule, setParcelaRule] = useState<{
    areas: string[]; // ['agricultura', 'ganaderia']
    actividades: string[]; // ['maiz', 'bovino']
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

  // 2. Estado para REGLAS DE PREGUNTAS (Array de objetos)
  const [preguntaRules, setPreguntaRules] = useState<any[]>([]);

  // Temporales para crear nueva regla de pregunta
  const [tempQuestionId, setTempQuestionId] = useState("");
  const [tempOperator, setTempOperator] = useState("igual");
  const [tempValue, setTempValue] = useState<any>(""); // Puede ser array si es multiselect
  const [tempValueArray, setTempValueArray] = useState<string[]>([]); // Para checkboxes/multi

  useEffect(() => { loadApoyos(); }, []);

  const loadApoyos = async () => {
    setLoadingApoyos(true)
    try {
      const data = await getApoyos();
      setApoyos(data);
    } catch (e) { console.error(e); 

    }finally{
      setLoadingApoyos(false)
    }
  };


  const toggleArea = (areaKey: string) => {
    setParcelaRule((prev) => {
      const exists = prev.areas.includes(areaKey);
      let newAreas = exists
        ? prev.areas.filter((a) => a !== areaKey)
        : [...prev.areas, areaKey];
      
      // Limpiar actividades si se quita el área
      let newActividades = [...prev.actividades];
      if (exists) {
        // Si quitamos 'agricultura', quitamos todas sus actividades seleccionadas
        const actividadesDelArea = USOS_PARCELA[areaKey].actividades.map((a:any) => a.value);
        newActividades = newActividades.filter(act => !actividadesDelArea.includes(act));
      }

      return { ...prev, areas: newAreas, actividades: newActividades };
    });
  };

  const toggleActividad = (actValue: string) => {
    setParcelaRule((prev) => {
      const exists = prev.actividades.includes(actValue);
      return {
        ...prev,
        actividades: exists
          ? prev.actividades.filter((a) => a !== actValue)
          : [...prev.actividades, actValue],
      };
    });
  };

  // --- HANDLERS PREGUNTAS ---

  const handleAddPreguntaRule = () => {
    if (!tempQuestionId) return alert("Selecciona una pregunta");
    
    const question = dataPreguntas.find((q) => q.id === tempQuestionId);
    if (!question) return;

    let valorFinal = tempValue;
    // Si es multiselect, usamos el array acumulado
    if (question.type === 'checkbox' || question.type === 'multiselect' ||question.type === 'radio' || question.type === 'select') {
        if (tempValueArray.length === 0) return alert("Selecciona al menos una opción");
        valorFinal = tempValueArray;
    } else {
        if (!tempValue) return alert("Define un valor");
    }

    const nuevaRegla = {
      id: Date.now().toString(), // ID temporal UI
      type: "regla_pregunta",
      fieldName: question.fieldName, // CLAVE PARA EL FRONTEND DEL USUARIO
      questionLabel: question.question, // Solo visual para admin
      inputType: question.type,
      validation: {
        operator: tempOperator, // 'igual', 'contiene', 'mayor', etc.
        value: valorFinal
      }
    };

    setPreguntaRules([...preguntaRules, nuevaRegla]);
    // Reset temps
    setTempQuestionId("");
    setTempValue("");
    setTempValueArray([]);
  };

  const toggleTempValueArray = (val: string) => {
      if (tempValueArray.includes(val)) {
          setTempValueArray(tempValueArray.filter(v => v !== val));
      } else {
          setTempValueArray([...tempValueArray, val]);
      }
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Construir el objeto Parcelas limpio
    const parcelaReq = {
        type: "regla_parcela",
        config: {
            areas: parcelaRule.areas, // ['agricultura', ...]
            actividades: parcelaRule.actividades, // ['maiz', ...]
            // Solo enviar hectareas si está habilitado
            hectareas: parcelaRule.hectareas.habilitado ? {
                operador: parcelaRule.hectareas.tipo,
                min: Number(parcelaRule.hectareas.min) || 0,
                max: Number(parcelaRule.hectareas.max) || 0
            } : null
        }
    };

    // 2. Unificar todo en un solo array de Requerimientos
    // Si no se seleccionó ninguna área, asumimos que no hay restricción de parcela (opcional)
    const requerimientosFinales = [
        parcelaReq, 
        ...preguntaRules.map(({ id, questionLabel, inputType, ...rest }) => rest) // Limpiamos datos visuales
    ];

    const payload: ApoyoPayload = {
      ...formData,
      ...CONSTANTES_INSTITUCION,
      Requerimientos: requerimientosFinales,
      Beneficiados: [],
    };

    try {
      if (editingId) await updateApoyo(editingId, payload);
      else await createApoyo(payload);
      
      await loadApoyos();
      setShowForm(false);
      resetInternalForm();
    } catch (error) { console.error(error); }
  };

  const resetInternalForm = () => {
      setFormData({ nombre_programa: "", descripcion: "", objetivo: "", tipo_objetivo: "", fechaInicio: "", fechaFin: "" });
      setParcelaRule({ areas: [], actividades: [], hectareas: { habilitado: false, tipo: "mayor", min: "", max: "" } });
      setPreguntaRules([]);
      setEditingId(null);
  };

  // Cargar datos en edición
  const handleEdit = (apoyo: Apoyo) => {
      setEditingId(apoyo.id);
      setFormData({
          nombre_programa: apoyo.nombre_programa,
          descripcion: apoyo.descripcion,
          objetivo: apoyo.objetivo,
          tipo_objetivo: apoyo.tipo_objetivo,
          fechaInicio: apoyo.fechaInicio,
          fechaFin: apoyo.fechaFin,
      });

      // Reconstruir estado desde el JSON guardado
      if (apoyo.Requerimientos) {
          const pRule = apoyo.Requerimientos.find((r:any) => r.type === "regla_parcela");
          if (pRule && pRule.config) {
              setParcelaRule({
                  areas: pRule.config.areas || [],
                  actividades: pRule.config.actividades || [],
                  hectareas: pRule.config.hectareas ? { ...pRule.config.hectareas, habilitado: true, tipo: pRule.config.hectareas.operador } : { habilitado: false, tipo: "mayor", min: "", max: "" }
              });
          }
          
          const qRules = apoyo.Requerimientos
             .filter((r:any) => r.type === "regla_pregunta")
             .map((r:any) => ({
                 ...r, 
                 id: Math.random().toString(),
                 questionLabel: `Campo: ${r.fieldName}` // Recuperación básica visual
             }));
          setPreguntaRules(qRules);
      }
      setShowForm(true);
  };

 function compoentepootagregaraquilareedireccionaquitienestulogica(id:string){
  console.log(id)
 }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Apoyos</h1>
        <button onClick={() => { setShowForm(!showForm); resetInternalForm(); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-green-700">
           <Plus size={20} /> {showForm ? "Cancelar" : "Nuevo Programa"}
        </button>
      </div>

      {showForm && loadingPreguntas && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between">
                <h2 className="text-xl font-bold">{editingId ? "Editar" : "Nuevo"} Programa</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- IZQUIERDA: DATOS GENERALES (4 columnas) --- */}
                <div className="lg:col-span-4 space-y-4 border-r pr-6">
                    <h3 className="font-bold text-gray-400 uppercase text-xs">Datos Generales</h3>
                    <input required placeholder="Nombre del Programa" className="w-full border rounded p-2" value={formData.nombre_programa} onChange={e => setFormData({...formData, nombre_programa: e.target.value})} />
                    <textarea required placeholder="Descripción pública" rows={4} className="w-full border rounded p-2" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                    <input required placeholder="Tipo (Económico, Especie...)" className="w-full border rounded p-2" value={formData.tipo_objetivo} onChange={e => setFormData({...formData, tipo_objetivo: e.target.value})} />
                    <input required placeholder="Objetivo corto" className="w-full border rounded p-2" value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">Inicio</label><input type="date" required className="w-full border rounded p-2" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} /></div>
                        <div><label className="text-xs">Fin</label><input type="date" required className="w-full border rounded p-2" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} /></div>
                    </div>
                </div>

                {/* --- DERECHA: CONSTRUCTOR DE REGLAS (8 columnas) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Box className="text-green-600" />
                        <h3 className="font-bold text-lg text-gray-800">Reglas de Filtrado de Productores</h3>
                    </div>

                    {/* SECCION 1: PARCELAS (Objeto Único) */}
                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase">1. Requisitos de Parcela</h4>
                        
                        {/* A. Selector de Areas */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Áreas permitidas (Selección múltiple):</p>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(USOS_PARCELA).map(([key, val]: any) => {
                                    const isSelected = parcelaRule.areas.includes(key);
                                    return (
                                        <button
                                            key={key} type="button"
                                            onClick={() => toggleArea(key)}
                                            className={`px-3 py-1.5 rounded-full border text-sm transition flex items-center gap-2 ${isSelected ? val.color + ' ring-2 ring-offset-1 ring-green-500' : 'bg-white border-gray-300 text-gray-500'}`}
                                        >
                                            {val.label} {isSelected && <Check size={14}/>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* B. Selector de Actividades (Dependiente) */}
                        {parcelaRule.areas.length > 0 && (
                            <div className="mb-4 animate-fadeIn">
                                <p className="text-xs text-gray-500 mb-2">Actividades específicas (Opcional - Si se deja vacío, aplica a toda el área):</p>
                                <div className="flex gap-2 flex-wrap bg-white p-3 rounded border">
                                    {parcelaRule.areas.map(areaKey => (
                                        USOS_PARCELA[areaKey].actividades.map((act: any) => {
                                            const isSelected = parcelaRule.actividades.includes(act.value);
                                            return (
                                                <button
                                                    key={act.value} type="button"
                                                    onClick={() => toggleActividad(act.value)}
                                                    className={`px-2 py-1 rounded text-xs border transition ${isSelected ? 'bg-green-600 text-white border-green-700' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                                >
                                                    {act.label}
                                                </button>
                                            )
                                        })
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* C. Hectáreas */}
                        <div className="flex items-center gap-4 border-t pt-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <input 
                                    type="checkbox" 
                                    checked={parcelaRule.hectareas.habilitado}
                                    onChange={e => setParcelaRule({...parcelaRule, hectareas: {...parcelaRule.hectareas, habilitado: e.target.checked}})}
                                    className="rounded text-green-600 focus:ring-green-500"
                                />
                                Restringir por Tamaño (Ha)
                            </label>

                            {parcelaRule.hectareas.habilitado && (
                                <div className="flex gap-2 items-center animate-fadeIn">
                                    <select 
                                        className="border rounded p-1.5 text-sm"
                                        value={parcelaRule.hectareas.tipo}
                                        onChange={e => setParcelaRule({...parcelaRule, hectareas: {...parcelaRule.hectareas, tipo: e.target.value as any}})}
                                    >
                                        <option value="mayor">Mayor a</option>
                                        <option value="menor">Menor a</option>
                                        <option value="entre">Entre</option>
                                    </select>
                                    
                                    <input 
                                        type="number" className="w-20 border rounded p-1.5 text-sm" placeholder="Valor"
                                        value={parcelaRule.hectareas.min}
                                        onChange={e => setParcelaRule({...parcelaRule, hectareas: {...parcelaRule.hectareas, min: e.target.value}})}
                                    />
                                    
                                    {parcelaRule.hectareas.tipo === "entre" && (
                                        <>
                                            <span className="text-gray-500 text-sm">y</span>
                                            <input 
                                                type="number" className="w-20 border rounded p-1.5 text-sm" placeholder="Max"
                                                value={parcelaRule.hectareas.max}
                                                onChange={e => setParcelaRule({...parcelaRule, hectareas: {...parcelaRule.hectareas, max: e.target.value}})}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCION 2: PREGUNTAS DINAMICAS (Array) */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-sm text-blue-800 mb-3 uppercase flex items-center gap-2">
                             <HelpCircle size={16}/> 2. Filtros por Censo (Perfil Usuario)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {/* Selector de Pregunta */}
                            <select 
                                className="border rounded p-2 text-sm w-full"
                                value={tempQuestionId}
                                onChange={e => {
                                    setTempQuestionId(e.target.value);
                                    setTempValue(""); 
                                    setTempValueArray([]);
                                    setTempOperator("igual");
                                }}
                            >
                                <option value="">-- Seleccionar Pregunta --</option>
                                {dataPreguntas.map(q => (
                                    <option key={q.id} value={q.id}>{q.question.substring(0, 60)}...</option>
                                ))}
                            </select>

                            {/* Input Dinámico del Valor */}
                            {tempQuestionId && (() => {
                                const q = dataPreguntas.find(qp => qp.id === tempQuestionId);
                                if (!q) return null;

                                // CASO: SELECCION MULTIPLE / CHECKBOX (El admin define los permitidos)
                                if (q.type === 'checkbox' || q.type === 'multiselect') {
                                    return (
                                        <div className="col-span-1 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                                            <p className="text-xs text-gray-500 mb-1">Permitir si usuario tiene uno de:</p>
                                            {q.options?.map(opt => (
                                                <label key={opt.value} className="flex items-center gap-2 text-xs py-1">
                                                    <input 
                                                        type="checkbox"
                                                        checked={tempValueArray.includes(opt.value)}
                                                        onChange={() => toggleTempValueArray(opt.value)}
                                                    />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    )
                                }

                                // CASO: SELECT SIMPLE (El admin define el requerido)
                                if (q.options && q.options.length > 0) {
                                    return (
                                        <select 
                                            className="border rounded p-2 text-sm w-full"
                                            value={tempValue}
                                            onChange={e => setTempValue(e.target.value)}
                                        >
                                            <option value="">Valor Requerido...</option>
                                            {q.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    )
                                }

                                // CASO: NUMERO
                                if (q.type === 'number') {
                                    return (
                                        <div className="flex gap-2">
                                            <select className="border rounded text-sm bg-white" value={tempOperator} onChange={e => setTempOperator(e.target.value)}>
                                                <option value="igual">Igual a</option>
                                                <option value="mayor">Mayor a</option>
                                                <option value="menor">Menor a</option>
                                            </select>
                                            <input type="number" className="border rounded p-2 text-sm w-full" placeholder="Valor" value={tempValue} onChange={e => setTempValue(e.target.value)}/>
                                        </div>
                                    )
                                }

                                return <input className="border rounded p-2 text-sm w-full" placeholder="Texto exacto..." value={tempValue} onChange={e => setTempValue(e.target.value)}/>
                            })()}
                        </div>
                        
                        <button type="button" onClick={handleAddPreguntaRule} className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full md:w-auto">
                            + Agregar Regla de Censo
                        </button>

                        {/* Lista de reglas de pregunta agregadas */}
                        <div className="mt-3 space-y-2">
                            {preguntaRules.map((rule, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-bold text-gray-700">{rule.questionLabel}</span>
                                        <span className="mx-2 text-gray-400">→</span>
                                        <span className="text-blue-600 font-mono">
                                            {rule.validation.operator === 'igual' ? '' : rule.validation.operator + ' '} 
                                            {Array.isArray(rule.validation.value) ? `[${rule.validation.value.join(', ')}]` : rule.validation.value}
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-mono">fieldName: {rule.fieldName}</p>
                                    </div>
                                    <button type="button" onClick={() => setPreguntaRules(preguntaRules.filter((_, i) => i !== idx))}><Trash2 size={14} className="text-red-400"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex items-center gap-2"><Save size={18}/> Guardar Apoyo</button>
                    </div>
                </div>
            </div>
        </form>
      )}
      

      {loadingApoyos ? (
        <div className="flex flex-col items-center justify-center mt-10">
            <img src={SDloading} alt="Cargando..." width="100" height="100" />
            <span className="ml-4 text-gray-500">Cargando apoyos...</span>
            </div>
      ) : apoyos.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No hay apoyos registrados.</div>
      ) : (
      <div className="grid grid-cols-1 gap-4">
        {apoyos.map(a => (
            <div key={a.id} className="bg-white p-4 border rounded shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{a.nombre_programa}</h3>
                    <p className="text-xs text-gray-500">{a.Requerimientos?.length || 0} Reglas configuradas</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => compoentepootagregaraquilareedireccionaquitienestulogica(a.id)} className="text-white bg-green-600 px-4 py-2 rounded text-xs">Ver Usuarios Inscritos</button>
                    <button onClick={() => handleEdit(a)} className="text-blue-600 bg-blue-50 px-3 py-1 rounded text-xs" disabled={loadingPreguntas}>Editar</button>
                    <button onClick={() => deleteApoyo(a.id).then(loadApoyos)} className="text-red-600 bg-red-50 px-3 py-1 rounded text-xs">Eliminar</button>
                </div>
            </div>
        ))}
      </div>
      )}
    </div>
  );
}