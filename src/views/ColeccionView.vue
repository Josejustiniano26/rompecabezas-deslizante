
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import SaldoMonedas from '../components/SaldoMonedas.vue'
import AvatarJugador from '../components/AvatarJugador.vue'

import {
  obtenerSaldoMonedas
} from '../services/monedasService.js'

import {
  obtenerColeccion,
  comprarImagen,
  seleccionarImagen
} from '../services/imagenesService.js'

import {
  obtenerCosmeticos,
  comprarCosmetico,
  seleccionarCosmetico
} from '../services/cosmeticosService.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const secciones = [
  'tienda',
  'galeria',
  'avatares',
  'marcos'
]

const pestana = ref(
  secciones.includes(route.query.seccion)
    ? route.query.seccion
    : 'tienda'
)

const imagenes = ref([])
const desbloqueadas = ref([])
const seleccionadaId = ref(null)

const cosmeticos = ref([])
const cosmeticosComprados = ref([])
const avatarSeleccionadoId = ref(null)
const marcoSeleccionadoId = ref(null)

const saldo = ref(0)
const cargando = ref(true)
const procesando = ref('')
const error = ref('')
const mensaje = ref('')
const versionSaldo = ref(0)

const fichas = [
  1, 2, 3,
  4, 5, 6,
  7, 8, 0
]

const miGaleria = computed(() =>
  imagenes.value.filter(
    (imagen) => desbloqueadas.value.includes(imagen.id)
  )
)

const avatares = computed(() =>
  cosmeticos.value.filter(
    (item) => item.tipo === 'avatar'
  )
)

const marcos = computed(() =>
  cosmeticos.value.filter(
    (item) => item.tipo === 'marco'
  )
)

const avatarActual = computed(() =>
  cosmeticos.value.find(
    (item) => item.id === avatarSeleccionadoId.value
  ) ?? null
)

const marcoActual = computed(() =>
  cosmeticos.value.find(
    (item) => item.id === marcoSeleccionadoId.value
  ) ?? null
)

function estaComprado(id) {
  return cosmeticosComprados.value.includes(id)
}

function estaSeleccionado(item) {
  if (item.tipo === 'avatar') {
    return avatarSeleccionadoId.value === item.id
  }

  return marcoSeleccionadoId.value === item.id
}

async function cargarColeccion() {
  const [
    coleccion,
    monedas,
    apariencia
  ] = await Promise.all([
    obtenerColeccion(),
    obtenerSaldoMonedas(),
    obtenerCosmeticos()
  ])

  imagenes.value = coleccion.imagenes
  desbloqueadas.value = coleccion.desbloqueadas
  seleccionadaId.value = coleccion.seleccionadaId

  cosmeticos.value = apariencia.catalogo
  cosmeticosComprados.value = apariencia.comprados
  avatarSeleccionadoId.value =
    apariencia.avatarSeleccionadoId
  marcoSeleccionadoId.value =
    apariencia.marcoSeleccionadoId

  saldo.value = monedas
  versionSaldo.value++
}

async function iniciar() {
  cargando.value = true
  error.value = ''

  try {
    await cargarColeccion()
  } catch (err) {
    error.value =
      err.message || 'No se pudo cargar la tienda.'
  } finally {
    cargando.value = false
  }
}

async function comprarFoto(imagen) {
  if (procesando.value) return

  procesando.value = `foto-${imagen.id}`
  error.value = ''
  mensaje.value = ''

  try {
    await comprarImagen(imagen.id)
    await cargarColeccion()

    mensaje.value =
      `${imagen.nombre} ahora está en tu galería.`
  } catch (err) {
    error.value =
      err.message || 'No se pudo comprar la imagen.'
  } finally {
    procesando.value = ''
  }
}

