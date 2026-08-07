import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cargo, Pago } from './types'

export async function listCargosForPatient(client: SupabaseClient, patientId: string): Promise<Cargo[]> {
  const { data, error } = await client
    .from('cargos')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Cargo[]
}

export async function listAllCargos(client: SupabaseClient): Promise<Cargo[]> {
  const { data, error } = await client.from('cargos').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Cargo[]
}

export async function listPagosForCargos(
  client: SupabaseClient,
  cargoIds: string[]
): Promise<Record<string, Pago[]>> {
  if (cargoIds.length === 0) return {}
  const { data, error } = await client.from('pagos').select('*').in('cargo_id', cargoIds).order('created_at')
  if (error) throw error

  const byCargo: Record<string, Pago[]> = {}
  for (const pago of data as Pago[]) {
    if (!byCargo[pago.cargo_id]) byCargo[pago.cargo_id] = []
    byCargo[pago.cargo_id].push(pago)
  }
  return byCargo
}

export async function getIngresosHoy(client: SupabaseClient, now: Date): Promise<number> {
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const { data, error } = await client
    .from('pagos')
    .select('monto')
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', tomorrowStart.toISOString())
  if (error) throw error

  return (data as { monto: number }[]).reduce((sum, p) => sum + p.monto, 0)
}
