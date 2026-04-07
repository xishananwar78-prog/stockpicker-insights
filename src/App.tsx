import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import IntradayPage from "./pages/IntradayPage";
import IntradayDetailPage from "./pages/IntradayDetailPage";
import IntradayReportPage from "./pages/IntradayReportPage";
import SwingPage from "./pages/SwingPage";
import SwingDetailPage from "./pages/SwingDetailPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogEditorPage from "./pages/BlogEditorPage";
import NotFound from "./pages/NotFound";
import { AdminPopupViewer } from "@/components/AdminPopupViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" theme="dark" />
        <BrowserRouter basename="/stockpicker">
          <AdminPopupViewer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminAuthPage />} />
            <Route path="/intraday" element={<IntradayPage />} />
            <Route path="/intraday/:id" element={<IntradayDetailPage />} />
            <Route path="/intraday-report" element={<IntradayReportPage />} />
            <Route path="/swing" element={<SwingPage />} />
            <Route path="/swing/:id" element={<SwingDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/new" element={<BlogEditorPage />} />
            <Route path="/blog/:slug/edit" element={<BlogEditorPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
