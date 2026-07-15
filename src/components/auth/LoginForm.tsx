'use client'

import { useState } from 'react'

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (email: string, password: string) => Promise<{ error: boolean }>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await onSubmit(email, password)
    if (result.error) {
      setError('Correo o contraseña incorrectos.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
      <label className="block text-sm">
        Correo
        <input
          type="email"
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Contraseña
        <input
          type="password"
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded border border-gray-400 px-3 py-1 text-sm"
      >
        Entrar
      </button>
    </form>
  )
}
