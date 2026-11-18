
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import puzzles from '../data/puzzles.json'

export const useGameStore = defineStore('game', () => {
  const dificultad = ref('facil')
  const tamano = ref(3)
  const movimientos = ref(0)
  const segundos = ref(0)
  const estado = ref('menu')
  const resultado = ref(null)

  const modo = ref('casual')

  let intervalo = null

  const tiempoFormateado = computed(() => {
    const minutos = Math.floor(segundos.value / 60)
    const resto = segundos.value % 60

    return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
  })

  
  const dificultadActual = computed(() => {
    return puzzles.dificultades.find(
      (nivel) => nivel.id === dificultad.value
    )
  })

  const esCompetitivo = computed(() => {
    return modo.value === 'competitivo'
  })

  
  const puedeReiniciar = computed(() => {
    return modo.value === 'casual'
  })

  const puedeMezclar = computed(() => {
    return modo.value === 'casual'
  })

  
  function seleccionarModo(nuevoModo) {
   
    if (estado.value !== 'menu') return

    const modosValidos = ['casual', 'competitivo']

    if (!modosValidos.includes(nuevoModo)) return

    modo.value = nuevoModo
  }

  
  function seleccionarDificultad(id) {
    const nivel = puzzles.dificultades.find(
      (item) => item.id === id
    )

    if (!nivel) return

    dificultad.value = nivel.id
    tamano.value = nivel.filas
  }

  
  function detenerCronometro() {
    if (intervalo !== null) {
      clearInterval(intervalo)
      intervalo = null
    }
  }

  
  function iniciarPartida() {
    
    if (
      modo.value === 'competitivo' &&
      estado.value === 'jugando'
    ) {
      return
    }

    detenerCronometro()

    movimientos.value = 0
    segundos.value = 0
    estado.value = 'jugando'
    resultado.value = null

    intervalo = setInterval(() => {
      if (estado.value === 'jugando') {
        segundos.value++
      }
    }, 1000)
  }


  function registrarMovimiento() {
    if (estado.value === 'jugando') {
      movimientos.value++
    }
  }

  
  function registrarVictoria() {
    if (estado.value !== 'jugando') return

    detenerCronometro()
    estado.value = 'ganado'

    resultado.value = {
      dificultad: dificultad.value,
      movimientos: movimientos.value,
      tiempo: tiempoFormateado.value
    }
  }

  
  function reiniciarPartida() {
    // Reinicio permitido únicamente en modo casual
    if (!puedeReiniciar.value) return

    iniciarPartida()
  }

 
  function volverAlMenu() {
    detenerCronometro()
    estado.value = 'menu'
  }

  return {
   
    dificultad,
    tamano,
    movimientos,
    segundos,
    estado,
    resultado,

    
    modo,
    esCompetitivo,
    puedeReiniciar,
    puedeMezclar,

    tiempoFormateado,
    dificultadActual,

    seleccionarDificultad,
    iniciarPartida,
    detenerCronometro,
    registrarMovimiento,
    registrarVictoria,
    reiniciarPartida,
    volverAlMenu,

    seleccionarModo
  }
})
