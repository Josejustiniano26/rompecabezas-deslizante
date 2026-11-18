
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const modo = ref('login')
const nombre = ref('')
const correo = ref('')
const clave = ref('')
const confirmarClave = ref('')
const mostrarClave = ref(false)
const cargando = ref(false)
const errorMensaje = ref('')
const exitoMensaje = ref('')
const fichas = [1, 2, 3, 4, 0, 6, 7, 5, 8]

function cambiarModo(nuevoModo) {
  modo.value = nuevoModo
  errorMensaje.value = ''
  exitoMensaje.value = ''
  clave.value = ''
  confirmarClave.value = ''
}

function destinoSeguro() {
  const destino = route.query.redirect

  if (
    typeof destino === 'string' &&
    destino.startsWith('/') &&
    !destino.startsWith('//') &&
    !destino.startsWith('/\\')
  ) {
    return destino
  }

  return '/'
}

async function enviarFormulario() {
  if (cargando.value) return

  errorMensaje.value = ''
  exitoMensaje.value = ''

  if (modo.value === 'registro') {
    if (nombre.value.trim().length < 3) {
      errorMensaje.value = 'El nombre debe tener al menos 3 caracteres.'
      return
    }

    if (clave.value !== confirmarClave.value) {
      errorMensaje.value = 'Las contraseñas no coinciden.'
      return
    }
  }

  cargando.value = true

  try {
    if (modo.value === 'registro') {
      const resultado = await auth.registrar(
        nombre.value,
        correo.value,
        clave.value
      )

      if (resultado.requiereConfirmacion) {
        exitoMensaje.value =
          'Revisa tu correo y confirma tu cuenta. Después inicia sesión.'

        clave.value = ''
        confirmarClave.value = ''
        modo.value = 'login'
      } else {
        await router.replace(destinoSeguro())
      }
    } else {
      await auth.iniciarSesion(correo.value, clave.value)
      await router.replace(destinoSeguro())
    }
  } catch (error) {
    errorMensaje.value =
      error.message || 'No se pudo completar la operación.'
  } finally {
    cargando.value = false
  }
}

