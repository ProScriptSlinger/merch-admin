import type React from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar" // [^2]
import { Toaster } from "@/components/ui/toaster"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="sm:hidden" />
              {/* Add breadcrumbs or page title here if needed */}
            </div>

            {/* Botón SCANEAR QR - Arriba a la derecha */}
            <div className="flex items-center gap-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                <Link href="/dashboard/scan" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="hidden sm:inline">SCANEAR QR</span>
                  <span className="sm:hidden">SCAN</span>
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0 gap-4 overflow-auto">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
