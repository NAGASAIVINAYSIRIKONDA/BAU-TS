
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Chatbot } from "@/components/chatbot";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Department } from "./pages/Department";
import { TeamMembers } from "./pages/TeamMembers";
import { BAUTemplate } from "./pages/BAUTemplate";
import { BAUManagement } from "./pages/BAUManagement";
import { HRCheckIn } from "./pages/HRCheckIn";
import { Settings } from "./pages/Settings";
import { AcceptInvitation } from "./pages/AcceptInvitation";
import { ResetPassword } from "./pages/ResetPassword";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Questionnaire from "./pages/Questionnaire";
import QuestionnaireAdmin from "./pages/QuestionnaireAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry auth-related errors
        if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/department" element={<DashboardLayout><Department /></DashboardLayout>} />
            <Route path="/team-members" element={<DashboardLayout><TeamMembers /></DashboardLayout>} />
            <Route path="/bau-template" element={<DashboardLayout><BAUTemplate /></DashboardLayout>} />
            <Route path="/bau-management" element={<DashboardLayout><BAUManagement /></DashboardLayout>} />
            <Route path="/hr-checkin" element={<DashboardLayout><HRCheckIn /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/questionnaire" element={<DashboardLayout><Questionnaire /></DashboardLayout>} />
            <Route path="/questionnaire-admin" element={<DashboardLayout><QuestionnaireAdmin /></DashboardLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Chatbot />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
