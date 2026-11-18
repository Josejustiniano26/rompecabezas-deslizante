
import { describe, it, expect } from 'vitest'
import {
  crearTablero,
  estaResuelto,
  mover,
  mezclar
} from './puzzle.js'

describe('Rompecabezas deslizante', () => {

  it('Crea un tablero 3x3 ordenado', () => {
    const tablero = crearTablero(3)

    expect(tablero).toEqual([
      1, 2, 3,
      4, 5, 6,
      7, 8, 0
    ])
  })

  it('Permite mover una ficha adyacente', () => {
    const tablero = [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const resultado = mover(tablero, 7, 3)

    expect(resultado).toEqual([
      1, 2, 3,
      4, 5, 6,
      7, 0, 8
    ])
  })

  it('Impide mover una ficha no adyacente', () => {
    const tablero = [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const resultado = mover(tablero, 0, 3)

    expect(resultado).toEqual(tablero)
  })

  it('Detecta un rompecabezas resuelto', () => {
    const tablero = crearTablero(3)

    expect(estaResuelto(tablero)).toBe(true)
  })

  it('Genera un tablero mezclado válido', () => {
    const tablero = mezclar(3, 30)

    expect(tablero).toHaveLength(9)
    expect([...tablero].sort((a, b) => a - b))
      .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])

    expect(estaResuelto(tablero)).toBe(false)
  })

})
