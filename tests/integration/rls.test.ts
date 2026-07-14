import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const URL = 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(URL, SERVICE_KEY)

async function createStaffUser(email: string, role: 'admin' | 'doctor' | 'asistente') {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: 'test-password-123',
    email_confirm: true,
  })
  if (error) throw error
  const userId = data.user!.id
  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: userId, role, full_name: email })
  if (profileError) throw profileError
  return userId
}

async function signInAs(email: string) {
  const client = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { error } = await client.auth.signInWithPassword({
    email,
    password: 'test-password-123',
  })
  if (error) throw error
  return client
}

describe('patients RLS', () => {
  beforeAll(async () => {
    await createStaffUser('asistente-rls-test@odent.test', 'asistente')
    await createStaffUser('doctor-rls-test@odent.test', 'doctor')
    await createStaffUser('admin-rls-test@odent.test', 'admin')
  })

  it('allows an asistente to insert a patient', async () => {
    const client = await signInAs('asistente-rls-test@odent.test')
    const { error } = await client
      .from('patients')
      .insert({ full_name: 'Paciente de prueba' })
    expect(error).toBeNull()
  })

  it('allows a doctor to read patients', async () => {
    const client = await signInAs('doctor-rls-test@odent.test')
    const { data, error } = await client.from('patients').select('*')
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('treatment_events RLS (anti-fraud core)', () => {
  it('rejects an asistente inserting a treatment event', async () => {
    const client = await signInAs('asistente-rls-test@odent.test')
    const { data: patients } = await client.from('patients').select('id').limit(1)
    const { error } = await client.from('treatment_events').insert({
      patient_id: patients![0].id,
      tooth_numbers: [11],
      treatment_type: 'limpieza',
      performed_by: patients![0].id,
    })
    expect(error).not.toBeNull()
  })

  it('allows a doctor to insert a treatment event', async () => {
    const client = await signInAs('doctor-rls-test@odent.test')
    const { data: patients } = await client.from('patients').select('id').limit(1)
    const { data: userData } = await client.auth.getUser()
    const { error } = await client.from('treatment_events').insert({
      patient_id: patients![0].id,
      tooth_numbers: [11],
      treatment_type: 'limpieza',
      performed_by: userData!.user!.id,
    })
    expect(error).toBeNull()
  })

  it('rejects a doctor editing an existing treatment event', async () => {
    const client = await signInAs('doctor-rls-test@odent.test')
    const { data: events } = await client.from('treatment_events').select('id').limit(1)
    const { data: updated, error } = await client
      .from('treatment_events')
      .update({ notes: 'edited by doctor' })
      .eq('id', events![0].id)
      .select()
    expect(error).toBeNull()
    expect(updated).toEqual([])
  })

  it('records an audit_log row when an admin edits a treatment event', async () => {
    const client = await signInAs('admin-rls-test@odent.test')
    const { data: patients } = await client.from('patients').select('id').limit(1)
    const { data: userData } = await client.auth.getUser()
    const adminId = userData!.user!.id

    const { data: created, error: insertError } = await client
      .from('treatment_events')
      .insert({
        patient_id: patients![0].id,
        tooth_numbers: [21],
        treatment_type: 'obturacion',
        performed_by: adminId,
      })
      .select()
      .single()
    expect(insertError).toBeNull()

    const { error: updateError } = await client
      .from('treatment_events')
      .update({ notes: 'updated by admin' })
      .eq('id', created!.id)
    expect(updateError).toBeNull()

    const { data: auditRows, error: auditError } = await client
      .from('audit_log')
      .select('*')
      .eq('record_id', created!.id)
      .eq('action', 'update')
    expect(auditError).toBeNull()
    expect(auditRows).toHaveLength(1)
    expect(auditRows![0].changed_by).toBe(adminId)
    expect(auditRows![0].new_data.notes).toBe('updated by admin')
  })

  it('records an audit_log row when an admin deletes a treatment event', async () => {
    const client = await signInAs('admin-rls-test@odent.test')
    const { data: patients } = await client.from('patients').select('id').limit(1)
    const { data: userData } = await client.auth.getUser()
    const adminId = userData!.user!.id

    const { data: created, error: insertError } = await client
      .from('treatment_events')
      .insert({
        patient_id: patients![0].id,
        tooth_numbers: [22],
        treatment_type: 'extraccion',
        performed_by: adminId,
      })
      .select()
      .single()
    expect(insertError).toBeNull()

    const { error: deleteError } = await client
      .from('treatment_events')
      .delete()
      .eq('id', created!.id)
    expect(deleteError).toBeNull()

    const { data: auditRows, error: auditError } = await client
      .from('audit_log')
      .select('*')
      .eq('record_id', created!.id)
      .eq('action', 'delete')
    expect(auditError).toBeNull()
    expect(auditRows).toHaveLength(1)
    expect(auditRows![0].old_data.treatment_type).toBe('extraccion')
  })
})
