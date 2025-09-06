'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from './protected-route'
import { Loader2 } from 'lucide-react'
import { TelaShotPermission, PERMISSION_LABELS } from '@/lib/permissions-service'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionDenied } from './permission-denied'

interface ProtectedRouteWithPermissionProps {
  children: ReactNode
  requiredPermission: TelaShotPermission
  fallbackComponent?: ReactNode
  redirectTo?: string
}

export function ProtectedRouteWithPermission({
  children,
  requiredPermission,
  fallbackComponent,
  redirectTo = '/dashboard'
}: ProtectedRouteWithPermissionProps) {
  const { user, isLoading } = useAuth()
  const { permissions, isLoading: permissionsLoading, hasPermission } = usePermissions()
  const router = useRouter()

  const featureName = PERMISSION_LABELS[requiredPermission]
  const userHasPermission = hasPermission(requiredPermission)

  useEffect(() => {
    // Se o usuário não tem permissão e foi especificado um redirect
    if (!permissionsLoading && !userHasPermission && redirectTo && redirectTo !== window.location.pathname) {
      router.push(redirectTo)
    }
  }, [permissionsLoading, userHasPermission, redirectTo, router])

  // Mostra loading enquanto carrega autenticação ou permissões
  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      {userHasPermission ? (
        children
      ) : (
        fallbackComponent || (
          <PermissionDenied 
            featureName={featureName}
            description={`Você não possui permissão para acessar a tela de ${featureName.toLowerCase()}.`}
          />
        )
      )}
    </ProtectedRoute>
  )
}