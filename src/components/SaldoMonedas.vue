
<script setup>
import { ref, onMounted } from 'vue'
import { obtenerSaldoMonedas } from '../services/monedasService.js'

const saldo = ref(null)
const cargando = ref(true)
const error = ref('')

async function cargarSaldo() {
  cargando.value = true
  error.value = ''

  try {
    saldo.value = await obtenerSaldoMonedas()
  } catch (err) {
    saldo.value = null
    error.value = err.message || 'No se pudo consultar el saldo.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarSaldo)
</script>

<template>
  <div
    class="wallet"
    role="status"
    aria-live="polite"
    :title="error || 'Tu saldo de monedas'"
  >
    <span class="wallet-icon" aria-hidden="true">🪙</span>

    <div class="wallet-info">
      <small>MONEDAS</small>

      <strong v-if="cargando">...</strong>
      <strong v-else-if="error">—</strong>
      <strong v-else>{{ saldo }}</strong>
    </div>
  </div>
</template>

<style scoped>
.wallet {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #1e293b;
  border: 1px solid #6366f166;
  border-radius: 13px;
  color: #f8fafc;
  min-width: 105px;
}

.wallet-icon {
  font-size: 23px;
  line-height: 1;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wallet-info small {
  color: #a5b4fc;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.wallet-info strong {
  color: #facc15;
  font-size: 20px;
  line-height: 1.1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 480px) {
  .wallet {
    padding: 7px 10px;
    gap: 7px;
    min-width: 85px;
  }

  .wallet-icon {
    font-size: 19px;
  }

  .wallet-info small {
    font-size: 8px;
  }

  .wallet-info strong {
    font-size: 17px;
  }
}
</style>
