import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cargo, Pago, MetodoPago } from './types'
import { saldoPendiente } from './balance'

export class PagoExcedeSaldoError extends Error {
  saldoPendiente: number

  constructor(saldoPendiente: number) {
    super(`El pago excede el saldo pendiente ($${saldoPendiente.toFixed(2)}).`)
    this.saldoPendiente = saldoPendiente
  }
}

export async function crearCargo(
  client: SupabaseClient,
  input: { patient_id: string; concepto: string; monto: number; created_by: string }
): Promise<Cargo> {
  const { data, error } = await client.from('cargos').insert(input).select().single()
  if (error) throw error
  return data as Cargo
}

export async function registrarPago(
  client: SupabaseClient,
  cargo: Cargo,
  pagosExistentes: Pago[],
  input: { monto: number; metodo: MetodoPago; nota: string | null; created_by: string }
): Promise<Pago> {
  const saldo = saldoPendiente(cargo.monto, pagosExistentes)
  if (input.monto > saldo) throw new PagoExcedeSaldoError(saldo)

  const { data, error } = await client
    .from('pagos')
    .insert({ cargo_id: cargo.id, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Pago
}
