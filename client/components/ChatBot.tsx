import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";

export default function ChatBot() {
  const { messages, loading, preguntaChat, contextualizacion, setMessages } = useChatBot();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: userMsg,
        time: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    
    preguntaChat(contextualizacion ? contextualizacion(userMsg) : userMsg);
  };

  return (
    // CAMBIO 1: Agregamos 'pointer-events-none' al contenedor padre.
    // Esto hace que el área "vacía" alrededor del botón deje pasar los clics.
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Ventana del Chat */}
      <div
        className={`transition-all duration-300 ease-in-out transform origin-bottom-right ${
          isOpen
            // CAMBIO 2: Cuando está abierto, activamos los eventos ('pointer-events-auto')
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            // Cuando está cerrado, desactivamos eventos (ya lo tenías, pero es crucial aquí)
            : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Semilla Digital
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(134,239,172,0.8)]"></span>
              </h3>
            </div>
            <Sparkles className="w-4 h-4 text-green-200 absolute top-4 right-12 opacity-50" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {messages.length === 0 && !loading && (
               <div className="text-center text-gray-400 text-sm mt-10">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>¡Hola! Pregúntame sobre tus trámites.</p>
               </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex max-w-[85%] ${message.type === 'assistant' ? 'gap-2' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                  )}

                  <div
                    className={`relative px-4 py-3 shadow-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-green-600 to-green-500 text-white rounded-2xl rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        message.type === "user"
                          ? "text-green-100"
                          : "text-gray-400"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-600" />
                 </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-12">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-400 transition-all shadow-inner">
              <input
                type="text"
                placeholder="Escribe tu duda aquí..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                className="flex-1 bg-transparent px-3 py-1 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                  input.trim() 
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md transform hover:scale-105" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              La IA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}

        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-200 pointer-events-auto ${
            isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-r from-green-600 to-emerald-600'
        }`}
        title={isOpen ? "Cerrar asistente" : "Abrir asistente"}
      >
        
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}