const QUADRANTS = [1, 2, 3, 4]
const POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export const FDI_TEETH: number[] = QUADRANTS.flatMap((q) =>
  POSITIONS.map((p) => q * 10 + p)
)

export function isValidFdiTooth(code: number): boolean {
  return FDI_TEETH.includes(code)
}
