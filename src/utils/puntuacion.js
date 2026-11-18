
export function calcularPuntos(tamano, movimientos, segundos) {
  const configuraciones = {
    3: {
      puntosBase: 5000,
      factorMovimientos: 30,
      factorTiempo: 300
    },
    4: {
      puntosBase: 12000,
      factorMovimientos: 80,
      factorTiempo: 800
    }
  }

  const config = configuraciones[tamano]

  if (!config) {
    throw new Error('Dificultad no válida')
  }

  if (
    !Number.isInteger(movimientos) ||
    movimientos < 1 ||
    !Number.isInteger(segundos) ||
    segundos < 0
  ) {
    throw new Error('Movimientos o tiempo inválidos')
  }

  const divisor =
    1 +
    movimientos / config.factorMovimientos +
    segundos / config.factorTiempo

  const puntos = config.puntosBase / divisor

  return Math.max(1, Math.round(puntos))
}
