"use client"

import { Logo } from "./logo"
import { useState, useEffect } from "react"
import {
  Home,
  Users,
  LogOut,
  Search,
  Cake,
  Bot,
  X,
  TrendingUp,
  ChevronRight,
  Sparkles
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useMobileSidebar } from "./glass-header"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { PermissionAwareLink } from "./permission-aware-link"
import { TelaShotPermission } from "@/lib/permissions-service"

// Componente personalizado para o ícone de porcentagem
const PercentIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold ${className}`}>%</span>
)

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: Home,
    description: "Visão geral do sistema"
  },
  { 
    title: "Pesquisas", 
    url: "/dashboard/surveys", 
    icon: Search, 
    permission: "telaShot_pesquisas" as TelaShotPermission,
    description: "Gerenciar pesquisas"
  },
  { 
    title: "Promoções", 
    url: "/promotions", 
    icon: PercentIcon, 
    permission: "telaShot_promocoes" as TelaShotPermission,
    description: "Campanhas promocionais"
  },
  { 
    title: "Relatórios", 
    url: "/reports", 
    icon: TrendingUp, 
    permission: "telaShot_relatorios" as TelaShotPermission,
    description: "Análises e métricas"
  },
  { 
    title: "Aniversários", 
    url: "/birthdays", 
    icon: Cake, 
    permission: "telaShot_aniversarios" as TelaShotPermission,
    description: "Datas especiais"
  },
  { 
    title: "Robôs", 
    url: "/robots", 
    icon: Bot, 
    permission: "telaShot_bots" as TelaShotPermission,
    description: "Automações"
  },
  { 
    title: "Usuários", 
    url: "/users", 
    icon: Users, 
    permission: "telaShot_usuarios" as TelaShotPermission,
    description: "Gerenciar usuários"
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useMobileSidebar()
  const [isMobile, setIsMobile] = useState(false)
  const { logout } = useAuth()
  const { hasPermission } = usePermissions()

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

  const handleLogout = () => {
    // Chama a função de logout do contexto de autenticação
    logout()
    // Redirecionar para a página de login
    router.push('/')
  }

  // Calcular a altura disponível para os itens do menu
  const menuHeight = `calc(100vh - 200px)`;

  return (
    <Sidebar 
      data-sidebar
      className={`text-white border-r border-[hsl(var(--sidebar-border))] h-full transition-transform duration-300 ease-in-out ${
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <SidebarHeader className="px-4 pt-8 pb-2">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-full flex justify-center -ml-1 mt-2">
            <Logo />
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors absolute right-4 top-4"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto" style={{ height: menuHeight, flex: '1 1 auto' }}>
        <div className="px-3">
          {/* Menu principal com os itens do projeto original */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-white/70 text-xs font-medium uppercase tracking-wider px-3 mb-3">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Se o item tem permissão definida, verifica se o usuário tem acesso
                if (item.permission && !hasPermission(item.permission)) {
                  return null
                }
                
                return (
                  <div key={item.title} className="mb-5 last:mb-0">
                    <SidebarMenuItem className="group">
                      <SidebarMenuButton asChild>
                        {item.permission ? (
                          <PermissionAwareLink
                            href={item.url}
                            requiredPermission={item.permission}
                            className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => isMobile && setSidebarOpen(false)}
                          >
                            <div className="flex items-center">
                              <div className="p-1.5 rounded-lg mr-3 bg-white/10 group-hover:bg-white/20 transition-colors">
                                <item.icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-white/90 group-hover:text-white font-medium">
                                {item.title}
                              </span>
                            </div>
                          </PermissionAwareLink>
                        ) : (
                          <Link 
                            href={item.url} 
                            className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => isMobile && setSidebarOpen(false)}
                          >
                            <div className="flex items-center">
                              <div className="p-1.5 rounded-lg mr-3 bg-white/10 group-hover:bg-white/20 transition-colors">
                                <item.icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-white/90 group-hover:text-white font-medium">
                                {item.title}
                              </span>
                            </div>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors bg-red-600/90 hover:bg-red-600 text-white hover:bg-opacity-90"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
