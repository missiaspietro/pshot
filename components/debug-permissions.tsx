'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Componente de debug para verificar permissões
 * Use apenas em desenvolvimento
 */
export function DebugPermissions() {
  const { user } = useAuth()
  const { permissions, isLoading } = usePermissions()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">
          🐛 Debug - Permissões do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <strong className="text-sm">Email:</strong> {user?.email || 'Não logado'}
        </div>
        
        <div>
          <strong className="text-sm">Status:</strong>{' '}
          {isLoading ? (
            <Badge variant="secondary">Carregando...</Badge>
          ) : (
            <Badge variant="default">Carregado</Badge>
          )}
        </div>

        <div>
          <strong className="text-sm">Fonte das Permissões:</strong>{' '}
          {user?.telaShotPermissions ? (
            <Badge className="bg-green-100 text-green-800">
              ✅ Contexto de Auth (Otimizado)
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-800">
              ⚠️ Consulta ao Banco
            </Badge>
          )}
        </div>

        {permissions && (
          <div>
            <strong className="text-sm">Permissões:</strong>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span>{key.replace('telaShot_', '')}:</span>
                  {value ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">✅</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 text-xs">❌</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-yellow-700 mt-2">
          Este componente só aparece em desenvolvimento
        </div>
      </CardContent>
    </Card>
  )
}