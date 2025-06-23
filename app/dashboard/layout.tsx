'use client'

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { UserDropdown } from "@/components/auth/UserDropdown"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('dashboard layout ------->')
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-muted/40">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="sm:hidden" />
                {/* Add breadcrumbs or page title here if needed */}
              </div>

              <div className="flex items-center gap-2">
                {/* Botón SCANEAR QR */}
                <UserDropdown />
              </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 gap-4 overflow-auto">{children}</main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ProtectedRoute>
  )
}
