
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'

import PuzzleScene from '../scenes/PuzzleScene.js'
import { gameEvents, GAME_EVENTS } from '../events/gameEvents.js'
import { useGameStore } from '../stores/gameStore.js'
import { calcularPuntos } from '../utils/puntuacion.js'
import {
  iniciarRonda,
  finalizarRonda,
  abandonarRonda
} from '../services/monedasService.js'
import { obtenerImagenParaJugar } from '../services/imagenesService.js'
import SaldoMonedas from '../components/SaldoMonedas.vue'

const router = useRouter()
const store = useGameStore()
const contenedor = ref(null)
const JUGADOR_ID = 'p1'

const puntosGanados = ref(0)
const monedasGanadas = ref(0)
const guardando = ref(false)
const guardado = ref(false)
const errorGuardado = ref('')
const errorInicio = ref('')
const cargandoInicio = ref(false)
const cargandoMezcla = ref(false)
const versionMonedas = ref(0)

let juego = null
let observador = null
let numeroRonda = 0
let rondaId = null
let historialMovimientos = []
let desmontado = false

function tableroPreparado(datos) {
  if (datos.jugadorId !== JUGADOR_ID) return

  if (
    store.esCompetitivo &&
    (store.estado === 'jugando' || store.estado === 'ganado')
  ) {
    return
  }

  numeroRonda++
  historialMovimientos = []
  puntosGanados.value = 0
  monedasGanadas.value = 0
  guardando.value = false
  guardado.value = false
  errorGuardado.value = ''
  store.iniciarPartida()
}

function fichaMovida(datos) {
  if (
    datos.jugadorId !== JUGADOR_ID ||
    store.estado !== 'jugando'
  ) {
    return
  }

  historialMovimientos.push(datos.ficha)
  store.registrarMovimiento()
}

