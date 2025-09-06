"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function DebugProductionQRCode() {
  const [logs, setLogs] = useState<string[]>([])
  const [isDebugging, setIsDebugging] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  // Verificar ambiente
  const checkEnvironment = () => {
    addLog('🌍 Verificando ambiente...')
    addLog(`URL: ${window.location.href}`)
    addLog(`Hostname: ${window.location.hostname}`)
    addLog(`Produção: ${window.location.hostname !== 'localhost' ? 'SIM' : 'NÃO'}`)
    
    // Verificar variáveis de ambiente
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
    addLog(`NEXT_PUBLIC_WEBHOOK_URL: ${webhookUrl || 'NÃO CONFIGURADA'}`)
    
    if (webhookUrl) {
      addLog(`URL do webhook: ${webhookUrl}`)
    }
  }

  // Verificar se os botões de QR Code estão funcionando
  const checkQRCodeButtons = () => {
    addLog('🔘 Verificando botões de QR Code...')
    
    const buttons = document.querySelectorAll('button')
    addLog(`Total de botões encontrados: ${buttons.length}`)
    
    const qrButtons = Array.from(buttons).filter(btn => {
      const text = btn.textContent?.toLowerCase() || ''
      return text.includes('qr') || text.includes('gerar') || text.includes('conectar')
    })
    
    addLog(`Botões de QR Code encontrados: ${qrButtons.length}`)
    
    qrButtons.forEach((btn, index) => {
      addLog(`Botão ${index + 1}: "${btn.textContent?.trim()}" - Desabilitado: ${btn.disabled}`)
    })
  }

  // Simular clique em um botão de QR Code
  const simulateQRCodeClick = () => {
    addLog('🖱️ Simulando clique em botão de QR Code...')
    
    const buttons = document.querySelectorAll('button')
    const qrButtons = Array.from(buttons).filter(btn => {
      const text = btn.textContent?.toLowerCase() || ''
      return text.includes('qr') || text.includes('gerar')
    })
    
    if (qrButtons.length > 0) {
      const firstButton = qrButtons[0] as HTMLButtonElement
      addLog(`Clicando no botão: "${firstButton.textContent?.trim()}"`)
      
      try {
        firstButton.click()
        addLog('✅ Clique simulado com sucesso')
      } catch (error) {
        addLog(`❌ Erro ao simular clique: ${error}`)
      }
    } else {
      addLog('❌ Nenhum botão de QR Code encontrado')
    }
  }

  // Testar API webhook diretamente
  const testWebhookAPI = async () => {
    addLog('🚀 Testando API webhook...')
    
    const requestBody = {
      nome: "teste-debug-producao",
      token: "teste-token",
      rededeLoja: "teste-rede",
      subRede: "teste-sub",
      loja: "teste-loja",
      qrcode: true,
      integration: "WHATSAPP-BAILEYS"
    }
    
    addLog(`Enviando requisição para /api/webhook`)
    addLog(`Body: ${JSON.stringify(requestBody, null, 2)}`)
    
    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      addLog(`Status: ${response.status} ${response.statusText}`)
      addLog(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        addLog(`❌ Erro: ${JSON.stringify(errorData, null, 2)}`)
        toast.error(`Erro na API: ${errorData.message || response.statusText}`)
      } else {
        const data = await response.json()
        addLog(`✅ Sucesso: ${JSON.stringify(data, null, 2)}`)
        toast.success('API webhook funcionando!')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      addLog(`💥 Erro de rede: ${errorMessage}`)
      toast.error(`Erro de rede: ${errorMessage}`)
    }
  }

  // Monitorar requisições de rede
  const monitorNetworkRequests = () => {
    addLog('🌐 Configurando monitoramento de rede...')
    
    // Interceptar fetch
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      addLog(`📡 Fetch interceptado: ${args[0]}`)
      
      return originalFetch.apply(this, args)
        .then(response => {
          addLog(`📥 Resposta: ${args[0]} - Status: ${response.status}`)
          return response
        })
        .catch(error => {
          addLog(`💥 Erro no fetch: ${args[0]} - ${error.message}`)
          throw error
        })
    }
    
    addLog('✅ Monitoramento de rede ativado')
    toast.success('Monitoramento de rede ativado')
  }

  // Executar debug completo
  const runFullDebug = () => {
    setIsDebugging(true)
    setLogs([])
    
    addLog('🚀 Iniciando debug completo...')
    
    checkEnvironment()
    
    setTimeout(() => {
      checkQRCodeButtons()
    }, 1000)
    
    setTimeout(() => {
      monitorNetworkRequests()
    }, 2000)
    
    setTimeout(() => {
      setIsDebugging(false)
      addLog('✅ Debug completo finalizado')
    }, 3000)
  }

  // Limpar logs
  const clearLogs = () => {
    setLogs([])
  }

  return (
    <Card className="w-full max-w-6xl mx-auto mb-6 border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔍 Debug Produção - QR Code</CardTitle>
        <CardDescription className="text-orange-600">
          Ferramenta de debug para investigar problemas de QR Code em produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={runFullDebug} 
            disabled={isDebugging}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isDebugging ? 'Debugando...' : 'Debug Completo'}
          </Button>
          
          <Button onClick={checkEnvironment} variant="outline">
            Verificar Ambiente
          </Button>
          
          <Button onClick={checkQRCodeButtons} variant="outline">
            Verificar Botões
          </Button>
          
          <Button onClick={simulateQRCodeClick} variant="outline">
            Simular Clique
          </Button>
          
          <Button 
            onClick={testWebhookAPI} 
            className="bg-blue-500 hover:bg-blue-600"
          >
            Testar API
          </Button>
          
          <Button onClick={monitorNetworkRequests} variant="outline">
            Monitorar Rede
          </Button>
          
          <Button onClick={clearLogs} variant="destructive">
            Limpar Logs
          </Button>
        </div>
        
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-semibold">Logs de Debug:</h3>
              <span className="text-gray-400">{logs.length} entradas</span>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Instruções de Uso:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>1. Clique em "Debug Completo" para executar todos os testes</li>
            <li>2. Use "Simular Clique" para testar se os botões respondem</li>
            <li>3. Use "Testar API" para verificar se o webhook está funcionando</li>
            <li>4. Monitore os logs para identificar problemas</li>
            <li>5. <strong>REMOVER ESTE COMPONENTE APÓS O DEBUG!</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}