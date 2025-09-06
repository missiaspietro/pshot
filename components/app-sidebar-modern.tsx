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
        description: "Visão geral do sistema",
        gradient: "from-blue-500 to-blue-600"
    },
    {
        title: "Pesquisas",
        url: "/dashboard/surveys",
        icon: Search,
        permission: "telaShot_pesquisas" as TelaShotPermission,
        description: "Gerenciar pesquisas",
        gradient: "from-emerald-500 to-emerald-600"
    },
    {
        title: "Promoções",
        url: "/promotions",
        icon: PercentIcon,
        permission: "telaShot_promocoes" as TelaShotPermission,
        description: "Campanhas promocionais",
        gradient: "from-orange-500 to-orange-600"
    },
    {
        title: "Relatórios",
        url: "/reports",
        icon: TrendingUp,
        permission: "telaShot_relatorios" as TelaShotPermission,
        description: "Análises e métricas",
        gradient: "from-purple-500 to-purple-600"
    },
    {
        title: "Aniversários",
        url: "/birthdays",
        icon: Cake,
        permission: "telaShot_aniversarios" as TelaShotPermission,
        description: "Datas especiais",
        gradient: "from-pink-500 to-pink-600"
    },
    {
        title: "Robôs",
        url: "/robots",
        icon: Bot,
        permission: "telaShot_bots" as TelaShotPermission,
        description: "Automações",
        gradient: "from-cyan-500 to-cyan-600"
    },
    {
        title: "Usuários",
        url: "/users",
        icon: Users,
        permission: "telaShot_usuarios" as TelaShotPermission,
        description: "Gerenciar usuários",
        gradient: "from-indigo-500 to-indigo-600"
    },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const { sidebarOpen, setSidebarOpen } = useMobileSidebar()
    const [isMobile, setIsMobile] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
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
        logout()
        router.push('/')
    }

    const isActiveRoute = (url: string) => {
        if (url === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(url)
    }

    return (
        <Sidebar
            data-sidebar
            className={`border-r-0 h-full transition-all duration-300 ease-in-out ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
                }`}
            style={{
                background: 'linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header moderno com logo */}
            <SidebarHeader className="px-6 pt-8 pb-6 border-b border-white/5">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-3 rounded-2xl border border-white/10">
                            <Logo />
                        </div>
                    </div>

                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute right-4 top-4 p-2 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                            aria-label="Fechar menu"
                        >
                            <X className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                        </button>
                    )}
                </div>
            </SidebarHeader>

            {/* Conteúdo principal com scroll customizado */}
            <SidebarContent className="flex-1 overflow-y-auto smooth-transition">
                <div className="px-4 py-6">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-white/50 text-xs font-semibold uppercase tracking-wider px-3 mb-6 flex items-center">
                            <Sparkles className="h-3 w-3 mr-2" />
                            Navegação
                        </SidebarGroupLabel>

                        <SidebarMenu className="space-y-2">
                            {menuItems.map((item, index) => {
                                if (item.permission && !hasPermission(item.permission)) {
                                    return null
                                }

                                const isActive = isActiveRoute(item.url)

                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className="group"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <SidebarMenuButton asChild>
                                            {item.permission ? (
                                                <PermissionAwareLink
                                                    href={item.url}
                                                    requiredPermission={item.permission}
                                                    className={`
                            relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group hover:transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${isActive
                                                            ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg border border-white/10 backdrop-blur-sm'
                                                            : 'text-white/70 hover:text-white hover:bg-white/8'
                                                        }
                          `}
                                                    onClick={() => isMobile && setSidebarOpen(false)}
                                                    onMouseEnter={() => setHoveredItem(item.title)}
                                                    onMouseLeave={() => setHoveredItem(null)}
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <div className={`
                              relative p-2.5 rounded-lg mr-4 transition-all duration-300
                              ${isActive
                                                                ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                                                                : 'bg-white/10 group-hover:bg-white/15'
                                                            }
                            `}>
                                                            <item.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white drop-shadow-sm' : 'text-white/80 group-hover:text-white'
                                                                }`} />
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <span className={`font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                                                                }`}>
                                                                {item.title}
                                                            </span>
                                                            <p className={`text-xs mt-0.5 transition-all duration-300 ${isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/60'
                                                                }`}>
                                                                {item.description}
                                                            </p>
                                                        </div>

                                                        <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-white opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'
                                                            }`} />
                                                    </div>

                                                    {/* Indicador de item ativo */}
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
                                                    )}

                                                    {/* Efeito hover */}
                                                    {hoveredItem === item.title && !isActive && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>
                                                    )}
                                                </PermissionAwareLink>
                                            ) : (
                                                <Link
                                                    href={item.url}
                                                    className={`
                            relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group hover:transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${isActive
                                                            ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg border border-white/10 backdrop-blur-sm'
                                                            : 'text-white/70 hover:text-white hover:bg-white/8'
                                                        }
                          `}
                                                    onClick={() => isMobile && setSidebarOpen(false)}
                                                    onMouseEnter={() => setHoveredItem(item.title)}
                                                    onMouseLeave={() => setHoveredItem(null)}
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <div className={`
                              relative p-2.5 rounded-lg mr-4 transition-all duration-300
                              ${isActive
                                                                ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                                                                : 'bg-white/10 group-hover:bg-white/15'
                                                            }
                            `}>
                                                            <item.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white drop-shadow-sm' : 'text-white/80 group-hover:text-white'
                                                                }`} />
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <span className={`font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                                                                }`}>
                                                                {item.title}
                                                            </span>
                                                            <p className={`text-xs mt-0.5 transition-all duration-300 ${isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/60'
                                                                }`}>
                                                                {item.description}
                                                            </p>
                                                        </div>

                                                        <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-white opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'
                                                            }`} />
                                                    </div>

                                                    {/* Indicador de item ativo */}
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
                                                    )}

                                                    {/* Efeito hover */}
                                                    {hoveredItem === item.title && !isActive && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>
                                                    )}
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </div>
            </SidebarContent>

            {/* Footer moderno */}
            <SidebarFooter className="px-6 py-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 bg-gradient-to-r from-slate-500/20 to-slate-600/20 hover:from-slate-500/30 hover:to-slate-600/30 text-slate-300 hover:text-slate-200 border border-slate-500/20 hover:border-slate-500/30 group hover:transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                >
                    <LogOut className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    Sair do Sistema
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}