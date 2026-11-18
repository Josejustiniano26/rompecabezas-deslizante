
import { supabase } from '../lib/supabaseClient.js'

export async function obtenerSaldoMonedas() {
  const { data: usuarioData, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  if (!usuarioData.user) {
    throw new Error('Debes iniciar sesión para consultar tus monedas.')
  }

  const { data, error } = await supabase
    .from('monedas_jugador')
    .select('saldo')
    .eq('user_id', usuarioData.user.id)
    .maybeSingle()

  if (error) throw error

  return data?.saldo ?? 0
}

export async function iniciarRonda(modo, tamano) {
  if (!['casual', 'competitivo'].includes(modo)) {
    throw new Error('Modo de juego inválido.')
  }

  if (tamano !== 3 && tamano !== 4) {
    throw new Error('Dificultad inválida.')
  }

  const { data, error } = await supabase.rpc(
    'iniciar_ronda',
    {
      p_modo: modo,
      p_dificultad: `${tamano}x${tamano}`
    }
  )

  if (error) throw error

  if (
    !data?.ronda_id ||
    !Array.isArray(data.tablero) ||
    data.tablero.length !== tamano * tamano
  ) {
    throw new Error('Supabase devolvió un tablero inválido.')
  }

  return data
}

export async function finalizarRonda(rondaId, movimientos) {
  if (!rondaId) {
    throw new Error('No existe una ronda activa.')
  }

  if (!Array.isArray(movimientos) || movimientos.length === 0) {
    throw new Error('No hay movimientos para validar.')
  }

  const { data, error } = await supabase.rpc(
    'finalizar_ronda',
    {
      p_ronda_id: rondaId,
      p_movimientos: movimientos
    }
  )

  if (error) throw error

  if (!data || data.ronda_id !== rondaId) {
    throw new Error('No se recibió un resultado válido.')
  }

  return data
}

export async function abandonarRonda(rondaId) {
  if (!rondaId) return

  const { error } = await supabase.rpc(
    'abandonar_ronda',
    {
      p_ronda_id: rondaId
    }
  )

  if (error) throw error
}
