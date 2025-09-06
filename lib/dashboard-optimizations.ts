// Otimizações para o Dashboard
import { useMemo, useCallback } from 'react'

// Debounce para reduzir chamadas desnecessárias
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle para limitar frequência de execução
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Cache simples para dados (limpa quando sair do dashboard)
const cache = new Map<string, any>()

export const getCachedData = (key: string) => {
  return cache.get(key) || null
}

export const setCachedData = (key: string, data: any) => {
  cache.set(key, data)
}

// Limpar todo o cache (chamado quando sair do dashboard)
export const clearAllCache = () => {
  cache.clear()
}

// Limpar cache específico
export const clearCacheByKey = (key: string) => {
  cache.delete(key)
}

// Hook para otimizar re-renders de gráficos
export const useOptimizedChartData = (data: any[], dependencies: any[]) => {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    return data
  }, dependencies)
}

// Hook para otimizar callbacks
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
) => {
  return useCallback(callback, dependencies)
}

// Função para reduzir dados grandes
export const reduceDataForChart = (data: any[], maxPoints: number = 50) => {
  if (data.length <= maxPoints) return data
  
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

// Otimização para cores de gráficos
export const getOptimizedColors = (count: number) => {
  const baseColors = [
    '#8B5CF6', '#60A5FA', '#A78BFA', '#F472B6', 
    '#6366F1', '#7C3AED', '#C084FC', '#4F46E5'
  ]
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }
  
  // Gerar cores adicionais se necessário
  const additionalColors = []
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360 // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 60%)`)
  }
  
  return [...baseColors, ...additionalColors]
}