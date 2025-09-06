/**
 * Utilitários de segurança para mascarar dados sensíveis
 */

// Função para mascarar chaves de API para logs/debug
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '***masked***'
  
  const start = apiKey.substring(0, 4)
  const end = apiKey.substring(apiKey.length - 4)
  const middle = '*'.repeat(Math.max(0, apiKey.length - 8))
  
  return `${start}${middle}${end}`
}

// Função para mascarar URLs sensíveis
export function maskUrl(url: string): string {
  if (!url) return '***masked***'
  
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // Mascarar subdomínios sensíveis
    if (domain.includes('praisesistemas')) {
      return url.replace(/praisesistemas/g, '***masked***')
    }
    
    return url
  } catch {
    return '***masked***'
  }
}

// Função para mascarar senhas
export function maskPassword(password: string): string {
  return '*'.repeat(password?.length || 8)
}

// Função para mascarar emails
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***masked***'
  
  const [username, domain] = email.split('@')
  const maskedUsername = username.length > 2 
    ? `${username[0]}***${username[username.length - 1]}`
    : '***'
  
  return `${maskedUsername}@${domain}`
}

// Função para log seguro (mascarar dados sensíveis automaticamente)
export function secureLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    let logData = data
    
    if (data && typeof data === 'object') {
      logData = JSON.parse(JSON.stringify(data))
      
      // Mascarar campos sensíveis conhecidos
      const sensitiveFields = ['password', 'apikey', 'token', 'secret', 'key']
      
      function maskObject(obj: any): any {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const lowerKey = key.toLowerCase()
            
            if (sensitiveFields.some(field => lowerKey.includes(field))) {
              if (typeof obj[key] === 'string') {
                obj[key] = maskApiKey(obj[key])
              }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              maskObject(obj[key])
            }
          }
        }
        return obj
      }
      
      logData = maskObject(logData)
    }
    
    console.log(message, logData)
  }
}

// Configurações seguras centralizadas
export const getSecureConfig = () => {
  // Debug das variáveis de ambiente (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [CONFIG] Verificando variáveis de ambiente:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definida' : 'UNDEFINED');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida' : 'UNDEFINED');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definida' : 'UNDEFINED');
  }
  
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    webhook: {
      url: process.env.NEXT_PUBLIC_WEBHOOK_URL!,
    },
    encryption: {
      secret: process.env.ENCRYPTION_SECRET || 'default-secret-key',
    },
    auth: {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      secret: process.env.NEXTAUTH_SECRET!,
    }
  }
}

// Headers seguros para requisições Supabase
export const getSupabaseHeaders = () => {
  const config = getSecureConfig()
  
  return {
    'apikey': config.supabase.serviceKey,
    'Authorization': `Bearer ${config.supabase.serviceKey}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}