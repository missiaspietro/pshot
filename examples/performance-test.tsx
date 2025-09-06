/**
 * TESTE DE PERFORMANCE DO SISTEMA DE PERMISSÕES
 * 
 * Este arquivo demonstra como testar se as otimizações estão funcionando
 */

'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PerformanceTest() {
  const { user } = useAuth()
  const { hasPermission, permissions, refreshPermissions } = usePermissions()
  const [testResults, setTestResults] = useState<string[]>([])

  const runPerformanceTest = () => {
    const results: string[] = []
    const startTime = performance.now()

    // Teste 1: Verificar se permissões estão em cache
    results.push(`✅ Usuário logado: ${user?.email}`)
    results.push(`✅ Permissões em cache: ${permissions ? 'SIM' : 'NÃO'}`)
    results.push(`✅ Fonte: ${user?.telaShotPermissions ? 'Contexto Auth' : 'Consulta Banco'}`)

    // Teste 2: Múltiplas verificações (devem ser instantâneas)
    const testPermissions = [
      'telaShot_promocoes',
      'telaShot_relatorios',
      'telaShot_aniversarios',
      'telaShot_pesquisas',
      'telaShot_usuarios',
      'telaShot_bots'
    ] as const

    testPermissions.forEach(permission => {
      const hasAccess = hasPermission(permission)
      results.push(`${hasAccess ? '✅' : '❌'} ${permission}: ${hasAccess ? 'PERMITIDO' : 'NEGADO'}`)
    })

    const endTime = performance.now()
    const duration = endTime - startTime

    results.push(`⚡ Tempo total: ${duration.toFixed(2)}ms`)
    results.push(duration < 1 ? '🚀 EXCELENTE: < 1ms' : duration < 5 ? '✅ BOM: < 5ms' : '⚠️ LENTO: > 5ms')

    setTestResults(results)
  }

  const testRefresh = async () => {
    const startTime = performance.now()
    await refreshPermissions()
    const endTime = performance.now()
    
    setTestResults(prev => [
      ...prev,
      `🔄 Refresh executado em ${(endTime - startTime).toFixed(2)}ms`
    ])
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste de Performance - Permissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runPerformanceTest}>
            Executar Teste
          </Button>
          <Button variant="outline" onClick={testRefresh}>
            Testar Refresh
          </Button>
          <Button variant="outline" onClick={() => setTestResults([])}>
            Limpar
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-semibold">Como interpretar:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Fonte: Contexto Auth</strong> = Otimizado ✅</li>
            <li><strong>Fonte: Consulta Banco</strong> = Não otimizado ⚠️</li>
            <li><strong>Tempo &lt; 1ms</strong> = Cache funcionando 🚀</li>
            <li><strong>Tempo &gt; 5ms</strong> = Possível consulta ao banco ⚠️</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * EXEMPLO DE USO EM DESENVOLVIMENTO
 * 
 * Adicione este componente em qualquer página para testar:
 * 
 * import { PerformanceTest } from '@/examples/performance-test'
 * 
 * export default function TestPage() {
 *   return (
 *     <div>
 *       <h1>Página de Teste</h1>
 *       <PerformanceTest />
 *     </div>
 *   )
 * }
 */