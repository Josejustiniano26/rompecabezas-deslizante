
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

export const versionApariencia = ref(0)

async function obtenerUsuario() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  if (!data.user) {
    throw new Error('Debes iniciar sesión.')
  }

  return data.user
}

export async function obtenerCosmeticos() {
  const usuario = await obtenerUsuario()

  const [
    catalogoResultado,
    comprasResultado,
    aparienciaResultado
  ] = await Promise.all([
    supabase
      .from('cosmeticos')
      .select(
        'id, codigo, tipo, nombre, descripcion, emoji, imagen_url, estilo, costo_monedas, orden'
      )
      .eq('activo', true)
      .order('orden', { ascending: true }),
    supabase
      .from('cosmeticos_comprados')
      .select('cosmetico_id')
      .eq('user_id', usuario.id),
    supabase
      .from('apariencia_jugador')
      .select('avatar_id, marco_id')
      .eq('user_id', usuario.id)
      .maybeSingle()
  ])

  if (catalogoResultado.error) {
    throw catalogoResultado.error
  }

  if (comprasResultado.error) {
    throw comprasResultado.error
  }

  if (aparienciaResultado.error) {
    throw aparienciaResultado.error
  }

  return {
    catalogo: catalogoResultado.data ?? [],
    comprados: (comprasResultado.data ?? []).map(
      (item) => item.cosmetico_id
    ),
    avatarSeleccionadoId:
      aparienciaResultado.data?.avatar_id ?? null,
    marcoSeleccionadoId:
      aparienciaResultado.data?.marco_id ?? null
  }
}

export async function obtenerAparienciasPublicas(userIds) {
  if (!Array.isArray(userIds)) {
    throw new Error('La lista de jugadores es inválida.')
  }

  const ids = [
    ...new Set(userIds.filter(Boolean))
  ]

  if (ids.length === 0) {
    return {}
  }

  if (ids.length > 20) {
    throw new Error('Demasiados jugadores solicitados.')
  }

  const { data, error } = await supabase.rpc(
    'obtener_apariencias_publicas',
    {
      p_user_ids: ids
    }
  )

  if (error) throw error

  const resultado = {}

  for (const item of data ?? []) {
    resultado[item.user_id] = {
      avatar: item.avatar ?? null,
      marco: item.marco ?? null
    }
  }

  return resultado
}

export async function comprarCosmetico(cosmeticoId) {
  const { data, error } = await supabase.rpc(
    'comprar_cosmetico',
    {
      p_cosmetico_id: cosmeticoId
    }
  )

  if (error) throw error

  return data
}

export async function seleccionarCosmetico(
  tipo,
  cosmeticoId = null
) {
  if (!['avatar', 'marco'].includes(tipo)) {
    throw new Error('Tipo de personalización inválido.')
  }

  const { data, error } = await supabase.rpc(
    'seleccionar_cosmetico',
    {
      p_tipo: tipo,
      p_cosmetico_id: cosmeticoId
    }
  )

  if (error) throw error

  versionApariencia.value++

  return data
}
