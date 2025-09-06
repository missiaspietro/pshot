/**
 * Utility functions for network resolution in the promotion system
 */

// Interface para dados do usuário
export interface UserData {
  email?: string;
  rede?: string;        // Campo principal para rede
  empresa?: string;     // Fallback para rede
  sub_rede?: string;    // Campo complementar, não principal
  instancia?: string;
  loja?: string;
  nivel?: string;
}

/**
 * Resolve the user's network with correct priority order
 * Priority: rede > empresa > sub_rede
 * 
 * @param userData - User data object containing network fields
 * @returns The resolved network string or null if no network is found
 */
export function resolveUserNetwork(userData?: UserData): string | null {
  if (!userData) {
    console.warn('⚠️ [NETWORK-UTILS] No user data provided for network resolution')
    return null
  }

  // Priority order: rede > empresa > sub_rede
  const resolvedNetwork = userData.rede || userData.empresa || userData.sub_rede || null

  // Log the resolution decision for debugging
  if (resolvedNetwork) {
    if (userData.rede) {
      console.log('✅ [NETWORK-UTILS] Network resolved using "rede" field:', userData.rede)
    } else if (userData.empresa) {
      console.log('⚠️ [NETWORK-UTILS] Network resolved using "empresa" fallback:', userData.empresa)
    } else if (userData.sub_rede) {
      console.log('⚠️ [NETWORK-UTILS] Network resolved using "sub_rede" fallback:', userData.sub_rede)
    }
  } else {
    console.warn('❌ [NETWORK-UTILS] No network could be resolved from user data:', {
      rede: userData.rede,
      empresa: userData.empresa,
      sub_rede: userData.sub_rede,
      email: userData.email
    })
  }

  return resolvedNetwork
}

/**
 * Get network resolution info for debugging purposes
 * 
 * @param userData - User data object containing network fields
 * @returns Object with resolution details
 */
export function getNetworkResolutionInfo(userData?: UserData) {
  if (!userData) {
    return {
      resolvedNetwork: null,
      source: null,
      available: {
        rede: false,
        empresa: false,
        sub_rede: false
      }
    }
  }

  const resolvedNetwork = resolveUserNetwork(userData)
  let source: 'rede' | 'empresa' | 'sub_rede' | null = null

  if (userData.rede) {
    source = 'rede'
  } else if (userData.empresa) {
    source = 'empresa'
  } else if (userData.sub_rede) {
    source = 'sub_rede'
  }

  return {
    resolvedNetwork,
    source,
    available: {
      rede: !!userData.rede,
      empresa: !!userData.empresa,
      sub_rede: !!userData.sub_rede
    }
  }
}

/**
 * Validates if the resolved network exists in the shot_lojas table
 * 
 * @param resolvedNetwork - The network string to validate
 * @param shotLojasService - Service to check network existence
 * @returns Promise<boolean> - True if network is valid
 */
export async function validateNetworkExists(
  resolvedNetwork: string | null,
  shotLojasService: any
): Promise<boolean> {
  if (!resolvedNetwork) {
    console.warn('⚠️ [NETWORK-VALIDATION] No network provided for validation')
    return false
  }

  try {
    console.log('🔍 [NETWORK-VALIDATION] Validating network existence:', resolvedNetwork)
    
    // Try to get stores for this network
    const stores = await shotLojasService.getLojasPorUsuario(resolvedNetwork)
    
    const isValid = Array.isArray(stores) && stores.length > 0
    
    if (isValid) {
      console.log('✅ [NETWORK-VALIDATION] Network is valid, found', stores.length, 'stores')
    } else {
      console.warn('⚠️ [NETWORK-VALIDATION] Network is invalid or has no stores:', resolvedNetwork)
    }
    
    return isValid
  } catch (error) {
    console.error('❌ [NETWORK-VALIDATION] Error validating network:', error)
    return false
  }
}

/**
 * Handles network resolution failures with appropriate fallback behavior
 * 
 * @param userData - User data object
 * @param errorCallback - Function to call with error message
 * @returns Fallback network or null
 */
export function handleNetworkResolutionFailure(
  userData?: UserData,
  errorCallback?: (message: string) => void
): string | null {
  console.error('❌ [NETWORK-FALLBACK] Network resolution failed for user:', userData?.email)
  
  const resolutionInfo = getNetworkResolutionInfo(userData)
  
  if (!resolutionInfo.available.rede && !resolutionInfo.available.empresa && !resolutionInfo.available.sub_rede) {
    const message = 'Usuário não possui nenhum campo de rede definido (rede, empresa, sub_rede)'
    console.error('❌ [NETWORK-FALLBACK]', message)
    errorCallback?.(message)
    return null
  }
  
  // If we have some network fields but resolution still failed, log details
  console.warn('⚠️ [NETWORK-FALLBACK] Available network fields:', resolutionInfo.available)
  
  const message = 'Não foi possível determinar a rede do usuário. Verifique suas permissões.'
  errorCallback?.(message)
  
  return null
}