async function elegirFoto(imagenId) {
  if (procesando.value) return

  procesando.value = `foto-${imagenId ?? 'clasico'}`
  error.value = ''
  mensaje.value = ''

  try {
    await seleccionarImagen(imagenId)
    seleccionadaId.value = imagenId

    mensaje.value = imagenId === null
      ? 'Has seleccionado el tablero clásico.'
      : 'Imagen seleccionada para tus próximas partidas.'
  } catch (err) {
    error.value =
      err.message || 'No se pudo seleccionar la imagen.'
  } finally {
    procesando.value = ''
  }
}

async function comprarAccesorio(item) {
  if (procesando.value) return

  procesando.value = `cosmetico-${item.id}`
  error.value = ''
  mensaje.value = ''

  try {
    const resultado = await comprarCosmetico(item.id)
    await cargarColeccion()

    mensaje.value = resultado?.ya_comprado
      ? `${item.nombre} ya está en tu colección.`
      : `${item.nombre} se desbloqueó correctamente.`
  } catch (err) {
    error.value =
      err.message || 'No se pudo completar la compra.'
  } finally {
    procesando.value = ''
  }
}

async function elegirAccesorio(tipo, id = null) {
  if (procesando.value) return

  procesando.value = `elegir-${tipo}-${id ?? 'clasico'}`
  error.value = ''
  mensaje.value = ''

  try {
    const resultado = await seleccionarCosmetico(
      tipo,
      id
    )

    avatarSeleccionadoId.value = resultado.avatar_id
    marcoSeleccionadoId.value = resultado.marco_id

    mensaje.value = id === null
      ? tipo === 'avatar'
        ? 'Has vuelto a tu avatar clásico.'
        : 'Has retirado el marco del perfil.'
      : tipo === 'avatar'
        ? 'Avatar seleccionado para tu perfil.'
        : 'Marco seleccionado para tu perfil.'
  } catch (err) {
    error.value =
      err.message || 'No se pudo actualizar tu perfil.'
  } finally {
    procesando.value = ''
  }
}

onMounted(iniciar)
</script>

