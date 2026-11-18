
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerPerfilJugador } from '../services/perfilService.js'
import { obtenerCosmeticos } from '../services/cosmeticosService.js'
import AvatarJugador from '../components/AvatarJugador.vue'

const router = useRouter()

const perfil = ref(null)
const apariencia = ref(null)
const cargando = ref(true)
const error = ref('')

const imagenes = computed(() =>
  perfil.value?.imagenes ?? []
)

const avatarActual = computed(() =>
  apariencia.value?.catalogo.find(
    (item) =>
      item.id === apariencia.value.avatarSeleccionadoId &&
      item.tipo === 'avatar'
  ) ?? null
)

const marcoActual = computed(() =>
  apariencia.value?.catalogo.find(
    (item) =>
      item.id === apariencia.value.marcoSeleccionadoId &&
      item.tipo === 'marco'
  ) ?? null
)

const porcentajeVictorias = computed(() => {
  if (!perfil.value?.partidas_totales) return 0

  return Math.round(
    perfil.value.victorias_totales /
    perfil.value.partidas_totales * 100
  )
})

function formatearTiempo(segundos) {
  const total = Number(segundos) || 0
  const minutos = Math.floor(total / 60)
  const resto = total % 60

  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

async function cargarPerfil() {
  cargando.value = true
  error.value = ''

  try {
    const [datosPerfil, datosApariencia] = await Promise.all([
      obtenerPerfilJugador(),
      obtenerCosmeticos()
    ])

    perfil.value = datosPerfil
    apariencia.value = datosApariencia
  } catch (err) {
    error.value =
      err.message || 'No se pudo cargar tu perfil.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPerfil)
</script>

<template>
  <main class="page">
    <div v-if="cargando" class="loading-state">
      Cargando tu espacio de jugador...
    </div>

    <div
      v-else-if="error"
      class="panel empty-state"
    >
      <p
        class="notice notice-error"
        role="alert"
      >
        {{ error }}
      </p>

      <button
        class="btn btn-outline"
        @click="cargarPerfil"
      >
        Reintentar
      </button>
    </div>

    <template v-else-if="perfil">
      <section class="profile-cover">
        <div class="profile-identity">
          <AvatarJugador
            :nombre="perfil.nombre_jugador"
            :avatar="avatarActual"
            :marco="marcoActual"
            size="xl"
          />

          <div class="profile-details">
            <span class="eyebrow">
              Tu identidad en el juego
            </span>

            <h1>{{ perfil.nombre_jugador }}</h1>

            <p class="small-muted">
              Cada ficha cuenta. Este es tu recorrido.
            </p>

            <div class="equipped-items">
              <span>
                ◉ {{ avatarActual?.nombre || 'Avatar clásico' }}
              </span>

              <span>
                ✧ {{ marcoActual?.nombre || 'Marco clásico' }}
              </span>
            </div>

            <button
              class="customize-link"
              @click="
                router.push('/coleccion?seccion=avatares')
              "
            >
              ✦ PERSONALIZAR PERFIL →
            </button>
          </div>
        </div>

        <div class="profile-wallet">
          <span>🪙</span>

          <div>
            <small>SALDO DISPONIBLE</small>
            <strong>{{ perfil.saldo }}</strong>
          </div>
        </div>
      </section>

      <section class="profile-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">
              Tu recorrido
            </span>

            <h2>Estadísticas del jugador</h2>
          </div>

          <span class="micro-chip green">
            ● PERFIL ACTIVO
          </span>
        </div>

        <div class="profile-stats">
          <div class="profile-stat">
            <span class="stat-symbol">▦</span>
            <small>PARTIDAS INICIADAS</small>
            <strong>{{ perfil.partidas_totales }}</strong>
          </div>

          <div class="profile-stat">
            <span class="stat-symbol">✓</span>
            <small>VICTORIAS TOTALES</small>
            <strong>{{ perfil.victorias_totales }}</strong>
          </div>

          <div class="profile-stat">
            <span class="stat-symbol">◇</span>
            <small>VICTORIAS CASUALES</small>
            <strong>{{ perfil.victorias_casuales }}</strong>
          </div>

          <div class="profile-stat">
            <span
              class="stat-symbol"
              style="color:#ffcb70"
            >
              ✦
            </span>

            <small>VICTORIAS COMPETITIVAS</small>

            <strong>
              {{ perfil.victorias_competitivas }}
            </strong>
          </div>
        </div>

        <div class="profile-extras">
          <div class="profile-extra">
            <small>PORCENTAJE DE VICTORIAS</small>
            <strong>{{ porcentajeVictorias }}%</strong>

            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{
                  width: porcentajeVictorias + '%'
                }"
              ></div>
            </div>
          </div>

          <div class="profile-extra">
            <small>PARTIDAS ABANDONADAS</small>

            <strong>
              {{ perfil.partidas_abandonadas }}
            </strong>
          </div>

          <div class="profile-extra">
            <small>MONEDAS GANADAS EN TOTAL</small>

            <strong>
              🪙 {{ perfil.monedas_obtenidas }}
            </strong>
          </div>
        </div>
      </section>

      <section class="profile-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">
              Compite contigo mismo
            </span>

            <h2>Récords personales</h2>
          </div>

          <button
            class="btn btn-outline"
            @click="router.push('/ranking')"
          >
            VER RANKING ↗
          </button>
        </div>

        <div class="record-grid">
          <article class="record-card">
            <div class="record-top">
              <span>▦ FÁCIL</span>
              <span class="micro-chip">3 × 3</span>
            </div>

            <h3>Mejor puntuación</h3>

            <template v-if="perfil.mejor_3x3">
              <div class="record-score">
                {{
                  Number(perfil.mejor_3x3.puntos)
                    .toLocaleString('es-ES')
                }}

                <span style="font-size:13px">
                  PTS
                </span>
              </div>

              <div class="record-meta">
                <span>
                  ↗ {{ perfil.mejor_3x3.movimientos }} movimientos
                </span>

                <span>
                  ◷ {{ formatearTiempo(perfil.mejor_3x3.segundos) }}
                </span>
              </div>
            </template>

            <p v-else class="small-muted">
              Completa una partida competitiva 3×3
              para establecer tu marca.
            </p>
          </article>

          <article class="record-card">
            <div class="record-top">
              <span>✦ DIFÍCIL</span>
              <span class="micro-chip">4 × 4</span>
            </div>

            <h3>Mejor puntuación</h3>

            <template v-if="perfil.mejor_4x4">
              <div class="record-score">
                {{
                  Number(perfil.mejor_4x4.puntos)
                    .toLocaleString('es-ES')
                }}

                <span style="font-size:13px">
                  PTS
                </span>
              </div>

              <div class="record-meta">
                <span>
                  ↗ {{ perfil.mejor_4x4.movimientos }} movimientos
                </span>

                <span>
                  ◷ {{ formatearTiempo(perfil.mejor_4x4.segundos) }}
                </span>
              </div>
            </template>

            <p v-else class="small-muted">
              Completa una partida competitiva 4×4
              para establecer tu marca.
            </p>
          </article>
        </div>

        <p
          class="small-muted"
          style="margin-top:12px"
        >
          Los récords se calculan únicamente con partidas
          competitivas. Las victorias casuales
          se registran por separado.
        </p>
      </section>

      <section class="profile-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">
              Recompensas conseguidas
            </span>

            <h2>Mi colección de imágenes</h2>
          </div>

          <span class="micro-chip">
            {{ imagenes.length }} desbloqueadas
          </span>
        </div>

        <div
          v-if="imagenes.length"
          class="profile-gallery"
        >
          <article
            v-for="imagen in imagenes"
            :key="imagen.id"
            class="profile-image"
          >
            <img
              :src="imagen.imagen_url"
              :alt="imagen.nombre"
              loading="lazy"
            >

            <div>
              <strong>{{ imagen.nombre }}</strong>
              <small>✓ DESBLOQUEADA</small>
            </div>
          </article>
        </div>

        <div v-else class="profile-gallery-empty">
          🖼️

          <p>
            Todavía no has desbloqueado imágenes.
            Gana monedas jugando y encuentra tu favorita.
          </p>
        </div>

        <div class="profile-actions">
          <button
            class="btn btn-primary"
            @click="router.push('/coleccion')"
          >
            EXPLORAR TIENDA →
          </button>

          <button
            class="btn btn-ghost"
            @click="router.push('/')"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.profile-details {
  min-width: 0;
}

.equipped-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.equipped-items span {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(162, 146, 255, 0.27);
  border-radius: 30px;
  background: rgba(126, 102, 229, 0.12);
  color: #c6baff;
  padding: 7px 10px;
  font-size: 10px;
  font-weight: 800;
}

.customize-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  border: 1px solid rgba(116, 224, 238, 0.4);
  border-radius: 11px;
  background: rgba(67, 203, 212, 0.1);
  padding: 11px 14px;
  color: #81e8ee;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

.customize-link:hover {
  background: rgba(67, 203, 212, 0.19);
  transform: translateY(-2px);
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 550px) {
  .profile-identity {
    align-items: flex-start;
  }

  .profile-identity :deep(.avatar-shell) {
    --avatar-size: 82px;
    padding: 5px;
  }

  .equipped-items {
    gap: 6px;
  }

  .equipped-items span {
    font-size: 9px;
    padding: 6px 8px;
  }

  .customize-link {
    font-size: 10px;
    padding: 10px;
  }
}
</style>
