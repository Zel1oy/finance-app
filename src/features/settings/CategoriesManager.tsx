import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useCategoriesStore } from '../../store/categoriesSlice'
import { useAuthStore } from '../../store'
import { insertCategory, deleteCategory } from '../../lib/db'
import { BUILTIN_CATEGORIES, type CategoryDef } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const PRESET_COLORS = [
  '#f97316', '#ef4444', '#ec4899', '#a855f7',
  '#8b5cf6', '#3b82f6', '#06b6d4', '#14b8a6',
  '#22c55e', '#84cc16', '#eab308', '#6b7280',
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CategoriesManager() {
  const { customCategories, addCustomCategory, deleteCustomCategory } = useCategoriesStore()
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0]!)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const allIds = new Set([...BUILTIN_CATEGORIES.map((c) => c.id), ...customCategories.map((c) => c.id)])

  async function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Name is required'); return }
    const id = slugify(trimmed)
    if (!id) { setError('Name must contain letters or numbers'); return }
    if (allIds.has(id)) { setError(`Category "${id}" already exists`); return }

    setSaving(true)
    const cat: CategoryDef = { id, name: trimmed, color, isBuiltin: false }
    addCustomCategory(cat)
    if (user) await insertCategory(cat, user.id)
    setName('')
    setColor(PRESET_COLORS[0]!)
    setError('')
    setSaving(false)
  }

  async function handleDelete(id: string) {
    deleteCustomCategory(id)
    if (user) await deleteCategory(id, user.id)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
          Built-in categories
        </p>
        <div className="flex flex-wrap gap-2">
          {BUILTIN_CATEGORIES.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {customCategories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Custom categories
          </p>
          <div className="flex flex-col gap-2">
            {customCategories.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{c.name}</span>
                <span className="text-xs text-gray-400 font-mono">{c.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(c.id)}
                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add custom category</p>
        <Input
          placeholder="Category name (e.g. Tithe, Gym)"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          error={error}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleAdd() } }}
        />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pick a color</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : undefined, outlineOffset: 2 }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={() => void handleAdd()}
          loading={saving}
          size="sm"
          className="self-start"
        >
          <Plus size={14} />
          Add Category
        </Button>
      </div>
    </div>
  )
}
