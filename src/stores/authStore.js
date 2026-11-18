
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

export const useAuthStore = defineStore('auth', () => {
  const sesion = ref(null)
  let promesaInicializacion = null

  const usuario = computed(() => sesion.value?.user ?? null)

  const autenticado = computed(() => Boolean(usuario.value))

  const nombreJugador = computed(() => {
    const datos = usuario.value?.user_metadata
    return datos?.nombre_jugador ||
      usuario.value?.email?.split('@')[0] ||
      'Jugador'
  })

  // Restaurar la sesión y escuchar cambios
  function inicializar() {
    if (!promesaInicializacion) {
      promesaInicializacion = (async () => {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        sesion.value = data.session

        supabase.auth.onAuthStateChange(
          (_evento, nuevaSesion) => {
            sesion.value = nuevaSesion
          }
        )
      })().catch((error) => {
        promesaInicializacion = null
        throw error
      })
    }

    return promesaInicializacion
  }

  // Crear una cuenta
  async function registrar(nombre, correo, clave) {
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim().toLowerCase(),
      password: clave,
      options: {
        data: {
          nombre_jugador: nombre.trim()
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) throw error

    if (data.session) {
      sesion.value = data.session
    }

    return {
      requiereConfirmacion: !data.session
    }
  }

  // Entrar con correo y contraseña
  async function iniciarSesion(correo, clave) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: correo.trim().toLowerCase(),
        password: clave
      })

    if (error) throw error

    sesion.value = data.session
  }

  // Cerrar la sesión
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    sesion.value = null
  }

  return {
    sesion,
    usuario,
    autenticado,
    nombreJugador,
    inicializar,
    registrar,
    iniciarSesion,
    cerrarSesion
  }
})
