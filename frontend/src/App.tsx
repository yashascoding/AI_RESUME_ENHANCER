import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { Analysis } from "@/pages/Analysis"
import { Results } from "@/pages/Results"
import { AnalysisProvider } from "@/hooks/useAnalysis"

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<Analysis />} />
            <Route path="/results" element={<Results />} />
          </Route>
        </Routes>
      </AnalysisProvider>
    </BrowserRouter>
  )
}

export default App
