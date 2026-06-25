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
import LearningPage from "./pages/LearningPage";
import LearningArticlePage from "./pages/LearningArticlePage";
import LearningEditorPage from "./pages/LearningEditorPage";
import SubscribePage from "./pages/SubscribePage";
import ManageSubscribersPage from "./pages/ManageSubscribersPage";
import NotFound from "./pages/NotFound";
import { AdminPopupViewer } from "@/components/AdminPopupViewer";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" theme="dark" />
        <BrowserRouter>
          <AdminPopupViewer />
          <AppDownloadBanner />
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
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/new" element={<LearningEditorPage />} />
            <Route path="/learning/:slug/edit" element={<LearningEditorPage />} />
            <Route path="/learning/:slug" element={<LearningArticlePage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/admin/subscribers" element={<ManageSubscribersPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
