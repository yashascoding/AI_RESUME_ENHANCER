import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FileSearch,
  BarChart3,
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "New Analysis", icon: FileSearch },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-200",
          scrolled
            ? "bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50"
            : "bg-transparent"
        )}
      >
        <div className="flex h-14 items-center px-4 lg:px-6 max-w-7xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-zinc-900" />
            </div>
            <span className="text-white">AI Resume Enhancer</span>
          </Link>

          <nav className="ml-8 hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "text-white bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mr-2">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              LangGraph Powered
            </div>

            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800/50 text-sm">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300 font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-zinc-500 hover:text-zinc-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </>
            )}
          </div>

          <button
            className="ml-auto md:hidden p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-[#0f0f12] border-l border-zinc-800 p-4 pt-16 animate-slide-in">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                    isActive
                      ? "text-white bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            {user && (
              <div className="border-t border-zinc-800 mt-4 pt-4">
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors w-full cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
