import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Day from "./pages/Day"; // 👈 dynamic loader for puzzles
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter basename="/minhehe">
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ✅ Handles /day2, /day3, ..., /day99 automatically */}
          <Route path="day/:dayNumber" element={<Day />} />
          {/* ✅ Catch-all for anything else */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
