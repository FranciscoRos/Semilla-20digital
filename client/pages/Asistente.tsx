import { ChevronLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    text: "¡Hola! Soy tu asistente virtual. Puedo ayudarte con preguntas sobre programas de apoyo, trámites o cualquier duda que tengas sobre tu perfil.",
    time: "09:29 a.m.",
  },
];

const suggestedTopics = [
  "Apoyo fertilizantes",
  "Semillas de maíz",
  "Actualizar perfil",
];

export default function Asistente() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue,
      time: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newUserMessage]);

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        "Entiendo tu pregunta. El programa de apoyo para semillas de maíz está vigente hasta diciembre de 2024.",
        "Puedo ayudarte con eso. ¿Tienes menos de 5 hectáreas y estás ubicado en la zona sur?",
        "Excelente pregunta. Te recomendaría revisar los requisitos específicos en la sección de Apoyos.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: randomResponse,
        time: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    }, 800);

    setInputValue("");
  };

  return (
    <div>
        {/* Header with back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Asistente Semilla Digital
        </h1>
        <p className="text-gray-600 mb-6">Chatbot de soporte disponible 24/7</p>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 max-h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg ${
                    message.type === "user"
                      ? "bg-green-500 text-white rounded-3xl rounded-tr-md"
                      : "bg-gray-100 text-gray-900 rounded-3xl rounded-tl-md"
                  } px-4 py-3`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === "user"
                        ? "text-green-100"
                        : "text-gray-600"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Escribe tu pregunta aquí..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gray-400 hover:bg-gray-500 text-white rounded-full p-3 transition flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Topics */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Preguntas sugeridas:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setInputValue(topic);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-full text-sm font-medium transition"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
}
