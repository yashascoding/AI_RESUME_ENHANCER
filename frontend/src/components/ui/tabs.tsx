import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
})

function Tabs({ className, defaultValue, children, ...props }: React.ComponentProps<"div"> & { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue || "")
  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-800/50 p-1 text-muted-foreground border border-zinc-800",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, value: triggerValue, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const isActive = ctx.value === triggerValue
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive && "bg-zinc-700 text-white shadow-sm",
        !isActive && "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => ctx.onValueChange(triggerValue)}
      {...props}
    />
  )
}

function TabsContent({ className, value: contentValue, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx.value !== contentValue) return null
  return (
    <div
      className={cn(
        "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-fade-in",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
