import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { user } = useAuthStore()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
      } else {
        setInfo('Check your email for a confirmation link, then sign in.')
        setMode('signin')
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your personal finance tracker
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setInfo('') }}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2">
                {info}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          Your data is stored privately in the cloud and never shared.
        </p>
      </div>
    </div>
  )
}
