import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import "@/styles/sidebar.css"
import "@/styles/user-info.css"
import { ToastView } from "@/components/ui/toast-view"
import { ToastContainer } from "@/components/ui/toast-notification"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileSidebarProvider } from "@/components/mobile-sidebar-provider"
import { AuthProvider } from "./providers/auth-provider"
import { Toaster } from "sonner"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gestão",
  description: "Sistema completo de gestão com Next.js e Supabase",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AuthProvider>
          <MobileSidebarProvider>
            <SidebarProvider>
              {children}
              <ToastView />
              <ToastContainer />
            </SidebarProvider>
          </MobileSidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
