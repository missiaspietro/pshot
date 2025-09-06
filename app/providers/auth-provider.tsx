'use client'

import { AuthProvider as AuthProviderBase } from '@/contexts/auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderBase>{children}</AuthProviderBase>
}
