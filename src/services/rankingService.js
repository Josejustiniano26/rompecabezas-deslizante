
import { supabase } from '../lib/supabaseClient.js'
import { useGameStore } from '../stores/gameStore.js'

function dificultadDe(tamano) {
  if (tamano !== 3 && tamano !== 4) {
    throw new Error('Dificultad no válida')
  }

  return `${tamano}x${tamano}`
}

export async function guardarPartida({
  tamano,
  movimientos,
  segundos
}) {
  const store = useGameStore()

  if (store.modo !== 'competitivo') {
    throw new Error(
      'Las partidas casuales no se guardan en la clasificación.'
    )
  }

  if (store.estado !== 'ganado') {
    throw new Error(
      'Debes completar la partida competitiva para guardar puntos.'
    )
  }

  if (
    !Number.isInteger(movimientos) ||
    movimientos < 1 ||
    !Number.isInteger(segundos) ||
    segundos < 0
  ) {
    throw new Error('Resultado de partida inválido.')
  }

  const { data: usuarioData, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  if (!usuarioData.user) {
    throw new Error('Debes iniciar sesión para guardar puntos.')
  }

  const { data, error } = await supabase
    .from('partidas')
    .insert({
      dificultad: dificultadDe(tamano),
      movimientos,
      segundos,
      modo: 'competitivo'
    })
    .select('id, puntos, dificultad, movimientos, segundos, modo')
    .single()

  if (error) throw error

  return data
}

export async function obtenerRanking(tamano) {
  const { data, error } = await supabase.rpc('ranking', {
    p_dificultad: dificultadDe(tamano)
  })

  if (error) throw error

  return data ?? []
}
