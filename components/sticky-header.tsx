"use client"

import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell } from "lucide-react"

export function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Começa com opacidade máxima (0.8) e diminui até 0.4 ao rolar
  const maxOpacity = 0.8
  const minOpacity = 0.4
  // Diminui a opacidade até 200px de scroll
  const opacity = Math.max(minOpacity, maxOpacity - (scrollY / 250))

  return (
    <div className="relative">
      <div 
        className="fixed top-0 right-0 h-16 z-40 transition-all duration-300"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid rgba(0, 0, 0, ${opacity * 0.15})`,
          transition: 'background-color 0.15s ease, backdrop-filter 0.15s ease',
          left: '16rem',
          width: 'calc(100% - 16rem)'
        }}
      >
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold ml-4">Dashboard</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
        </div>
      </div>
    </div>
  )
}
