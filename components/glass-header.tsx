"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState, useEffect, createContext, useContext } from "react"
import { NotificationPopup } from "@/components/notifications/notification-popup"
import { UserInfo } from "@/components/user-info"

// Contexto para compartilhar o estado da sidebar móvel
export const MobileSidebarContext = createContext({
  sidebarOpen: false,
  setSidebarOpen: (open: boolean) => {}
});

export const useMobileSidebar = () => useContext(MobileSidebarContext);

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/settings": "Configurações",
  "/dashboard/profile": "Perfil",
  "/dashboard/analytics": "Análise",
  "/surveys": "Pesquisas",
  "/(dashboard)/surveys": "Pesquisas",
  "/promotions": "Promoções",
  "/reports": "Relatórios",
  "/birthdays": "Aniversários",
  "/robots": "Robôs",
  "/users": "Usuários",
}

export function GlassHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Praise Shot"
  const [isMobile, setIsMobile] = useState(false)
  const mobileSidebar = useMobileSidebar()
  const { sidebarOpen, setSidebarOpen } = mobileSidebar || { sidebarOpen: false, setSidebarOpen: () => {} }
  
  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])
  
  // Função para abrir a sidebar em dispositivos móveis
  const toggleMobileSidebar = () => {
    const event = new CustomEvent('sidebar:mobile:toggle')
    window.dispatchEvent(event)
  }
  
  // Cores fixas para o tema claro
  const bgColor = 'rgba(255, 255, 255, 0.8)'
  const borderColor = 'rgba(0, 0, 0, 0.12)'
  
  return (
    <header 
      className="fixed top-0 right-0 z-40 h-16 transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${borderColor}`,
        left: isMobile ? '0' : '16rem',
        width: isMobile ? '100%' : 'calc(100% - 16rem)',
        transform: isMobile && sidebarOpen ? 'translateX(18rem)' : 'translateX(0)',
        transitionProperty: 'transform, left, width',
        transitionDuration: '300ms',
        transitionTimingFunction: 'ease'
      }}
    >
      <div className="flex h-full items-center justify-between px-6" data-component-name="GlassHeader">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={toggleMobileSidebar}
              className="mr-3 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5 text-gray-800" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationPopup />
          <div className="w-px h-6 bg-gray-300/50"></div>
          <UserInfo />
        </div>
      </div>
    </header>
  )
}
