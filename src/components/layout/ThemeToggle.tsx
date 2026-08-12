'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'odent-theme'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-foreground/60"
    >
      {isDark ? (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M10 2v2M10 16v2M4 4l1.4 1.4M14.6 14.6L16 16M2 10h2M16 10h2M4 16l1.4-1.4M14.6 5.4L16 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path
            d="M17 12.5A7 7 0 0 1 7.5 3 7 7 0 1 0 17 12.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