async function salir() {
  if (cargando.value) return

  cargando.value = true
  errorMensaje.value = ''

  try {
    await auth.cerrarSesion()
  } catch (error) {
    errorMensaje.value =
      error.message || 'No se pudo cerrar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="auth-layout">
    <section class="auth-presentation">
      <div class="shell-brand">
        <span class="brand-symbol"><span>▦</span></span>
        <span class="brand-word">
          SLIDE<span>PUZZLE</span>
          <small>PLAY YOUR WAY</small>
        </span>
      </div>

      <div class="auth-hero">
        <span class="eyebrow">
          Tu próximo desafío comienza aquí
        </span>

        <h1>
          Una ficha.<br>
          Mil caminos.<br>
          <span class="gradient-text">Tu victoria.</span>
        </h1>

        <p>
          Resuelve, supera tus récords, consigue monedas
          y desbloquea imágenes. Cada movimiento cuenta.
        </p>

        <div
          class="auth-demo"
          aria-label="Vista previa de un rompecabezas numérico"
        >
          <div
            v-for="numero in fichas"
            :key="numero"
            :class="{ empty: numero === 0 }"
          >
            {{ numero || '' }}
          </div>
        </div>

        <span class="micro-chip">
          ✦ 3×3 y 4×4 · Casual y competitivo
        </span>
      </div>

      <p class="auth-footer">
        SLIDE PUZZLE · TU RETO, TUS REGLAS
      </p>
    </section>

    <section class="auth-form-side">
      <div class="auth-form-card">
        <template v-if="auth.autenticado">
          <div class="auth-welcome">
            <div class="auth-welcome-icon">✦</div>

            <span class="eyebrow">Sesión activa</span>
            <h2>¡Hola, {{ auth.nombreJugador }}!</h2>

            <p>
              Tu tablero está listo. Continuemos donde lo dejaste.
            </p>

            <button
              class="btn btn-primary btn-block"
              @click="router.push('/')"
            >
              IR AL MENÚ →
            </button>

            <button
              class="auth-link-button"
              style="margin-top:19px"
              :disabled="cargando"
              @click="salir"
            >
              Cerrar sesión
            </button>
          </div>
        </template>

        <template v-else>
          <span class="eyebrow">
            {{
              modo === 'login'
                ? 'Bienvenido de vuelta'
                : 'Únete al desafío'
            }}
          </span>

          <h2>
            {{
              modo === 'login'
                ? 'Entra al juego.'
                : 'Crea tu perfil.'
            }}
          </h2>

          <p>
            {{
              modo === 'login'
                ? 'Ingresa a tu cuenta y sigue acumulando victorias.'
                : 'Solo necesitas unos datos para comenzar a jugar.'
            }}
          </p>

          <div class="auth-tabs">
            <button
              type="button"
              :class="{ active: modo === 'login' }"
              @click="cambiarModo('login')"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              :class="{ active: modo === 'registro' }"
              @click="cambiarModo('registro')"
            >
              Registrarme
            </button>
          </div>

          <form class="auth-form" @submit.prevent="enviarFormulario">
            <label
              v-if="modo === 'registro'"
              class="auth-label"
            >
              Nombre de jugador

              <input
                v-model="nombre"
                class="auth-input"
                type="text"
                placeholder="Tu nombre en la clasificación"
                autocomplete="nickname"
                minlength="3"
                maxlength="24"
                required
              >
            </label>

            <label class="auth-label">
              Correo electrónico

              <input
                v-model="correo"
                class="auth-input"
                type="email"
                placeholder="jugador@correo.com"
                autocomplete="email"
                required
              >
            </label>

            <label class="auth-label">
              Contraseña

              <span class="password-wrap">
                <input
                  v-model="clave"
                  class="auth-input"
                  :type="mostrarClave ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                  :autocomplete="
                    modo === 'registro'
                      ? 'new-password'
                      : 'current-password'
                  "
                  minlength="6"
                  required
                >

                <button
                  type="button"
                  class="password-toggle"
                  @click="mostrarClave = !mostrarClave"
                >
                  {{ mostrarClave ? 'OCULTAR' : 'MOSTRAR' }}
                </button>
              </span>
            </label>

            <label
              v-if="modo === 'registro'"
              class="auth-label"
            >
              Confirmar contraseña

              <input
                v-model="confirmarClave"
                class="auth-input"
                :type="mostrarClave ? 'text' : 'password'"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                minlength="6"
                required
              >
            </label>

            <p
              v-if="errorMensaje"
              class="notice notice-error"
              role="alert"
            >
              {{ errorMensaje }}
            </p>

            <p
              v-if="exitoMensaje"
              class="notice notice-success"
              role="status"
            >
              {{ exitoMensaje }}
            </p>

            <button
              class="btn btn-primary btn-block"
              type="submit"
              :disabled="cargando"
            >
              {{
                cargando
                  ? 'PROCESANDO...'
                  : modo === 'login'
                    ? 'INICIAR SESIÓN →'
                    : 'CREAR CUENTA →'
              }}
            </button>
          </form>

          <p class="auth-bottom">
            {{
              modo === 'login'
                ? '¿Aún no tienes una cuenta?'
                : '¿Ya tienes una cuenta?'
            }}

            <button
              type="button"
              @click="
                cambiarModo(
                  modo === 'login' ? 'registro' : 'login'
                )
              "
            >
              {{
                modo === 'login'
                  ? 'Regístrate'
                  : 'Inicia sesión'
              }}
            </button>
          </p>
        </template>

        <p
          v-if="auth.autenticado && errorMensaje"
          class="notice notice-error"
          role="alert"
        >
          {{ errorMensaje }}
        </p>
      </div>
    </section>
  </main>
</template>
