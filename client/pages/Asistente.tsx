import { ChevronLeft, Send, Bot, Sparkles, User, HelpCircle, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useChatBot } from "@/hooks/useChatBot"; 

const suggestedTopics = [
  { icon: "🌱", label: "Apoyo fertilizantes", text: "Quiero saber sobre el apoyo de fertilizantes" },
  { icon: "🌽", label: "Semillas de maíz", text: "Información sobre semillas de maíz" },
  { icon: "📝", label: "Actualizar perfil", text: "¿Cómo actualizo mi perfil de productor?" },
  { icon: "🔍", label: "Estatus de solicitud", text: "Consultar el estatus de mi solicitud" },
];

export default function Asistente() {
  const navigate = useNavigate();
  const { messages, loading, preguntaChat, contextualizacion, setMessages } = useChatBot();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al fondo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Ajustar altura del textarea dinámicamente
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Optimistic Update
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: text,
        time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setInputValue("");
    // Reset height
    if (inputRef.current) inputRef.current.style.height = "auto";
    
    await preguntaChat(contextualizacion(text));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            title="Regresar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                <Bot className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">Semilla AI</h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">Asistente Virtual Inteligente</p>
             </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
            <Sparkles className="w-3 h-3" />
            <span>Siempre disponible</span>
        </div>
      </header>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto relative w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pb-32 pt-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100">
                        <Bot className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
                        ¿En qué puedo ayudarte hoy?
                    </h2>
                    <p className="text-slate-500 text-center max-w-lg mb-12 text-lg">
                        Soy tu asistente de Semilla Digital. Puedo ayudarte con trámites, cultivos, clima y más.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                        {suggestedTopics.map((topic, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(topic.text)}
                                className="group flex items-start gap-4 p-5 bg-white hover:bg-green-50/50 border border-slate-200 hover:border-green-200 rounded-2xl text-left transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <span className="text-2xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                                    {topic.icon}
                                </span>
                                <div>
                                    <span className="block font-bold text-slate-700 group-hover:text-green-700 mb-1">
                                        {topic.label}
                                    </span>
                                    <span className="text-sm text-slate-400 group-hover:text-slate-500">
                                        Clic para preguntar
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* MENSAJES */}
            <div className="space-y-8">
                {messages.map((msg, index) => (
                    <div 
                        key={msg.id || index} 
                        className={`flex gap-4 md:gap-6 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        {/* Avatar Bot */}
                        {msg.type === 'assistant' && (
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                <Bot className="w-5 h-5 text-green-600" />
                            </div>
                        )}

                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`
                                px-6 py-4 rounded-3xl text-[15px] md:text-base leading-relaxed shadow-sm
                                ${msg.type === 'user' 
                                    ? 'bg-slate-900 text-white rounded-tr-md' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md'
                                }
                            `}>
                                {msg.text}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2 px-2 font-medium">
                                {msg.type === 'user' ? 'Tú' : 'Semilla AI'} • {msg.time}
                            </span>
                        </div>

                        {/* Avatar User */}
                        {msg.type === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-5 h-5 text-slate-500" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex gap-4 md:gap-6 justify-start animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="bg-white border border-slate-200 px-6 py-4 rounded-3xl rounded-tl-md shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-10 pb-6 px-4 md:px-8 z-10">
        <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-200 pl-6 pr-3 py-3 flex items-end gap-3 transition-all focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500">
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-3 max-h-32 resize-none scrollbar-hide text-base md:text-lg"
                    disabled={loading}
                />
                
                <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || loading}
                    className={`
                        p-3.5 rounded-full flex items-center justify-center transition-all duration-200
                        ${inputValue.trim() && !loading
                            ? 'bg-slate-900 text-white hover:bg-green-600 hover:scale-105 shadow-md' 
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                    `}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowUp className="w-6 h-6" />
                    )}
                </button>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                La IA puede cometer errores. Verifica la información importante.
            </p>
        </div>
      </div>

    </div>
  );
}