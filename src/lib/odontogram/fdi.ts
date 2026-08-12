const QUADRANTS = [1, 2, 3, 4]
const POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export const FDI_TEETH: number[] = QUADRANTS.flatMap((q) =>
  POSITIONS.map((p) => q * 10 + p)
)

export function isValidFdiTooth(code: number): boolean {
  return FDI_TEETH.includes(code)
}

export const UPPER_ROW_FDI: number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const LOWER_ROW_FDI: number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
