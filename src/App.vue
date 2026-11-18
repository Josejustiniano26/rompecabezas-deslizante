
<script setup>
import { ref, computed, watch } from 'vue'
import {
  RouterView,
  RouterLink,
  useRoute,
  useRouter
} from 'vue-router'

import { useAuthStore } from './stores/authStore.js'
import AvatarJugador from './components/AvatarJugador.vue'

import {
  obtenerCosmeticos,
  versionApariencia
} from './services/cosmeticosService.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const cerrando = ref(false)
const errorSalida = ref('')
const avatarActual = ref(null)
const marcoActual = ref(null)

let solicitudApariencia = 0

const mostrarBarra = computed(() =>
  auth.autenticado && route.name !== 'login'
)

async function cargarApariencia() {
  const solicitudActual = ++solicitudApariencia

  if (!auth.autenticado || !auth.usuario?.id) {
    avatarActual.value = null
    marcoActual.value = null
    return
  }

  try {
    const datos = await obtenerCosmeticos()

    if (solicitudActual !== solicitudApariencia) {
      return
    }

    avatarActual.value = datos.catalogo.find(
      (item) =>
        item.tipo === 'avatar' &&
        item.id === datos.avatarSeleccionadoId
    ) ?? null

    marcoActual.value = datos.catalogo.find(
      (item) =>
        item.tipo === 'marco' &&
        item.id === datos.marcoSeleccionadoId
    ) ?? null
  } catch (error) {
    if (solicitudActual === solicitudApariencia) {
      avatarActual.value = null
      marcoActual.value = null
    }
  }
}

watch(
  () => [
    auth.usuario?.id,
    auth.autenticado,
    route.fullPath,
    versionApariencia.value
  ],
  cargarApariencia,
  { immediate: true }
)

async function cerrarSesion() {
  if (cerrando.value) return

  cerrando.value = true
  errorSalida.value = ''

  try {
    await auth.cerrarSesion()

    avatarActual.value = null
    marcoActual.value = null

    await router.replace('/login')
  } catch (error) {
    errorSalida.value =
      error.message || 'No se pudo cerrar sesión.'
  } finally {
    cerrando.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <header
      v-if="mostrarBarra"
      class="shell-header"
    >
      <div class="shell-inner">
        <RouterLink
          to="/"
          class="shell-brand"
          aria-label="Volver al inicio"
        >
          <span class="brand-symbol">
            <span>▦</span>
          </span>

          <span class="brand-word">
            SLIDE<span>PUZZLE</span>
            <small>PLAY YOUR WAY</small>
          </span>
        </RouterLink>

        <nav
          class="shell-navigation"
          aria-label="Navegación principal"
        >
          <RouterLink
            to="/"
            exact-active-class="nav-current"
          >
            Inicio
          </RouterLink>

          <RouterLink
            to="/ranking"
            active-class="nav-current"
          >
            Ranking
          </RouterLink>

          <RouterLink
            to="/coleccion"
            active-class="nav-current"
          >
            Tienda
          </RouterLink>

          <RouterLink
            to="/perfil"
            active-class="nav-current"
          >
            Mi perfil
          </RouterLink>
        </nav>

        <div class="shell-user">
          <RouterLink
            to="/perfil"
            class="user-chip"
            title="Ver mi perfil"
          >
            <AvatarJugador
              :nombre="auth.nombreJugador"
              :avatar="avatarActual"
              :marco="marcoActual"
              size="sm"
            />

            <span class="user-name">
              {{ auth.nombreJugador }}
            </span>
          </RouterLink>

          <button
            class="icon-action"
            :disabled="cerrando"
            :title="
              cerrando
                ? 'Saliendo...'
                : 'Cerrar sesión'
            "
            aria-label="Cerrar sesión"
            @click="cerrarSesion"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <p
      v-if="errorSalida"
      class="global-error"
      role="alert"
    >
      {{ errorSalida }}
    </p>

    <RouterView />
  </div>
</template>
