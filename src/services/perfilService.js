
import { supabase } from '../lib/supabaseClient.js'

export async function obtenerPerfilJugador() {
  const { data, error } = await supabase.rpc(
    'obtener_perfil_jugador'
  )

  if (error) throw error

  if (!data) {
    throw new Error('No se pudo obtener el perfil del jugador.')
  }

  return data
}
