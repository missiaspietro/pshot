'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { PermissionsService, TelaShotPermission, UserPermissions } from '@/lib/permissions-service'

export interface UsePermissionsReturn {
  permissions: UserPermissions | null
  isLoading: boolean
  hasPermission: (permission: TelaShotPermission) => boolean
  checkPermission: (permission: TelaShotPermission) => Promise<boolean>
  refreshPermissions: () => Promise<void>
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isLoading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carrega permissões do contexto de autenticação (mais rápido)
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true)
      return
    }

    if (user?.telaShotPermissions) {
      // Usa as permissões que já vieram do login
      setPermissions(user.telaShotPermissions)
      setIsLoading(false)
    } else if (user?.email) {
      // Fallback: busca do banco se não tiver no contexto
      loadPermissionsFromDatabase()
    } else {
      setPermissions(null)
      setIsLoading(false)
    }
  }, [user, authLoading])

  const loadPermissionsFromDatabase = useCallback(async () => {
    if (!user?.email) {
      setPermissions(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const userPermissions = await PermissionsService.getUserPermissions(user.email)
      setPermissions(userPermissions)
    } catch (error) {
      console.error('Erro ao carregar permissões do banco:', error)
      setPermissions(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.email])

  const hasPermission = useCallback((permission: TelaShotPermission): boolean => {
    return permissions?.[permission] ?? false
  }, [permissions])

  const checkPermission = useCallback(async (permission: TelaShotPermission): Promise<boolean> => {
    // Primeiro tenta usar as permissões em cache
    if (permissions) {
      return permissions[permission] ?? false
    }
    
    // Fallback: consulta o banco
    if (!user?.email) return false
    return await PermissionsService.hasPermission(user.email, permission)
  }, [permissions, user?.email])

  const refreshPermissions = useCallback(async () => {
    await loadPermissionsFromDatabase()
  }, [loadPermissionsFromDatabase])

  return {
    permissions,
    isLoading,
    hasPermission,
    checkPermission,
    refreshPermissions
  }
}