<template>
  <main class="page">
    <header class="shop-hero">
      <div>
        <span class="eyebrow">
          Personaliza tu experiencia
        </span>

        <h1 class="page-title">
          Hazlo <span class="gradient-text">tuyo.</span>
        </h1>

        <p class="page-lead">
          Utiliza tus monedas para conseguir imágenes,
          avatares y marcos. Cada recompensa formará
          parte de tu colección personal.
        </p>
      </div>

      <div class="panel shop-wallet">
        <span class="small-muted">
          TU BILLETERA
        </span>

        <SaldoMonedas :key="versionSaldo" />
      </div>
    </header>

    <div
      class="shop-tabs shop-tabs-custom"
      role="tablist"
      aria-label="Categorías de la tienda"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="pestana === 'tienda'"
        :class="{ active: pestana === 'tienda' }"
        @click="pestana = 'tienda'"
      >
        🖼️ Imágenes
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="pestana === 'galeria'"
        :class="{ active: pestana === 'galeria' }"
        @click="pestana = 'galeria'"
      >
        ▦ Mi galería
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="pestana === 'avatares'"
        :class="{ active: pestana === 'avatares' }"
        @click="pestana = 'avatares'"
      >
        ◉ Avatares
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="pestana === 'marcos'"
        :class="{ active: pestana === 'marcos' }"
        @click="pestana = 'marcos'"
      >
        ✧ Marcos
      </button>
    </div>

    <p
      v-if="mensaje"
      class="notice notice-success"
      role="status"
    >
      {{ mensaje }}
    </p>

    <p
      v-if="error"
      class="notice notice-error"
      role="alert"
    >
      {{ error }}
    </p>

    <div
      v-if="cargando"
      class="loading-state"
    >
      Preparando tu colección...
    </div>

    <template v-else-if="pestana === 'tienda'">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Catálogo de imágenes</span>
          <h2>Escenarios por desbloquear</h2>
        </div>

        <span class="micro-chip gold">
          🪙 {{ saldo }} disponibles
        </span>
      </div>

      <div v-if="imagenes.length" class="shop-grid">
        <article
          v-for="imagen in imagenes"
          :key="imagen.id"
          class="shop-card"
        >
          <div class="shop-image">
            <img
              :src="imagen.imagen_url"
              :alt="imagen.nombre"
              loading="lazy"
            >

            <span
              v-if="desbloqueadas.includes(imagen.id)"
              class="shop-tag owned"
            >
              ✓ DESBLOQUEADA
            </span>

            <span v-else class="shop-tag">
              POR DESBLOQUEAR
            </span>
          </div>

          <div class="shop-info">
            <h3>{{ imagen.nombre }}</h3>

            <p>
              {{
                imagen.descripcion ||
                'Una nueva imagen para tu rompecabezas.'
              }}
            </p>

            <div class="shop-price">
              {{
                desbloqueadas.includes(imagen.id)
                  ? '✓ Desbloqueada'
                  : `🪙 ${imagen.costo_monedas}`
              }}
            </div>

            <button
              v-if="desbloqueadas.includes(imagen.id)"
              class="btn btn-block"
              :class="
                seleccionadaId === imagen.id
                  ? 'btn-ghost'
                  : 'btn-outline'
              "
              :disabled="Boolean(procesando)"
              @click="elegirFoto(imagen.id)"
            >
              {{
                seleccionadaId === imagen.id
                  ? '✓ EN USO'
                  : 'USAR IMAGEN'
              }}
            </button>

            <button
              v-else
              class="btn btn-primary btn-block"
              :disabled="
                Boolean(procesando) ||
                saldo < imagen.costo_monedas
              "
              @click="comprarFoto(imagen)"
            >
              {{
                procesando === `foto-${imagen.id}`
                  ? 'COMPRANDO...'
                  : saldo < imagen.costo_monedas
                    ? 'MONEDAS INSUFICIENTES'
                    : 'DESBLOQUEAR'
              }}
            </button>
          </div>
        </article>
      </div>

      <div v-else class="panel empty-state">
        <h3>El catálogo está vacío</h3>
        <p>Las próximas imágenes aparecerán aquí.</p>
      </div>
    </template>

    <template v-else-if="pestana === 'galeria'">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Mis imágenes</span>
          <h2>Listas para jugar</h2>
        </div>

        <span class="micro-chip">
          {{ miGaleria.length + 1 }} opciones
        </span>
      </div>

      <div class="shop-grid">
        <article class="shop-card">
          <div class="shop-number-preview">
            <span
              v-for="numero in fichas"
              :key="numero"
              :class="{ empty: numero === 0 }"
            >
              {{ numero || '' }}
            </span>
          </div>

          <div class="shop-info">
            <h3>Fichas numeradas</h3>

            <p>
              Estilo clásico. Siempre disponible y gratuito.
            </p>

            <div class="shop-price">GRATIS</div>

            <button
              class="btn btn-block"
              :class="
                seleccionadaId === null
                  ? 'btn-ghost'
                  : 'btn-primary'
              "
              :disabled="Boolean(procesando)"
              @click="elegirFoto(null)"
            >
              {{
                seleccionadaId === null
                  ? '✓ EN USO'
                  : 'USAR CLÁSICO'
              }}
            </button>
          </div>
        </article>

        <article
          v-for="imagen in miGaleria"
          :key="imagen.id"
          class="shop-card"
        >
          <div class="shop-image">
            <img
              :src="imagen.imagen_url"
              :alt="imagen.nombre"
              loading="lazy"
            >

            <span
              v-if="seleccionadaId === imagen.id"
              class="shop-tag owned"
            >
              ✓ EN USO
            </span>
          </div>

          <div class="shop-info">
            <h3>{{ imagen.nombre }}</h3>

            <p>
              {{
                imagen.descripcion ||
                'Tu imagen desbloqueada.'
              }}
            </p>

            <div class="shop-price">✓ TUYA</div>

            <button
              class="btn btn-block"
              :class="
                seleccionadaId === imagen.id
                  ? 'btn-ghost'
                  : 'btn-primary'
              "
              :disabled="Boolean(procesando)"
              @click="elegirFoto(imagen.id)"
            >
              {{
                seleccionadaId === imagen.id
                  ? '✓ EN USO'
                  : 'ELEGIR PARA JUGAR'
              }}
            </button>
          </div>
        </article>
      </div>
    </template>

    <template v-else-if="pestana === 'avatares'">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Identidad del jugador</span>
          <h2>Elige tu avatar</h2>
        </div>

        <span class="micro-chip gold">
          🪙 {{ saldo }} monedas
        </span>
      </div>

      <div class="shop-grid">
        <article class="shop-card">
          <div class="cosmetic-display">
            <AvatarJugador
              :nombre="auth.nombreJugador"
              :marco="marcoActual"
              size="xl"
            />
          </div>

          <div class="shop-info">
            <h3>Avatar clásico</h3>
            <p>Utiliza la inicial de tu nombre de jugador.</p>
            <div class="shop-price">GRATIS</div>

            <button
              class="btn btn-block"
              :class="
                avatarSeleccionadoId === null
                  ? 'btn-ghost'
                  : 'btn-primary'
              "
              :disabled="Boolean(procesando)"
              @click="elegirAccesorio('avatar', null)"
            >
              {{
                avatarSeleccionadoId === null
                  ? '✓ EN USO'
                  : 'USAR AVATAR CLÁSICO'
              }}
            </button>
          </div>
        </article>

        <article
          v-for="avatar in avatares"
          :key="avatar.id"
          class="shop-card"
        >
          <div class="cosmetic-display">
            <AvatarJugador
              :nombre="auth.nombreJugador"
              :avatar="avatar"
              :marco="marcoActual"
              size="xl"
            />

            <span
              v-if="estaSeleccionado(avatar)"
              class="cosmetic-tag"
            >
              ✓ EN USO
            </span>
          </div>

          <div class="shop-info">
            <h3>{{ avatar.nombre }}</h3>
            <p>{{ avatar.descripcion }}</p>

            <div class="shop-price">
              {{
                estaComprado(avatar.id)
                  ? '✓ TUYO'
                  : `🪙 ${avatar.costo_monedas}`
              }}
            </div>

            <button
              v-if="estaComprado(avatar.id)"
              class="btn btn-block"
              :class="
                estaSeleccionado(avatar)
                  ? 'btn-ghost'
                  : 'btn-outline'
              "
              :disabled="Boolean(procesando)"
              @click="elegirAccesorio('avatar', avatar.id)"
            >
              {{
                estaSeleccionado(avatar)
                  ? '✓ EN USO'
                  : 'USAR AVATAR'
              }}
            </button>

            <button
              v-else
              class="btn btn-primary btn-block"
              :disabled="
                Boolean(procesando) ||
                saldo < avatar.costo_monedas
              "
              @click="comprarAccesorio(avatar)"
            >
              {{
                procesando === `cosmetico-${avatar.id}`
                  ? 'COMPRANDO...'
                  : saldo < avatar.costo_monedas
                    ? 'MONEDAS INSUFICIENTES'
                    : 'DESBLOQUEAR AVATAR'
              }}
            </button>
          </div>
        </article>
      </div>
    </template>

    <template v-else-if="pestana === 'marcos'">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Estilo de tu perfil</span>
          <h2>Marcos para tu avatar</h2>
        </div>

        <span class="micro-chip gold">
          🪙 {{ saldo }} monedas
        </span>
      </div>

      <div class="shop-grid">
        <article class="shop-card">
          <div class="cosmetic-display">
            <AvatarJugador
              :nombre="auth.nombreJugador"
              :avatar="avatarActual"
              size="xl"
            />
          </div>

          <div class="shop-info">
            <h3>Marco clásico</h3>
            <p>
              El borde original, sin efectos adicionales.
            </p>

            <div class="shop-price">GRATIS</div>

            <button
              class="btn btn-block"
              :class="
                marcoSeleccionadoId === null
                  ? 'btn-ghost'
                  : 'btn-primary'
              "
              :disabled="Boolean(procesando)"
              @click="elegirAccesorio('marco', null)"
            >
              {{
                marcoSeleccionadoId === null
                  ? '✓ EN USO'
                  : 'USAR MARCO CLÁSICO'
              }}
            </button>
          </div>
        </article>

        <article
          v-for="marco in marcos"
          :key="marco.id"
          class="shop-card"
        >
          <div class="cosmetic-display">
            <AvatarJugador
              :nombre="auth.nombreJugador"
              :avatar="avatarActual"
              :marco="marco"
              size="xl"
            />

            <span
              v-if="estaSeleccionado(marco)"
              class="cosmetic-tag"
            >
              ✓ EN USO
            </span>
          </div>

          <div class="shop-info">
            <h3>{{ marco.nombre }}</h3>
            <p>{{ marco.descripcion }}</p>

            <div class="shop-price">
              {{
                estaComprado(marco.id)
                  ? '✓ TUYO'
                  : `🪙 ${marco.costo_monedas}`
              }}
            </div>

            <button
              v-if="estaComprado(marco.id)"
              class="btn btn-block"
              :class="
                estaSeleccionado(marco)
                  ? 'btn-ghost'
                  : 'btn-outline'
              "
              :disabled="Boolean(procesando)"
              @click="elegirAccesorio('marco', marco.id)"
            >
              {{
                estaSeleccionado(marco)
                  ? '✓ EN USO'
                  : 'USAR MARCO'
              }}
            </button>

            <button
              v-else
              class="btn btn-primary btn-block"
              :disabled="
                Boolean(procesando) ||
                saldo < marco.costo_monedas
              "
              @click="comprarAccesorio(marco)"
            >
              {{
                procesando === `cosmetico-${marco.id}`
                  ? 'COMPRANDO...'
                  : saldo < marco.costo_monedas
                    ? 'MONEDAS INSUFICIENTES'
                    : 'DESBLOQUEAR MARCO'
              }}
            </button>
          </div>
        </article>
      </div>
    </template>

    <div class="panel shop-note">
      <strong>Personaliza sin perder tu progreso.</strong>

      Los avatares y marcos son exclusivos de tu perfil.
      Puedes combinarlos libremente una vez comprados.
      Ninguno altera los puntos, las monedas que ganas
      o las reglas del rompecabezas.
    </div>

    <div class="shop-footer">
      <button
        class="btn btn-outline"
        @click="router.push('/perfil')"
      >
        ◉ VER MI PERFIL
      </button>

      <button
        class="btn btn-ghost"
        @click="router.push('/')"
      >
        ← VOLVER AL MENÚ
      </button>
    </div>
  </main>
