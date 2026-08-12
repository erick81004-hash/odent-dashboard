export const TOOTH_CONDITIONS = [
  { key: 'caries', label: 'Caries' },
  { key: 'gingivitis', label: 'Gingivitis' },
  { key: 'periodontitis', label: 'Periodontitis' },
  { key: 'fractura', label: 'Fractura' },
  { key: 'apinamiento', label: 'Apiñamiento' },
  { key: 'fluorosis', label: 'Fluorosis' },
  { key: 'ausencia', label: 'Ausencia' },
  { key: 'infeccion_pulpar', label: 'Infección Pulpar' },
  { key: 'restos_radicular', label: 'Restos Radicular' },
  { key: 'endodoncia', label: 'Endodoncia' },
  { key: 'brackets', label: 'Brackets' },
  { key: 'corona', label: 'Corona' },
  { key: 'cirugia', label: 'Cirugía' },
  { key: 'movilidad', label: 'Movilidad' },
  { key: 'recesion_gingival', label: 'Recesión gingival' },
  { key: 'desgaste', label: 'Desgaste' },
  { key: 'sensibilidad', label: 'Sensibilidad' },
  { key: 'placa_dental', label: 'Placa dental' },
  { key: 'bruxismo', label: 'Bruxismo' },
  { key: 'reemplazo_protesis', label: 'Reemplazo de prótesis' },
] as const

export type ToothConditionKey = (typeof TOOTH_CONDITIONS)[number]['key']
