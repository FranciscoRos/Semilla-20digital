import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import {AppRoutes} from "./routes/appRouter";
import { AuthProvider } from "./providers/authProvider";

// Global
import ChatBot from "./components/ChatBot";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // <--- frescura
      gcTime: 1000 * 60 * 5, // El gcTime suele ser mayor al staleTime      
      retry: 2,                  // número de reintentos
      retryDelay: 1000,          // 1 segundo entre intentos
      refetchOnReconnect: "always", // siempre que vuelva Internet
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>

          {/* Global ChatBot */}
          <ChatBot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
