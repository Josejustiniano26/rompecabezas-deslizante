
import Phaser from 'phaser'

export const gameEvents = new Phaser.Events.EventEmitter()

export const GAME_EVENTS = {
  TILE_MOVED: 'tile-moved',
  PUZZLE_SOLVED: 'puzzle-solved',
  GAME_START: 'game-start',
  GAME_RESTART: 'game-restart',
  GAME_SHUFFLE: 'game-shuffle',
  BOARD_READY: 'board-ready'
}
