"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import dynamic from 'next/dynamic';

const FloatingElements = dynamic(() => import('@/components/FloatingElements'), {
  ssr: false,
});
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChartIcon as ChartBar, Loader2 } from "lucide-react"
import type { z } from "zod"
import { useAuth } from "@/contexts/auth-context"
import { showToast } from "@/components/ui/toast-notification"

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState("")
  const { user, login, isLoading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Se já estiver logado, redireciona para dashboard
  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("")
      await login(data.email, data.password)
    } catch (err: any) {
      const errorMessage = err.message || "Senha e/ou e-mail incorretos."
      setError(errorMessage)
      showToast(errorMessage, "error", 7000)
    }
  }

  const gradientStyle: React.CSSProperties = {
    background: `linear-gradient(
      135deg, 
      #020617 0%, 
      #0C1B4D 25%, 
      #2E1B4B 50%, 
      #5B21B6 75%, 
      #7C3AED 100%
    )`,
    backgroundAttachment: 'fixed',
    backgroundSize: '300% 300%',
    animation: 'metallicShine 20s ease infinite',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={gradientStyle}
    >
      <style jsx global>{`
        @keyframes metallicShine {
          0% { 
            background-position: 0% 0%;
            opacity: 0.9;
          }
          50% { 
            background-position: 100% 100%;
            opacity: 1;
          }
          100% { 
            background-position: 0% 0%;
            opacity: 0.9;
          }
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 to-purple-800/40 backdrop-blur-sm">
        <FloatingElements />
      </div>
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full border-0 shadow-xl overflow-hidden relative">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ChartBar className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Praiseshot</h1>
          </div>
          <p className="text-center mt-2 text-blue-100">Sistema de Gestão Inteligente</p>
        </div>
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="h-11 px-4 py-3 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    {...register("email")} 
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-11 px-4 py-3 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register("password")} 
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Acessar minha conta'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Não tem uma conta?{' '}
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Fale com o suporte
              </a>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