</template>

<style scoped>
.shop-wallet {
  padding: 15px 20px;
  text-align: center;
  min-width: 145px;
}

.shop-wallet .small-muted {
  display: block;
  margin-bottom: 7px;
}

.shop-tabs-custom {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
}

.shop-tabs-custom button {
  flex-shrink: 0;
  white-space: nowrap;
}

.cosmetic-display {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1.22;
  padding: 25px;
  background:
    radial-gradient(
      circle at 50% 43%,
      rgba(117, 92, 235, 0.31),
      transparent 63%
    ),
    linear-gradient(
      145deg,
      #182543,
      #0b142a
    );
}

.cosmetic-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 1px solid rgba(86, 221, 159, 0.5);
  border-radius: 30px;
  background: rgba(6, 55, 47, 0.75);
  color: #8cf1bd;
  font-size: 10px;
  font-weight: 800;
  padding: 8px 11px;
}

.shop-footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 550px) {
  .shop-wallet {
    align-self: flex-start;
  }

  .shop-tabs-custom {
    width: 100%;
    justify-content: flex-start;
  }

  .shop-tabs-custom button {
    padding: 12px 15px;
    font-size: 12px;
  }

  .cosmetic-display {
    min-height: 220px;
  }

  .shop-footer .btn {
    flex: 1;
  }
}
</style>
