import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Day from "./pages/Day";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* ✅ basename ensures correct routing on GitHub Pages */}
      <BrowserRouter basename="/minhehe">
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ✅ Dynamic route: handles /day1, /day2, /day8, /day9, etc. */}
          <Route path="/day:dayNumber" element={<Day />} />
          {/* Catch-all for unknown paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
