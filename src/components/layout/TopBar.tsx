function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function TopBar({ name }: { name: string }) {
  return (
    <div className="flex justify-end px-6 pt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/70">{name}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-on-primary">
          {initials(name)}
        </div>
      </div>
    </div>
  )
}
