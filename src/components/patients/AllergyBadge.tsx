export function AllergyBadge({ allergies }: { allergies: string | null }) {
  if (!allergies) return null
  return (
    <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
      Alergia: {allergies}
    </span>
  )
}
