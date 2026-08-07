export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export type Cargo = {
  id: string
  patient_id: string
  concepto: string
  monto: number
  created_by: string
  created_at: string
}

export type Pago = {
  id: string
  cargo_id: string
  monto: number
  metodo: MetodoPago
  nota: string | null
  created_by: string
  created_at: string
}
