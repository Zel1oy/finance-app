import { useForm } from 'react-hook-form'
import { useSettingsStore, useAuthStore } from '../../store'
import { upsertSettings } from '../../lib/db'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { CurrencySelector } from './CurrencySelector'
import { RatesManager } from './RatesManager'

interface BudgetForm {
  monthlyBudget: number
}

export function SettingsPage() {
  const { settings, setBaseCurrency, setMonthlyBudget } = useSettingsStore()
  const { user } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<BudgetForm>({
    defaultValues: { monthlyBudget: settings.monthlyBudget },
  })

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
