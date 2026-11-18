
import { supabase } from '../lib/supabaseClient.js'

async function obtenerUsuario() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  if (!data.user) {
    throw new Error('Debes iniciar sesión.')
  }

  return data.user
}

export async function obtenerColeccion() {
  const usuario = await obtenerUsuario()

  const [
    catalogoResultado,
    desbloqueosResultado,
    seleccionResultado
  ] = await Promise.all([
    supabase
      .from('imagenes')
      .select('id, codigo, nombre, descripcion, imagen_url, costo_monedas, orden')
      .eq('activa', true)
      .order('orden', { ascending: true }),
    supabase
      .from('imagenes_desbloqueadas')
      .select('imagen_id')
      .eq('user_id', usuario.id),
    supabase
      .from('imagen_seleccionada_jugador')
      .select('imagen_id')
      .eq('user_id', usuario.id)
      .maybeSingle()
  ])

  if (catalogoResultado.error) {
    throw catalogoResultado.error
  }

  if (desbloqueosResultado.error) {
    throw desbloqueosResultado.error
  }

  if (seleccionResultado.error) {
    throw seleccionResultado.error
  }

  return {
    imagenes: catalogoResultado.data ?? [],
    desbloqueadas: (
      desbloqueosResultado.data ?? []
    ).map((item) => item.imagen_id),
    seleccionadaId:
      seleccionResultado.data?.imagen_id ?? null
  }
}

export async function comprarImagen(imagenId) {
  const { data, error } = await supabase.rpc(
    'comprar_imagen',
    {
      p_imagen_id: imagenId
    }
  )

  if (error) throw error

  return data
}

export async function seleccionarImagen(imagenId) {
  const { data, error } = await supabase.rpc(
    'seleccionar_imagen',
    {
      p_imagen_id: imagenId
    }
  )

  if (error) throw error

  return data
}

export async function obtenerImagenParaJugar() {
  const coleccion = await obtenerColeccion()

  if (coleccion.seleccionadaId === null) {
    return null
  }

  if (
    !coleccion.desbloqueadas.includes(
      coleccion.seleccionadaId
    )
  ) {
    return null
  }

  const imagen = coleccion.imagenes.find(
    (item) => item.id === coleccion.seleccionadaId
  )

  return imagen?.imagen_url ?? null
}
