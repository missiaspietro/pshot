import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { GlassHeader } from "@/components/glass-header"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppSidebar />
      <SidebarInset>
        <GlassHeader />
        <div className="pt-16 pl-4">
          <div className="w-full max-w-[calc(100%-1rem)]">
            <div className="flex-1 flex flex-col gap-4 p-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  )
}
