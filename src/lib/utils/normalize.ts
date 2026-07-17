const DIACRITIC_RANGE_START = String.fromCharCode(0x0300)
const DIACRITIC_RANGE_END = String.fromCharCode(0x036f)
const COMBINING_DIACRITICS = new RegExp(`[${DIACRITIC_RANGE_START}-${DIACRITIC_RANGE_END}]`, 'g')

export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase()
}
