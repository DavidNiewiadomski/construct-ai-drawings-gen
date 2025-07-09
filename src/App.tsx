import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Process from "./pages/Process";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<Process />} />
        </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
