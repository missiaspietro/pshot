import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permite a página de login e API de login
  if (pathname === '/' || pathname.startsWith('/api/login')) {
    // Limpa qualquer cookie de sessão anterior para permitir novo login
    const response = NextResponse.next()
    response.cookies.delete('ps_session')
    return response
  }
  
  // DESABILITAR MIDDLEWARE TEMPORARIAMENTE PARA PERMITIR ACESSO
  console.log('[MIDDLEWARE] DESABILITADO - Permitindo acesso a:', pathname)
  return NextResponse.next()
  
  // Código anterior comentado para debug
  /*
  // Verifica se há um token de sessão temporário (será definido após login)
  const sessionToken = request.cookies.get('ps_session')?.value
  
  if (sessionToken) {
    // Se há sessão, permite acesso
    return NextResponse.next()
  }
  
  // Sem sessão, redireciona para login
  console.log('[MIDDLEWARE] Sem sessão - redirecionando para login:', pathname)
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete('ps_session')
  return response
  */
}

export const config = {
  // Aplica o middleware a todas as rotas exceto arquivos estáticos
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}