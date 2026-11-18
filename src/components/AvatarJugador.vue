
<script setup>
import { computed } from 'vue'

const props = defineProps({
  nombre: {
    type: String,
    default: 'Jugador'
  },
  avatar: {
    type: Object,
    default: null
  },
  marco: {
    type: Object,
    default: null
  },
  size: {
    type: String,
    default: 'lg'
  }
})

const claseMarco = computed(() => {
  const estilos = [
    'neon',
    'cian',
    'fuego',
    'galaxia',
    'oro'
  ]

  return estilos.includes(props.marco?.estilo)
    ? `marco-${props.marco.estilo}`
    : 'marco-clasico'
})

const inicial = computed(() => {
  return props.nombre?.trim()?.charAt(0)?.toUpperCase() || 'J'
})
</script>

<template>
  <div
    class="avatar-shell"
    :class="[claseMarco, `size-${size}`]"
    :aria-label="
      `${avatar?.nombre || 'Avatar clásico'} con ${marco?.nombre || 'marco clásico'}`
    "
  >
    <div class="avatar-inner">
      <img
        v-if="avatar?.imagen_url"
        :src="avatar.imagen_url"
        :alt="avatar.nombre"
      >

      <span
        v-else-if="avatar?.emoji"
        class="avatar-emoji"
      >
        {{ avatar.emoji }}
      </span>

      <span v-else class="avatar-letter">
        {{ inicial }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.avatar-shell {
  --avatar-size: 92px;
  width: var(--avatar-size);
  height: var(--avatar-size);
  flex-shrink: 0;
  padding: 5px;
  border-radius: 28%;
  display: grid;
  place-items: center;
  background: linear-gradient(140deg, #67e0ed, #8b72ef);
  box-shadow: 0 12px 28px rgba(75, 64, 177, 0.34);
}

.size-sm {
  --avatar-size: 38px;
  padding: 3px;
}

.size-md {
  --avatar-size: 68px;
  padding: 4px;
}

.size-xl {
  --avatar-size: 126px;
  padding: 7px;
}

.avatar-inner {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 25%;
  background: radial-gradient(
    circle at 35% 25%,
    #42528e,
    #131c38 85%
  );
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.avatar-emoji {
  font-size: calc(var(--avatar-size) * 0.47);
  line-height: 1;
}

.avatar-letter {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: calc(var(--avatar-size) * 0.5);
  color: #f5f7ff;
  line-height: 1;
}

.marco-clasico {
  background: linear-gradient(140deg, #67e0ed, #8b72ef);
}

.marco-neon {
  background: linear-gradient(
    135deg,
    #e7a9ff,
    #8951ff,
    #6f52f7,
    #e7a9ff
  );
  box-shadow:
    0 0 16px rgba(159, 89, 255, 0.65),
    0 0 32px rgba(132, 91, 255, 0.25);
}

.marco-cian {
  background: linear-gradient(
    135deg,
    #e3ffff,
    #37e7ef,
    #008ab7,
    #e3ffff
  );
  box-shadow:
    0 0 18px rgba(54, 218, 241, 0.6),
    0 0 34px rgba(25, 172, 220, 0.23);
}

.marco-fuego {
  background: linear-gradient(
    135deg,
    #fff4a3,
    #ffb12b,
    #ff4f3e,
    #b72a69,
    #ffde75
  );
  box-shadow:
    0 0 20px rgba(255, 116, 42, 0.65),
    0 0 36px rgba(255, 67, 62, 0.25);
}

.marco-galaxia {
  background: conic-gradient(
    from 30deg,
    #39d8ff,
    #8267ff,
    #e57de8,
    #344dc3,
    #39d8ff
  );
  box-shadow:
    0 0 20px rgba(125, 90, 255, 0.65),
    0 0 35px rgba(59, 212, 255, 0.26);
}

.marco-oro {
  background: linear-gradient(
    135deg,
    #fff9bd,
    #f0be4d,
    #a77522,
    #ffe58e,
    #dba93b
  );
  box-shadow:
    0 0 17px rgba(255, 205, 93, 0.53),
    0 0 31px rgba(234, 174, 39, 0.24);
}

@media (prefers-reduced-motion: no-preference) {
  .marco-galaxia {
    animation: brillo-galaxia 4s ease-in-out infinite;
  }

  @keyframes brillo-galaxia {
    0%, 100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.3);
    }
  }
}
</style>
