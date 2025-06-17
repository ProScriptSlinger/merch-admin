import type React from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar" // [^2]
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies() // [^2]
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true" // [^2]

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {" "}
      {/* [^2] */}
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <SidebarTrigger className="sm:hidden" /> {/* [^2] Trigger for mobile */}
            {/* Add breadcrumbs or page title here if needed */}
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0 gap-4 overflow-auto">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
