import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client.ts'
import { queryClient } from '#/lib/query-client.ts'
import { Button } from '#/components/ui/button.tsx'
import { Form, FormField } from '#/components/ui/form.tsx'
import { FormInputField } from '#/components/FormInputField.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import Logo from '#/components/icon/Logo.tsx'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

const signInSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'Pelo menos 8 caracteres'),
})
type SignInValues = z.infer<typeof signInSchema>

const signUpSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  email: z.email('E-mail inválido'),
  phone: z.string().min(8, 'Obrigatório'),
  cpf: z.string().optional(),
  password: z.string().min(8, 'Pelo menos 8 caracteres'),
})
type SignUpValues = z.infer<typeof signUpSchema>

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const { data: session } = authClient.useSession()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) navigate({ to: redirect ?? '/map' })
  }, [session, redirect, navigate])

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', phone: '', cpf: '', password: '' },
  })

  async function handleSignIn(values: SignInValues) {
    setLoading(true)
    const { error } = await authClient.signIn.email(values)
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Algo deu errado. Tente novamente.')
      return
    }
    queryClient.clear()
  }

  async function handleSignUp(values: SignUpValues) {
    setLoading(true)
    // The generic better-auth client isn't typed with the backend's
    // additionalFields (phone/cpf) since it lives in a separate repo —
    // the fields are still sent and accepted by the real server.
    const { error } = await authClient.signUp.email({
      ...values,
      cpf: values.cpf || undefined,
    } as Parameters<typeof authClient.signUp.email>[0])
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Algo deu errado. Tente novamente.')
      return
    }
    queryClient.clear()
  }

  return (
    <PhoneShell className="flex flex-col overflow-hidden bg-frost">
      <div className="flex flex-col px-6 pt-12 pb-10">
        <Logo className="h-12 w-auto" />
        <h1 className="mt-8 text-4xl font-extrabold leading-tight text-foreground">
          Escaneie. Pegue.
          <br />
          Saia.
        </h1>
        <p className="mt-3 max-w-xs text-sm text-foreground/70">
          Entre para destravar a geladeira e pagar pelo que você levar.
        </p>
      </div>

      <div className="flex flex-1 flex-col rounded-t-[2.5rem] bg-background px-6 pt-8 pb-4">
        <div className="mb-6 flex gap-2 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === 'sign-in' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === 'sign-up' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Criar conta
          </button>
        </div>

        {mode === 'sign-in' ? (
          <Form {...signInForm}>
            <form
              onSubmit={signInForm.handleSubmit(handleSignIn)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormInputField label="E-mail" type="email" placeholder="voce@exemplo.com" required {...field} />
                )}
              />
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormInputField label="Senha" type="password" placeholder="••••••••" required {...field} />
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-13 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Aguarde…' : 'Entrar'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signUpForm}>
            <form
              onSubmit={signUpForm.handleSubmit(handleSignUp)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={signUpForm.control}
                name="name"
                render={({ field }) => (
                  <FormInputField label="Nome" placeholder="Maria Silva" required {...field} />
                )}
              />
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormInputField label="E-mail" type="email" placeholder="voce@exemplo.com" required {...field} />
                )}
              />
              <FormField
                control={signUpForm.control}
                name="phone"
                render={({ field }) => (
                  <FormInputField label="Telefone" type="tel" placeholder="+55 11 99999-9999" required {...field} />
                )}
              />
              <FormField
                control={signUpForm.control}
                name="cpf"
                render={({ field }) => (
                  <FormInputField label="CPF (opcional)" placeholder="000.000.000-00" {...field} />
                )}
              />
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormInputField label="Senha" type="password" placeholder="••••••••" required {...field} />
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-13 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Aguarde…' : 'Criar conta'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </PhoneShell>
  )
}