async function guardarResultado() {
  if (
    store.estado !== 'ganado' ||
    !rondaId ||
    guardando.value ||
    guardado.value
  ) {
    return
  }

  const idActual = rondaId
  const rondaActual = numeroRonda
  const movimientosActuales = [...historialMovimientos]

  guardando.value = true
  errorGuardado.value = ''

  try {
    const resultado = await finalizarRonda(
      idActual,
      movimientosActuales
    )

    if (
      desmontado ||
      rondaId !== idActual ||
      numeroRonda !== rondaActual
    ) {
      return
    }

    monedasGanadas.value = resultado.monedas_ganadas
    guardado.value = true

    if (store.esCompetitivo) {
      puntosGanados.value = resultado.puntos
    }

    store.segundos = resultado.segundos
    store.movimientos = resultado.movimientos

    const minutos = Math.floor(resultado.segundos / 60)
    const resto = resultado.segundos % 60

    store.resultado = {
      dificultad: store.dificultad,
      movimientos: resultado.movimientos,
      tiempo: `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
    }

    versionMonedas.value++
  } catch (error) {
    if (
      !desmontado &&
      rondaId === idActual &&
      numeroRonda === rondaActual
    ) {
      errorGuardado.value =
        error.message || 'No se pudo validar esta partida.'
    }
  } finally {
    if (
      !desmontado &&
      rondaId === idActual &&
      numeroRonda === rondaActual
    ) {
      guardando.value = false
    }
  }
}

function rompecabezasResuelto(datos) {
  if (
    datos.jugadorId !== JUGADOR_ID ||
    store.estado !== 'jugando'
  ) {
    return
  }

  store.registrarVictoria()

  puntosGanados.value = calcularPuntos(
    store.tamano,
    store.movimientos,
    store.segundos
  )

  guardarResultado()
}

function reiniciar() {
  if (
    !store.puedeReiniciar ||
    guardando.value ||
    cargandoMezcla.value
  ) {
    return
  }

  if (store.estado === 'ganado') {
    mezclarTablero()
    return
  }

  gameEvents.emit(GAME_EVENTS.GAME_RESTART, {
    jugadorId: JUGADOR_ID
  })
}

async function mezclarTablero() {
  if (
    !store.puedeMezclar ||
    guardando.value ||
    cargandoMezcla.value
  ) {
    return
  }

  cargandoMezcla.value = true
  errorGuardado.value = ''

  try {
    const ronda = await iniciarRonda(
      store.modo,
      store.tamano
    )

    if (desmontado) {
      await abandonarRonda(ronda.ronda_id)
      return
    }

    rondaId = ronda.ronda_id

    gameEvents.emit(GAME_EVENTS.GAME_SHUFFLE, {
      jugadorId: JUGADOR_ID,
      tablero: ronda.tablero
    })
  } catch (error) {
    if (!desmontado) {
      errorGuardado.value =
        error.message || 'No se pudo generar una mezcla.'
    }
  } finally {
    cargandoMezcla.value = false
  }
}

function crearJuego(tablero, imagenUrl = null) {
  if (desmontado || !contenedor.value) return

  const instancia = new Phaser.Game({
    type: Phaser.AUTO,
    parent: contenedor.value,
    backgroundColor: '#090e1e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 600,
      height: 600
    },
    scene: []
  })

  juego = instancia

  if (typeof ResizeObserver !== 'undefined') {
    observador = new ResizeObserver(() => {
      if (juego === instancia) {
        instancia.scale.refresh()
      }
    })

    observador.observe(contenedor.value)
  }

  instancia.events.once(
    Phaser.Core.Events.READY,
    () => {
      if (juego !== instancia || desmontado) return

      instancia.scene.add(
        'Puzzle',
        PuzzleScene,
        true,
        {
          tamano: store.tamano,
          jugadorId: JUGADOR_ID,
          tablero,
          imagenUrl
        }
      )
    }
  )
}

async function prepararJuego() {
  if (cargandoInicio.value || juego) return

  cargandoInicio.value = true
  errorInicio.value = ''

  try {
    const [ronda, imagenUrl] = await Promise.all([
      iniciarRonda(store.modo, store.tamano),
      obtenerImagenParaJugar().catch(() => null)
    ])

    if (desmontado) {
      await abandonarRonda(ronda.ronda_id)
      return
    }

    rondaId = ronda.ronda_id
    crearJuego(ronda.tablero, imagenUrl)
  } catch (error) {
    if (!desmontado) {
      errorInicio.value =
        error.message || 'No se pudo iniciar la partida.'
    }
  } finally {
    cargandoInicio.value = false
  }
}

onMounted(() => {
  gameEvents.on(
    GAME_EVENTS.BOARD_READY,
    tableroPreparado
  )

  gameEvents.on(
    GAME_EVENTS.TILE_MOVED,
    fichaMovida
  )

  gameEvents.on(
    GAME_EVENTS.PUZZLE_SOLVED,
    rompecabezasResuelto
  )

  prepararJuego()
})

onBeforeUnmount(() => {
  desmontado = true
  const estabaJugando = store.estado === 'jugando'

  observador?.disconnect()

  gameEvents.off(
    GAME_EVENTS.BOARD_READY,
    tableroPreparado
  )

  gameEvents.off(
    GAME_EVENTS.TILE_MOVED,
    fichaMovida
  )

  gameEvents.off(
    GAME_EVENTS.PUZZLE_SOLVED,
    rompecabezasResuelto
  )

  if (rondaId && estabaJugando) {
    abandonarRonda(rondaId).catch(() => {})
  }

  store.volverAlMenu()

  juego?.destroy(true)
  juego = null
})
</script>

<template>
  <main class="page">
    <div class="game-intro">
      <div>
        <span class="eyebrow">
          {{
            store.esCompetitivo
              ? 'Desafío competitivo'
              : 'Práctica casual'
          }}
        </span>

        <h1>
          Es tu
          <span class="gradient-text">movimiento.</span>
        </h1>

        <p>
          Ordena las fichas numéricas.
          Cada decisión te acerca a la victoria.
        </p>
      </div>

      <div class="game-badges">
        <span class="micro-chip">
          ▦ {{ store.tamano }}×{{ store.tamano }}
          · {{ store.tamano === 3 ? 'Fácil' : 'Difícil' }}
        </span>

        <span class="micro-chip gold">
          <SaldoMonedas :key="versionMonedas" />
        </span>
      </div>
    </div>

    <div class="game-grid">
      <section class="panel board-panel">
        <div class="board-panel-header">
          <h2>▦ Tablero de juego</h2>

          <span
            class="micro-chip"
            :class="{ green: store.estado === 'ganado' }"
          >
            {{
              store.estado === 'ganado'
                ? '✓ COMPLETADO'
                : cargandoInicio
                  ? '◷ PREPARANDO'
                  : '● EN PARTIDA'
            }}
          </span>
        </div>

        <div class="board-wrap">
          <div ref="contenedor" class="canvas-host"></div>
        </div>

        <p v-if="cargandoInicio" class="board-note">
          Preparando el desafío...
        </p>

        <div v-else-if="errorInicio" class="action-error">
          <p role="alert">{{ errorInicio }}</p>

          <button
            class="btn btn-outline"
            @click="prepararJuego"
          >
            REINTENTAR
          </button>
        </div>

        <p v-else class="board-note">
          Pulsa una ficha junto al espacio vacío
          para moverla.
        </p>

        <p
          v-if="errorGuardado && store.estado !== 'ganado'"
          class="action-error"
          role="alert"
        >
          {{ errorGuardado }}
        </p>
      </section>

      <aside class="game-sidebar">
        <div class="game-stats">
          <div class="metric">
            <span class="metric-icon">↗</span>
            <small>MOVIMIENTOS</small>
            <strong>{{ store.movimientos }}</strong>
          </div>

          <div class="metric">
            <span class="metric-icon">◷</span>
            <small>TIEMPO</small>
            <strong>{{ store.tiempoFormateado }}</strong>
          </div>

          <div class="metric">
            <span class="metric-icon">✦</span>
            <small>PUNTOS</small>
            <strong>{{ puntosGanados }}</strong>
          </div>
        </div>

        <section
          v-if="store.estado === 'ganado'"
          class="panel victory-card"
        >
          <div class="victory-emoji">🏆</div>

          <span class="eyebrow">Desafío completado</span>

          <h2>¡Lo lograste!</h2>

          <p>
            {{
              store.esCompetitivo
                ? 'Tu resultado entra en la clasificación.'
                : 'La práctica también tiene sus recompensas.'
            }}
          </p>

          <div class="victory-points">
            +{{ puntosGanados }}
          </div>

          <span class="small-muted">
            {{
              store.esCompetitivo
                ? 'PUNTOS COMPETITIVOS'
                : 'PUNTOS DE PRÁCTICA'
            }}
          </span>

          <div class="victory-stats">
            <span>
              ◷ {{ store.resultado?.tiempo }}
            </span>

            <span>
              ↗ {{ store.resultado?.movimientos }} movimientos
            </span>
          </div>

          <p v-if="guardando" class="status-line">
            Validando la victoria en Supabase...
          </p>

          <template v-else-if="guardado">
            <div class="coin-prize">
              🪙 +{{ monedasGanadas }} MONEDAS
            </div>

            <p
              class="status-line"
              :class="monedasGanadas > 0 ? 'good' : ''"
            >
              {{
                monedasGanadas > 0
                  ? '✓ Monedas añadidas a tu saldo.'
                  : 'Sin monedas adicionales por los límites de recompensa.'
              }}
            </p>

            <p
              class="status-line"
              :class="store.esCompetitivo ? 'good' : ''"
            >
              {{
                store.esCompetitivo
                  ? '✓ Resultado guardado en el ranking.'
                  : 'Las partidas casuales no aparecen en el ranking.'
              }}
            </p>
          </template>

          <div v-else-if="errorGuardado">
            <p class="status-line bad" role="alert">
              {{ errorGuardado }}
            </p>

            <button
              class="btn btn-outline btn-block"
              @click="guardarResultado"
            >
              REINTENTAR VALIDACIÓN
            </button>
          </div>

          <button
            class="btn btn-primary btn-block"
            style="margin-top:17px"
            @click="router.push('/ranking')"
          >
            🏆 VER CLASIFICACIÓN
          </button>
        </section>

        <section class="panel sidebar-card">
          <span class="eyebrow">Centro de control</span>

          <h3>
            {{
              store.esCompetitivo
                ? 'Sin segundas oportunidades.'
                : 'Juega a tu ritmo.'
            }}
          </h3>

          <p v-if="store.esCompetitivo">
            Aquí cada movimiento cuenta. No puedes reiniciar
            ni mezclar. Si abandonas la ronda, no sumarás
            puntos ni monedas.
          </p>

          <template v-else>
            <p>
              Puedes recuperar la mezcla inicial o crear
              otro tablero. Una nueva mezcla inicia
              una ronda distinta.
            </p>

            <div class="control-buttons">
              <button
                class="btn btn-primary btn-block"
                :disabled="
                  cargandoMezcla ||
                  guardando ||
                  cargandoInicio
                "
                @click="mezclarTablero"
              >
                {{
                  cargandoMezcla
                    ? 'GENERANDO...'
                    : '⇄ NUEVA MEZCLA'
                }}
              </button>

              <button
                class="btn btn-ghost btn-block"
                :disabled="
                  cargandoMezcla ||
                  guardando ||
                  cargandoInicio
                "
                @click="reiniciar"
              >
                ↺
                {{
                  store.estado === 'ganado'
                    ? 'NUEVA PARTIDA'
                    : 'REINICIAR TABLERO'
                }}
              </button>
            </div>
          </template>

          <button
            class="btn btn-outline btn-block"
            style="margin-top:14px"
            @click="router.push('/')"
          >
            ← VOLVER AL MENÚ
          </button>
        </section>

        <section class="panel sidebar-card">
          <span class="eyebrow">Consejos del jugador</span>

          <h3>Piensa antes de mover.</h3>

          <div class="tip-list">
            <div>
              <b>01</b>
              Visualiza la posición final.
            </div>

            <div>
              <b>02</b>
              Evita movimientos innecesarios.
            </div>

            <div>
              <b>03</b>
              Resuelve con precisión y rapidez.
            </div>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>
