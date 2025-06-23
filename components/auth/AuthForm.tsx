'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthForm() {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const supabase = createClient()

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={view} onValueChange={(value) => setView(value as 'sign_in' | 'sign_up')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign_in">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="sign_up">Registrarse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sign_in" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#0f172a',
                        brandAccent: '#1e293b',
                      },
                    },
                  },
                }}
                providers={['google', 'github']}
                redirectTo={`${window.location.origin}/dashboard`}
                showLinks={false}
                view="sign_in"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign_up" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta</CardTitle>
              <CardDescription>
                Regístrate para obtener acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#0f172a',
                        brandAccent: '#1e293b',
                      },
                    },
                  },
                }}
                providers={['google', 'github']}
                redirectTo={`${window.location.origin}/dashboard`}
                showLinks={false}
                view="sign_up"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 