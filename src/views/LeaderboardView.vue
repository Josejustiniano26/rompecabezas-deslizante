
<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { obtenerRanking } from '../services/rankingService.js'
import { obtenerAparienciasPublicas } from '../services/cosmeticosService.js'
import AvatarJugador from '../components/AvatarJugador.vue'

const router = useRouter()
const auth = useAuthStore()

const tamano = ref(3)
const jugadores = ref([])
const apariencias = ref({})
const cargando = ref(false)
const error = ref('')
const avisoApariencias = ref('')

let solicitud = 0

const podio = computed(() =>
  [2, 1, 3]
    .map((puesto) =>
      jugadores.value.find(
        (jugador) => Number(jugador.puesto) === puesto
      )
    )
    .filter(Boolean)
)

function formatearTiempo(segundos) {
  const total = Number(segundos) || 0
  const minutos = Math.floor(total / 60)
  const resto = total % 60

  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(valor)
}

function mostrarPuesto(puesto) {
  if (Number(puesto) === 1) return '🥇'
  if (Number(puesto) === 2) return '🥈'
  if (Number(puesto) === 3) return '🥉'

  return `#${puesto}`
}

function aparienciaJugador(userId) {
  return apariencias.value[userId] ?? {
    avatar: null,
    marco: null
  }
}

async function cargarRanking() {
  const actual = ++solicitud
  const seleccionado = tamano.value

  cargando.value = true
  error.value = ''
  avisoApariencias.value = ''
  jugadores.value = []
  apariencias.value = {}

  try {
    const datos = await obtenerRanking(seleccionado)

    if (actual !== solicitud) return

    const resultados = Array.isArray(datos)
      ? datos
      : []

    jugadores.value = resultados

    if (resultados.length > 0) {
      try {
        const ids = resultados.map(
          (jugador) => jugador.user_id
        )

        const datosApariencia =
          await obtenerAparienciasPublicas(ids)

        if (actual !== solicitud) return

        apariencias.value = datosApariencia
      } catch (err) {
        if (actual !== solicitud) return

        apariencias.value = {}
        avisoApariencias.value =
          'Las puntuaciones están disponibles, pero no se pudieron cargar las apariencias de los jugadores.'
      }
    }
  } catch (err) {
    if (actual === solicitud) {
      error.value =
        err.message || 'No se pudo cargar la clasificación.'
    }
  } finally {
    if (actual === solicitud) {
      cargando.value = false
    }
  }
}

watch(
  tamano,
  cargarRanking,
  { immediate: true }
)
</script>

