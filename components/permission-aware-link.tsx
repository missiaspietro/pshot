'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePermissions } from '@/hooks/use-permissions'
import { TelaShotPermission, PERMISSION_LABELS } from '@/lib/permissions-service'
import { toast } from 'sonner'

interface PermissionAwareLinkProps {
  href: string
  requiredPermission: TelaShotPermission
  children: ReactNode
  className?: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function PermissionAwareLink({
  href,
  requiredPermission,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave
}: PermissionAwareLinkProps) {
  const { hasPermission } = usePermissions()
  const featureName = PERMISSION_LABELS[requiredPermission]

  const handleClick = (e: React.MouseEvent) => {
    if (!hasPermission(requiredPermission)) {
      e.preventDefault()
      toast.error(`Acesso negado`, {
        description: `Você não possui permissão para acessar a tela de ${featureName.toLowerCase()}.`
      })
      return
    }
    
    onClick?.()
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  )
}