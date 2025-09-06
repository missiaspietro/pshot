"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/surveys": "Pesquisas",
  "/promotions": "Promoções",
  "/reports": "Relatórios",
  "/birthdays": "Aniversários",
  "/robots": "Robôs",
  "/users": "Usuários",
}

export function PageHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Praise Shot"

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Opacidade baseada no scroll (0.8 a 0.4)
  const maxOpacity = 0.8
  const minOpacity = 0.4
  const opacity = Math.max(minOpacity, maxOpacity - (scrollY / 250))

  return (
    <header 
      className="fixed top-0 right-0 z-40 h-16 transition-all duration-300"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid rgba(0, 0, 0, ${opacity * 0.15})`,
        left: '16rem',
        width: 'calc(100% - 16rem)'
      }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center">
          <SidebarTrigger />
          <h1 className="ml-4 text-lg font-semibold">{title}</h1>
        </div>
      </div>
    </header>
  )
}
