
import Phaser from 'phaser'
import { mover, estaResuelto } from '../utils/puzzle.js'
import { gameEvents, GAME_EVENTS } from '../events/gameEvents.js'
import { useGameStore } from '../stores/gameStore.js'
import puzzles from '../data/puzzles.json'

export default class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Puzzle' })

    this.tamano = 3
    this.jugadorId = 'p1'
    this.tablero = []
    this.tableroInicial = []
    this.tableroServidor = []
    this.fichas = new Map()
    this.animando = false
    this.finalizado = false
    this.store = null
    this.imagenUrl = null
    this.imagenCargada = false
    this.vacioVisual = null
  }

  init(datos = {}) {
    const tamano = Number(datos.tamano ?? 3)

    const valido = puzzles.dificultades.some(
      (nivel) =>
        nivel.filas === tamano &&
        nivel.columnas === tamano
    )

    this.tamano = valido ? tamano : 3
    this.jugadorId = datos.jugadorId ?? 'p1'
    this.store = useGameStore()

    this.tableroServidor = Array.isArray(datos.tablero)
      ? [...datos.tablero]
      : []

    this.imagenUrl = datos.imagenUrl || null
    this.tablero = []
    this.tableroInicial = []
    this.fichas = new Map()
    this.animando = false
    this.finalizado = false
    this.imagenCargada = false
    this.vacioVisual = null
  }

  preload() {
    if (this.imagenUrl) {
      this.load.setCORS('anonymous')
      this.load.image(
        'imagen-rompecabezas',
        this.imagenUrl
      )
    }
  }

  create() {
    this.cameras.main.setBackgroundColor('#090E1E')

    const ancho = this.scale.width
    const alto = this.scale.height

    this.lado = Math.min(ancho - 40, alto - 40, 520)
    this.inicioX = (ancho - this.lado) / 2
    this.inicioY = (alto - this.lado) / 2

    this.add.rectangle(
      ancho / 2,
      alto / 2,
      this.lado + 20,
      this.lado + 20,
      0x121d3c
    ).setStrokeStyle(2, 0x8775fb)

    this.imagenCargada =
      this.imagenUrl !== null &&
      this.textures.exists('imagen-rompecabezas')

    if (this.imagenCargada) {
      this.add.image(
        ancho / 2,
        alto / 2,
        'imagen-rompecabezas'
      ).setDisplaySize(this.lado, this.lado)
    }

    gameEvents.on(
      GAME_EVENTS.GAME_RESTART,
      this.recibirReinicio,
      this
    )

    gameEvents.on(
      GAME_EVENTS.GAME_SHUFFLE,
      this.recibirMezcla,
      this
    )

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.limpiarEventos,
      this
    )

    this.events.once(
      Phaser.Scenes.Events.DESTROY,
      this.limpiarEventos,
      this
    )

    this.nuevaMezcla(this.tableroServidor, true)
  }

  esTableroValido(tablero) {
    const cantidad = this.tamano * this.tamano

    if (
      !Array.isArray(tablero) ||
      tablero.length !== cantidad
    ) {
      return false
    }

    const valores = new Set(tablero)

    if (valores.size !== cantidad) {
      return false
    }

    return tablero.every(
      (valor) =>
        Number.isInteger(valor) &&
        valor >= 0 &&
        valor < cantidad
    ) && !estaResuelto(tablero)
  }

  posicionCasilla(indice) {
    const celda = this.lado / this.tamano
    const fila = Math.floor(indice / this.tamano)
    const columna = indice % this.tamano

    return {
      x: this.inicioX + columna * celda + celda / 2,
      y: this.inicioY + fila * celda + celda / 2
    }
  }

  dibujarTablero() {
    for (const ficha of this.fichas.values()) {
      ficha.rectangulo.destroy()
      ficha.texto.destroy()
    }

    this.fichas.clear()

    if (this.vacioVisual) {
      this.vacioVisual.destroy()
      this.vacioVisual = null
    }

    const celda = this.lado / this.tamano
    const espacio = Math.max(4, celda * 0.052)
    const ladoFicha = celda - espacio * 2

    if (this.imagenCargada) {
      const posicion = this.posicionCasilla(
        this.tablero.indexOf(0)
      )

      this.vacioVisual = this.add.rectangle(
        posicion.x,
        posicion.y,
        ladoFicha,
        ladoFicha,
        0x080f21,
        0.88
      )
    }

    this.tablero.forEach((numero, indice) => {
      if (numero === 0) return

      const { x, y } = this.posicionCasilla(indice)

      const rectangulo = this.add.rectangle(
        x,
        y,
        ladoFicha,
        ladoFicha,
        0x263a72,
        this.imagenCargada ? 0.62 : 1
      )

      rectangulo.setStrokeStyle(
        2,
        0x899aff,
        this.imagenCargada ? 0.85 : 1
      )

      rectangulo.setInteractive({
        useHandCursor: true
      })

      const texto = this.add.text(
        x,
        y,
        String(numero),
        {
          fontFamily: 'Arial',
          fontSize: `${Math.floor(celda * 0.34)}px`,
          color: '#FFFFFF',
          stroke: '#101633',
          strokeThickness: this.imagenCargada ? 5 : 2,
          fontStyle: 'bold'
        }
      ).setOrigin(0.5)

      rectangulo.on(
        'pointerdown',
        () => this.moverFicha(numero)
      )

      this.fichas.set(numero, {
        rectangulo,
        texto
      })
    })
  }

  mostrarImagenCompleta() {
    if (!this.imagenCargada) return

    for (const ficha of this.fichas.values()) {
      ficha.rectangulo.disableInteractive()
      ficha.rectangulo.setVisible(false)
      ficha.texto.setVisible(false)
    }

    if (this.vacioVisual) {
      this.vacioVisual.setVisible(false)
    }
  }

  moverFicha(numero) {
    if (
      this.animando ||
      this.finalizado ||
      this.store.estado !== 'jugando'
    ) {
      return
    }

    const indice = this.tablero.indexOf(numero)
    const vacio = this.tablero.indexOf(0)
    const nuevo = mover(
      this.tablero,
      indice,
      this.tamano
    )

    if (nuevo === this.tablero) return

    this.animando = true
    this.tablero = nuevo

    const destino = this.posicionCasilla(vacio)
    const ficha = this.fichas.get(numero)

    this.tweens.add({
      targets: [
        ficha.rectangulo,
        ficha.texto
      ],
      x: destino.x,
      y: destino.y,
      duration: 180,
      ease: 'Cubic.Out',

      onComplete: () => {
        this.animando = false

        if (this.vacioVisual) {
          const posicion = this.posicionCasilla(indice)

          this.vacioVisual.setPosition(
            posicion.x,
            posicion.y
          )
        }

        gameEvents.emit(
          GAME_EVENTS.TILE_MOVED,
          {
            jugadorId: this.jugadorId,
            ficha: numero,
            desde: indice,
            hasta: vacio
          }
        )

        if (estaResuelto(this.tablero)) {
          this.finalizado = true
          this.mostrarImagenCompleta()

          gameEvents.emit(
            GAME_EVENTS.PUZZLE_SOLVED,
            {
              jugadorId: this.jugadorId,
              tamano: this.tamano,
              resuelto: true
            }
          )
        }
      }
    })
  }

  nuevaMezcla(tableroNuevo, inicial = false) {
    if (!inicial && !this.store.puedeMezclar) return
    if (!this.esTableroValido(tableroNuevo)) return

    if (this.animando) {
      this.tweens.killAll()
      this.animando = false
    }

    this.tableroInicial = [...tableroNuevo]
    this.tablero = [...tableroNuevo]
    this.finalizado = false

    this.dibujarTablero()

    gameEvents.emit(
      GAME_EVENTS.BOARD_READY,
      {
        jugadorId: this.jugadorId,
        tipo: 'mezcla',
        tamano: this.tamano
      }
    )
  }

  reiniciarTablero() {
    if (
      !this.store.puedeReiniciar ||
      this.tableroInicial.length === 0
    ) {
      return
    }

    if (this.animando) {
      this.tweens.killAll()
      this.animando = false
    }

    this.tablero = [...this.tableroInicial]
    this.finalizado = false

    this.dibujarTablero()

    gameEvents.emit(
      GAME_EVENTS.BOARD_READY,
      {
        jugadorId: this.jugadorId,
        tipo: 'reinicio',
        tamano: this.tamano
      }
    )
  }

  recibirReinicio(datos = {}) {
    if (
      datos.jugadorId !== this.jugadorId ||
      !this.store.puedeReiniciar
    ) {
      return
    }

    this.reiniciarTablero()
  }

  recibirMezcla(datos = {}) {
    if (
      datos.jugadorId !== this.jugadorId ||
      !this.store.puedeMezclar
    ) {
      return
    }

    this.nuevaMezcla(datos.tablero)
  }

  limpiarEventos() {
    gameEvents.off(
      GAME_EVENTS.GAME_RESTART,
      this.recibirReinicio,
      this
    )

    gameEvents.off(
      GAME_EVENTS.GAME_SHUFFLE,
      this.recibirMezcla,
      this
    )
  }
}
