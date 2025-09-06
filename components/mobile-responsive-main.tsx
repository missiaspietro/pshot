"use client"

import { ReactNode, useState, useEffect } from "react"
import { useMobileSidebar } from "./glass-header"

export function MobileResponsiveMain({ children }: { children: ReactNode }) {
  const mobileSidebar = useMobileSidebar()
  const { sidebarOpen } = mobileSidebar || { sidebarOpen: false, setSidebarOpen: () => {} }

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <main
      className={`transition-transform duration-300 ease w-full ${sidebarOpen && isMobile ? 'translate-x-[18rem]' : ''}`}
    >
      {children}
    </main>
  )
}
