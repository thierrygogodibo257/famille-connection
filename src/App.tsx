import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard";
import Members from "./pages/dashboard/Members";
import Profile from "./pages/dashboard/Profile";
import AddMember from "./pages/dashboard/AddMember";
import Admin from "./pages/dashboard/Admin";
import { FamilyTree } from "@/components/family/FamilyTree";
import FamilyAuth from "./pages/FamilyAuth";
import NotFound from "./pages/NotFound";
import { ROUTES } from "@/lib/constants/routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><Index /></Layout>} />
                    <Route path="/family-auth" element={<FamilyAuth />} />
                    <Route path="/auth/*" element={<FamilyAuth />} />
                    <Route path="/auth/login" element={<FamilyAuth />} />
                    <Route path="/auth/register" element={<FamilyAuth />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard/*" element={
                      <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/members" element={
                      <ProtectedRoute>
                        <Layout><Members /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/profile" element={
                      <ProtectedRoute>
                        <Layout><Profile /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/invite" element={
                      <ProtectedRoute>
                        <Layout><AddMember /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/admin" element={
                      <ProtectedRoute>
                        <Layout><Admin /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/tree" element={
                      <ProtectedRoute>
                        <Layout><FamilyTree /></Layout>
                      </ProtectedRoute>
                    } />

                    {/* 404 Route */}
                    <Route path="*" element={<Layout><NotFound /></Layout>} />
                  </Routes>
                </main>
              </div>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Suspense>
  );
}

export default App;
