"use client"

import { useState, useRef, useEffect } from "react"
import { User, ChevronDown, LogOut, Settings, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function UserInfo() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-gray-200/50"
        aria-label="Menu do usuário"
      >
        {/* Avatar com iniciais */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md ring-2 ring-white/20 group-hover:ring-blue-500/30 transition-all duration-200 group-hover:scale-105 avatar-pulse">
          {getInitials(user.name)}
        </div>
        
        {/* Informações do usuário */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800 leading-tight">
            {user.name}
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            {user.email}
          </span>
        </div>
        
        {/* Ícone de dropdown */}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="user-dropdown absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 user-dropdown-enter">
          {/* Header do dropdown com informações completas */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-md ring-2 ring-blue-500/20">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
                {user.empresa && (
                  <p className="text-xs text-gray-400 truncate">
                    {user.empresa}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Opções do menu */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                // Aqui você pode adicionar navegação para perfil se existir
              }}
              className="user-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 text-gray-500" />
              Meu Perfil
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false)
                // Aqui você pode adicionar navegação para configurações se existir
              }}
              className="user-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              Configurações
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Botão de logout */}
          <button
            onClick={handleLogout}
            className="user-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </button>
        </div>
      )}
    </div>
  )
}