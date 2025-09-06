/**
 * Utilitários para normalização e formatação de texto
 */

/**
 * Normaliza texto corrigindo caracteres com acentos corrompidos
 * Foca apenas nos caracteres problemáticos mais comuns nos modais
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return text || ''
  }

  let normalized = text

  // Corrigir o caractere � (substituto Unicode) que aparece em nomes como "LUZIA PL�CIDO"
  normalized = normalized.replace(/�/g, 'Á')
  
  // Corrigir outros caracteres corrompidos comuns
  normalized = normalized.replace(/PL�CIDO/g, 'PLÁCIDO')
  normalized = normalized.replace(/JO�O/g, 'JOÃO')
  normalized = normalized.replace(/CONCEI��O/g, 'CONCEIÇÃO')
  normalized = normalized.replace(/JOS�/g, 'JOSÉ')
  normalized = normalized.replace(/ANT�NIO/g, 'ANTÔNIO')
  normalized = normalized.replace(/L�CIA/g, 'LÚCIA')
  normalized = normalized.replace(/M�RIA/g, 'MARIA')
  
  // Remover caracteres de controle
  normalized = normalized.replace(/Â/g, '')
  
  // Limpar espaços extras e retornar
  return normalized.trim()
}

/**
 * Normaliza um objeto de dados, aplicando normalização de texto em todos os campos string
 */
export function normalizeDataRow(row: Record<string, any>): Record<string, any> {
  if (!row || typeof row !== 'object') {
    return row
  }

  const normalized: Record<string, any> = {}
  
  Object.entries(row).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalized[key] = normalizeText(value)
    } else {
      normalized[key] = value
    }
  })

  return normalized
}