import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/hooks/useAuth"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute"
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { Dashboard } from "@/pages/Dashboard"
import { Analysis } from "@/pages/Analysis"
import { Results } from "@/pages/Results"
import { AnalysisProvider } from "@/hooks/useAnalysis"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnalysisProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />

            {/* Guest-only routes (redirect to dashboard if logged in) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes (redirect to login if not logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<Analysis />} />
                <Route path="/results" element={<Results />} />
              </Route>
            </Route>
          </Routes>
        </AnalysisProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
