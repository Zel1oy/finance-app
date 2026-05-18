import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useSettingsStore, useAuthStore } from '../../store'
import { upsertSettings } from '../../lib/db'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { CurrencySelector } from './CurrencySelector'
import { RatesManager } from './RatesManager'
import { CategoriesManager } from './CategoriesManager'

interface BudgetForm {
  monthlyBudget: number
}

export function SettingsPage() {
  const { settings, setBaseCurrency, setMonthlyBudget, setMonobankToken } = useSettingsStore()
  const { user } = useAuthStore()
  const [tokenInput, setTokenInput] = useState('')
  const [tokenVisible, setTokenVisible] = useState(false)
  const [tokenSaved, setTokenSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<BudgetForm>({
    defaultValues: { monthlyBudget: settings.monthlyBudget },
  })

  function handleSaveToken() {
    const token = tokenInput.trim()
    if (!token) return
    setMonobankToken(token)
    if (user) void upsertSettings(user.id, { monobankToken: token })
    setTokenInput('')
    setTokenSaved(true)
    setTimeout(() => setTokenSaved(false), 2000)
  }

  function handleRemoveToken() {
    setMonobankToken('')
    if (user) void upsertSettings(user.id, { monobankToken: '' })
  }

  function handleCurrencyChange(code: string) {
    setBaseCurrency(code)
    if (user) void upsertSettings(user.id, { baseCurrency: code })
  }

  function handleBudgetSubmit(data: BudgetForm) {
    setMonthlyBudget(data.monthlyBudget)
    if (user) void upsertSettings(user.id, { monthlyBudget: data.monthlyBudget })
  }

  async function handleClearData() {
    if (!confirm('This will permanently delete ALL your data. Are you sure?')) return
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Customize your finance app
        </p>
      </div>

      {user && (
        <Card>
          <CardHeader title="Account" />
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
        </Card>
      )}

      <Card>
        <CardHeader title="Appearance" />
        <ThemeToggle />
      </Card>

      <Card>
        <CardHeader title="Currency & Budget" />
        <div className="flex flex-col gap-4">
          <CurrencySelector value={settings.baseCurrency} onChange={handleCurrencyChange} />

          <form onSubmit={handleSubmit(handleBudgetSubmit)} className="flex flex-col gap-3">
            <Input
              label="Monthly Budget"
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 2000"
              hint={`In ${settings.baseCurrency} — used for the spending progress bar`}
              error={errors.monthlyBudget?.message}
              {...register('monthlyBudget', {
                valueAsNumber: true,
                min: { value: 0, message: 'Must be 0 or more' },
              })}
            />
            <Button type="submit" size="sm" className="self-end" disabled={!isDirty}>
              Save Budget
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title="Custom Categories" />
        <CategoriesManager />
      </Card>

      <Card>
        <CardHeader
          title="Bank Connections"
          subtitle="Connect Monobank to import transactions"
        />
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Get your personal token from the{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Monobank app → Settings → Other → API
            </span>
            . The token is stored securely and only accessible to you.
          </p>

          {settings.monobankToken ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Connected</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {'••••••' + settings.monobankToken.slice(-6)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveToken}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={tokenVisible ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveToken() }}
                  placeholder="Paste your Monobank token"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setTokenVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={tokenVisible ? 'Hide token' : 'Show token'}
                >
                  {tokenVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button
                size="sm"
                className="self-end"
                onClick={handleSaveToken}
                disabled={!tokenInput.trim()}
              >
                {tokenSaved ? 'Saved ✓' : 'Save Token'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Exchange Rates" />
        <RatesManager />
      </Card>

      <Card>
        <CardHeader title="Data" subtitle="Stored in the cloud, synced across devices" />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your data is stored in Supabase and tied to your account. Clearing data deletes it permanently from the cloud.
          </p>
          <Button variant="danger" size="sm" className="self-start" onClick={handleClearData}>
            Clear All Data & Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
