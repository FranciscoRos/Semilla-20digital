import { ChevronLeft, Send, Bot, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useChatBot } from "@/hooks/useChatBot"; 

const suggestedTopics = [
  "Apoyo fertilizantes",
  "Semillas de maíz",
  "Actualizar perfil",
  "Estatus de solicitud",
];

export default function Asistente() {
  const navigate = useNavigate();

  const { messages, loading, preguntaChat, contextualizacion, setMessages } = useChatBot();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Manejador de envío
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: text,
        time: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInputValue("");
    
    await preguntaChat(contextualizacion(text));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar simplificado integrado */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="Regresar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Asistente Virtual
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide">
              Beta
            </span>
          </h1>
          <p className="text-xs text-gray-500">Soporte oficial Semilla Digital</p>
        </div>
      </div>

      {/* Contenedor Principal Centrado */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Área del Chat */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex-1 flex flex-col overflow-hidden relative">
          
          {/* Header Decorativo Interno */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                   <Bot className="w-6 h-6" />
                </div>
                <div>
                   <p className="font-semibold text-sm">Semilla AI</p>
                   <p className="text-[10px] opacity-80 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                     En línea
                   </p>
                </div>
             </div>
             <Sparkles className="w-5 h-5 text-green-200 opacity-50" />
          </div>

          {/* Lista de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
            
            {/* Mensaje vacío (opcional) */}
            {messages.length === 0 && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <Bot className="w-16 h-16 mb-4" />
                  <p>Inicia una conversación...</p>
               </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex max-w-[85%] md:max-w-[75%] ${message.type === 'assistant' ? 'gap-3' : 'gap-2'}`}>
                  
                  {/* Avatar Assistant */}
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-green-100 shadow-sm flex items-center justify-center flex-shrink-0 self-start">
                      <Bot className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div
                        className={`px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed ${
                        message.type === "user"
                            ? "bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl rounded-tr-none"
                            : "bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-none"
                        }`}
                    >
                        {message.text}
                    </div>
                    <span className={`text-[10px] mt-1 ${message.type === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                        {message.time}
                    </span>
                  </div>

                  {/* Avatar User (Opcional, se ve bien solo con la burbuja) */}
                  {message.type === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 self-start overflow-hidden">
                        <User className="w-4 h-4 text-gray-500" />
                     </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Skeleton */}
            {loading && (
              <div className="flex justify-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-green-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-600" />
                 </div>
                 <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm h-12 flex items-center gap-2 w-24">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de Input y Sugerencias */}
          <div className="bg-white border-t border-gray-100 p-4 md:p-6">
            
            {/* Sugerencias (Solo si no está cargando) */}
            {!loading && messages.length < 3 && (
                <div className="mb-4 flex flex-wrap gap-2 animate-fade-in-up">
                {suggestedTopics.map((topic) => (
                    <button
                    key={topic}
                    onClick={() => handleSendMessage(topic)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors cursor-pointer"
                    >
                    {topic}
                    </button>
                ))}
                </div>
            )}

            {/* Barra de escritura */}
            <div className="flex gap-3 items-end bg-gray-50 p-2 rounded-3xl border border-gray-200 focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-400 transition-all">
              <textarea
                placeholder="Escribe tu pregunta detalladamente..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(inputValue);
                    }
                }}
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-sm text-gray-700 resize-none max-h-32 min-h-[44px] scrollbar-hide"
                rows={1}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={loading || !inputValue.trim()}
                className={`p-3 rounded-full mb-1 transition-all ${
                    inputValue.trim()
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-3">
                • Semilla Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}