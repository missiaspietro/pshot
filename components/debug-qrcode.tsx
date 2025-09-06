"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function DebugQRCode() {
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const testWebhookAPI = async () => {
    setIsLoading(true)
    setLogs([])
    
    try {
      addLog('🚀 Iniciando teste da API webhook...')
      
      const requestBody = {
        nome: "teste-debug",
        token: "teste-token",
        rededeLoja: "teste-rede",
        subRede: "teste-sub",
        loja: "teste-loja",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      }
      
      addLog('📤 Enviando requisição para /api/webhook')
      addLog(`📋 Body: ${JSON.stringify(requestBody, null, 2)}`)
      
      const response = await fetch('/api/webhook', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      addLog(`📥 Status: ${response.status} ${response.statusText}`)
      addLog(`📥 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        addLog(`❌ Erro: ${JSON.stringify(errorData, null, 2)}`)
        toast.error(`Erro: ${errorData.message || response.statusText}`)
      } else {
        const data = await response.json()
        addLog(`✅ Sucesso: ${JSON.stringify(data, null, 2)}`)
        toast.success('Requisição enviada com sucesso!')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      addLog(`💥 Erro de rede: ${errorMessage}`)
      toast.error(`Erro de rede: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEnvironment = () => {
    setLogs([])
    addLog('🌍 Verificando variáveis de ambiente...')
    
    // Verificar se estamos no cliente
    if (typeof window !== 'undefined') {
      addLog('🖥️ Executando no cliente (browser)')
      
      // Verificar URL atual
      addLog(`🔗 URL atual: ${window.location.href}`)
      addLog(`🔗 Origin: ${window.location.origin}`)
      
      // Verificar se é produção ou desenvolvimento
      const isProduction = window.location.hostname !== 'localhost'
      addLog(`🏭 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`)
      
    } else {
      addLog('🖥️ Executando no servidor')
    }
    
    // Verificar variáveis de ambiente públicas
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
    addLog(`🔗 NEXT_PUBLIC_WEBHOOK_URL: ${webhookUrl ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`)
    if (webhookUrl) {
      addLog(`🔗 URL: ${webhookUrl}`)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug QR Code</CardTitle>
        <CardDescription>
          Ferramenta de debug para testar a geração de QR Code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testEnvironment} variant="outline">
            Verificar Ambiente
          </Button>
          <Button 
            onClick={testWebhookAPI} 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? 'Testando...' : 'Testar Webhook API'}
          </Button>
        </div>
        
        {logs.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Logs:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}