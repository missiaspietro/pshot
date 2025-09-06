/**
 * Dashboard Counters Service
 * 
 * Service for fetching real-time counters for dashboard cards
 * Provides functions to count records from pesquisas_enviadas and promocoes tables
 * filtered by user's company (empresa)
 */

import { getSecureConfig, getSupabaseHeaders, secureLog } from './security-utils'

const config = getSecureConfig()
const SUPABASE_URL = `${config.supabase.url}/rest/v1`

interface CounterResult {
  count: number;
}

/**
 * Get total count of pesquisas enviadas for a specific company
 * @param empresa - Company name to filter by
 * @returns Promise<number> - Total count of records
 */
export async function getPesquisasEnviadasCount(empresa: string): Promise<number> {
  try {
    // Validate input
    if (!empresa || empresa.trim() === '') {
      secureLog('getPesquisasEnviadasCount: empresa parameter is empty');
      return 0;
    }

    const url = new URL(`${SUPABASE_URL}/pesquisas_enviadas`);
    
    // Add filter for company (rede field)
    url.searchParams.append("rede", `eq.${empresa.trim()}`);
    
    const headers = getSupabaseHeaders();
    
    console.log('🔍 [PESQUISAS] Fazendo requisição para:', url.toString());
    console.log('🔍 [PESQUISAS] Headers (mascarados):', {
      ...headers,
      apikey: headers.apikey ? `${headers.apikey.substring(0, 10)}...` : 'undefined',
      Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 17)}...` : 'undefined'
    });
    
    const response = await fetch(url.toString(), {
      method: "HEAD",
      headers: {
        ...headers,
        "Range-Unit": "items",
        "Prefer": "count=planned"
      }
    });

    console.log('📥 [PESQUISAS] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error('❌ [PESQUISAS] Erro na requisição:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        empresa: empresa
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentRange = response.headers.get("content-range");
    if (!contentRange) {
      secureLog('getPesquisasEnviadasCount: No content-range header found');
      return 0;
    }

    // Parse count from content-range header (format: "0-9/10" or "*/10")
    const countMatch = contentRange.match(/\/(\d+)$/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;
    
    secureLog(`getPesquisasEnviadasCount: Found ${count} records for empresa: ${empresa}`);
    return count;

  } catch (error) {
    secureLog('Error fetching pesquisas enviadas count:', error);
    return 0;
  }
}

/**
 * Get total count of promocoes for a specific company
 * @param empresa - Company name to filter by (Rede field)
 * @returns Promise<number> - Total count of records
 */
export async function getPromocoesCount(empresa: string): Promise<number> {
  try {
    // Validate input
    if (!empresa || empresa.trim() === '') {
      secureLog('getPromocoesCount: empresa parameter is empty');
      return 0;
    }

    const url = new URL(`${SUPABASE_URL}/promocoes`);
    
    // Add filter for company (Rede field)
    url.searchParams.append("Rede", `eq.${empresa.trim()}`);
    
    const headers = getSupabaseHeaders();
    
    console.log('🔍 [PROMOCOES] Fazendo requisição para:', url.toString());
    console.log('🔍 [PROMOCOES] Headers (mascarados):', {
      ...headers,
      apikey: headers.apikey ? `${headers.apikey.substring(0, 10)}...` : 'undefined',
      Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 17)}...` : 'undefined'
    });
    
    const response = await fetch(url.toString(), {
      method: "HEAD",
      headers: {
        ...headers,
        "Range-Unit": "items",
        "Prefer": "count=planned"
      }
    });

    console.log('📥 [PROMOCOES] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error('❌ [PROMOCOES] Erro na requisição:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        empresa: empresa
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentRange = response.headers.get("content-range");
    if (!contentRange) {
      secureLog('getPromocoesCount: No content-range header found');
      return 0;
    }

    // Parse count from content-range header (format: "0-9/10" or "*/10")
    const countMatch = contentRange.match(/\/(\d+)$/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;
    
    secureLog(`getPromocoesCount: Found ${count} records for empresa: ${empresa}`);
    return count;

  } catch (error) {
    secureLog('Error fetching promocoes count:', error);
    return 0;
  }
}