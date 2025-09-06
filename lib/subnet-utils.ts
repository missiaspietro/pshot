/**
 * Utility functions for subnet display logic
 */

export interface UserData {
  id: string;
  email: string;
  nome: string;
  empresa: string;
  rede: string;
  sub_rede: string;
  sistema: string;
}

export type SubnetDisplayState = 
  | { type: 'loading' }
  | { type: 'error', message: string }
  | { type: 'success', subnet: string }
  | { type: 'not-authenticated' }

/**
 * Get the display subnet for a user with proper fallback logic
 * @param user - User data object or null
 * @returns Display subnet string
 */
export const getDisplaySubnet = (user: UserData | null): string => {
  if (!user) return 'Não definida';
  
  // Priority: sub_rede > empresa > 'Não definida'
  return user.sub_rede || user.empresa || 'Não definida';
}

/**
 * Get the subnet display state based on loading and user data
 * @param isLoading - Whether user data is being loaded
 * @param user - User data object or null
 * @param error - Error message if any
 * @returns SubnetDisplayState object
 */
export const getSubnetDisplayState = (
  isLoading: boolean, 
  user: UserData | null, 
  error: string | null
): SubnetDisplayState => {
  if (error) {
    return { type: 'error', message: error };
  }
  
  if (isLoading) {
    return { type: 'loading' };
  }
  
  if (!user) {
    return { type: 'not-authenticated' };
  }
  
  return { type: 'success', subnet: getDisplaySubnet(user) };
}

/**
 * Format subnet display text for UI
 * @param state - SubnetDisplayState object
 * @returns Formatted display text
 */
export const formatSubnetDisplay = (state: SubnetDisplayState): string => {
  switch (state.type) {
    case 'loading':
      return 'Carregando...';
    case 'error':
      return 'Erro ao carregar';
    case 'not-authenticated':
      return 'Não autenticado';
    case 'success':
      return state.subnet;
    default:
      return 'Não definida';
  }
}