<template>
  <main class="page">
    <section class="ranking-banner">
      <span class="ranking-symbol">🏆</span>

      <span class="eyebrow">
        Los mejores del juego
      </span>

      <h1 class="page-title">
        Hall of <span class="gradient-text">fame.</span>
      </h1>

      <p>
        Los movimientos importan. El tiempo también.
        Aquí están los jugadores que lograron
        dominar el rompecabezas.
      </p>
    </section>

    <section class="panel ranking-container">
      <div class="ranking-toolbar">
        <div>
          <span class="eyebrow">
            Clasificación global
          </span>

          <h2 class="ranking-heading">
            Tabla de líderes
          </h2>
        </div>

        <div class="ranking-tools">
          <div
            class="segmented"
            aria-label="Dificultad del ranking"
          >
            <button
              :class="{ active: tamano === 3 }"
              :aria-pressed="tamano === 3"
              @click="tamano = 3"
            >
              Fácil 3×3
            </button>

            <button
              :class="{ active: tamano === 4 }"
              :aria-pressed="tamano === 4"
              @click="tamano = 4"
            >
              Difícil 4×4
            </button>
          </div>

          <button
            class="btn btn-ghost"
            :disabled="cargando"
            @click="cargarRanking"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      <div
        v-if="cargando"
        class="loading-state"
      >
        Cargando los mejores resultados...
      </div>

      <div
        v-else-if="error"
        class="empty-state"
      >
        <p
          class="notice notice-error"
          role="alert"
        >
          {{ error }}
        </p>

        <button
          class="btn btn-outline"
          @click="cargarRanking"
        >
          Reintentar
        </button>
      </div>

      <template v-else-if="jugadores.length">
        <p
          v-if="avisoApariencias"
          class="notice notice-error"
          role="status"
        >
          {{ avisoApariencias }}
        </p>

        <div class="podium">
          <article
            v-for="jugador in podio"
            :key="jugador.user_id"
            class="podium-card"
            :class="{
              first: Number(jugador.puesto) === 1
            }"
          >
            <span class="podium-rank">
              {{ mostrarPuesto(jugador.puesto) }}
            </span>

            <div class="podium-face">
              <AvatarJugador
                :nombre="jugador.nombre_jugador"
                :avatar="
                  aparienciaJugador(jugador.user_id).avatar
                "
                :marco="
                  aparienciaJugador(jugador.user_id).marco
                "
                size="md"
              />
            </div>

            <div class="podium-name">
              {{ jugador.nombre_jugador }}
            </div>

            <div class="podium-score">
              {{
                Number(jugador.puntos)
                  .toLocaleString('es-ES')
              }}
              pts
            </div>

            <span
              v-if="jugador.user_id === auth.usuario?.id"
              class="micro-chip own-label"
            >
              TU PUESTO
            </span>
          </article>
        </div>

        <div class="leader-table-wrap">
          <table class="leader-table">
            <thead>
              <tr>
                <th>PUESTO</th>
                <th>JUGADOR</th>
                <th>PUNTOS</th>
                <th>MOVIMIENTOS</th>
                <th>TIEMPO</th>
                <th>FECHA</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="jugador in jugadores"
                :key="jugador.user_id"
                :class="{
                  me: jugador.user_id === auth.usuario?.id
                }"
              >
                <td>
                  <span class="rank-pill">
                    {{ mostrarPuesto(jugador.puesto) }}
                  </span>
                </td>

                <td class="player-name">
                  <div class="table-player">
                    <AvatarJugador
                      :nombre="jugador.nombre_jugador"
                      :avatar="
                        aparienciaJugador(jugador.user_id).avatar
                      "
                      :marco="
                        aparienciaJugador(jugador.user_id).marco
                      "
                      size="sm"
                    />

                    <div class="table-player-details">
                      <strong>
                        {{ jugador.nombre_jugador }}
                      </strong>

                      <span
                        v-if="jugador.user_id === auth.usuario?.id"
                        class="own-player-tag"
                      >
                        TÚ
                      </span>
                    </div>
                  </div>
                </td>

                <td class="score">
                  {{
                    Number(jugador.puntos)
                      .toLocaleString('es-ES')
                  }}
                </td>

                <td>
                  {{ jugador.movimientos }}
                </td>

                <td>
                  {{ formatearTiempo(jugador.segundos) }}
                </td>

                <td>
                  {{
                    formatearFecha(
                      jugador.creado_en ?? jugador.fecha
                    )
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div
        v-else
        class="empty-state"
      >
        <span class="empty-emoji">✦</span>

        <h3>El podio todavía está libre</h3>

        <p>
          Completa una partida competitiva
          y estrena la clasificación.
        </p>

        <button
          class="btn btn-primary"
          @click="router.push('/jugar')"
        >
          COMENZAR A JUGAR →
        </button>
      </div>
    </section>

    <p class="ranking-footnote">
      Se muestra la mejor partida competitiva de cada jugador.
      Los resultados se ordenan por puntos, tiempo y movimientos.
    </p>
  </main>
</template>

<style scoped>
.ranking-heading {
  font-size: 22px;
  margin: 9px 0 0;
}

.ranking-tools {
  display: flex;
  gap: 9px;
  align-items: center;
  flex-wrap: wrap;
}

.podium-face {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 13px auto;
  min-height: 73px;
}

.podium-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-name {
  width: 100%;
  text-align: center;
}

.own-label {
  margin-top: 12px;
}

.table-player {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.table-player-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.table-player-details strong {
  font-size: 12px;
  font-weight: 800;
  color: #f5f7ff;
  overflow-wrap: anywhere;
}

.own-player-tag {
  width: fit-content;
  border-radius: 6px;
  padding: 3px 6px;
  color: #80e8ed;
  background: rgba(65, 214, 228, 0.12);
  font-size: 9px;
  font-weight: 800;
}

@media (max-width: 600px) {
  .ranking-tools {
    width: 100%;
  }

  .ranking-tools .segmented {
    flex: 1;
  }

  .ranking-tools .segmented button {
    flex: 1;
  }

  .podium-face {
    margin: 10px auto;
    min-height: 58px;
  }

  .podium-face :deep(.avatar-shell) {
    --avatar-size: 53px;
    padding: 4px;
  }

  .podium-name {
    font-size: 11px;
  }
}
</style>
