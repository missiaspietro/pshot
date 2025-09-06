'use client'

import { AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface PermissionDeniedProps {
  featureName: string
  description?: string
  showBackButton?: boolean
}

export function PermissionDenied({ 
  featureName, 
  description = "Você não possui permissão para acessar esta funcionalidade.",
  showBackButton = true 
}: PermissionDeniedProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full">
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Acesso Restrito - {featureName}
          </AlertTitle>
          <AlertDescription className="text-amber-700 mt-2">
            {description}
            <br />
            <span className="text-sm mt-2 block">
              Entre em contato com o administrador do sistema para solicitar acesso.
            </span>
          </AlertDescription>
        </Alert>
        
        {showBackButton && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}