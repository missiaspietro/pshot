"use client"

import { ReactNode, useState, useEffect } from "react"
import { MobileSidebarContext } from "./glass-header"

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Sincroniza o estado com o evento da sidebar
  useEffect(() => {
    const handleMobileToggle = () => {
      setSidebarOpen(prev => !prev)
    }
    
    window.addEventListener('sidebar:mobile:toggle', handleMobileToggle)
    
    // Fecha a sidebar ao clicar fora dela
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar]')
      const isClickInside = sidebar?.contains(event.target as Node)
      
      if (!isClickInside && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    
    // Adiciona o evento de clique fora
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('sidebar:mobile:toggle', handleMobileToggle)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])
  
  return (
    <MobileSidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
      
      {/* Overlay escuro quando a sidebar está aberta em dispositivos móveis */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setSidebarOpen(false)
            const event = new CustomEvent('sidebar:mobile:toggle')
            window.dispatchEvent(event)
          }}
        />
      )}
    </MobileSidebarContext.Provider>
  )
}
