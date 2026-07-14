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
