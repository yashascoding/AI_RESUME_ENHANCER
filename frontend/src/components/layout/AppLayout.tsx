import { Outlet } from "react-router-dom"
import { Header } from "./Header"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 lg:px-6">
        <Outlet />
      </main>
    </div>
  )
}
