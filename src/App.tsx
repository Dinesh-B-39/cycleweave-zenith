import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LCAProvider } from "@/context/LCAContext";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Doctor from "./pages/Doctor";
import Passport from "./pages/Passport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LCAProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/passport" element={<Passport />} />
            <Route path="/passport/:id" element={<Passport />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LCAProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
