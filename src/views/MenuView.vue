
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import SaldoMonedas from '../components/SaldoMonedas.vue'

const router = useRouter()
const store = useGameStore()

const mostrarInstrucciones = ref(false)

const fichasVistaPrevia = computed(() => {
  if (store.tamano === 4) {
    return [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 0, 14, 15
    ]
  }

  return [
    1, 2, 3,
    4, 0, 6,
    7, 5, 8
  ]
})

const nombreModo = computed(() => {
  return store.modo === 'competitivo'
    ? 'Competitivo'
    : 'Casual'
})

const nombreDificultad = computed(() => {
  return store.tamano === 4
    ? 'Difícil'
    : 'Fácil'
})

function jugar() {
  router.push('/jugar')
}
</script>

<template>
  <main class="home-page">
    <div class="home-container">
      <section class="home-hero">
        <div class="home-introduction">
          <div class="hero-label">
            <span class="label-star">✦</span>
            EL DESAFÍO COMIENZA AQUÍ
          </div>

          <h1 class="hero-title">
            Piensa.<br>
            Desliza.<br>
            <span>Resuelve.</span>
          </h1>

          <p class="hero-description">
            El clásico rompecabezas deslizante,
            reinventado para desafiarte.
            Ordena las fichas, supera tus récords
            y desbloquea nuevas imágenes.
          </p>

          <div class="hero-features">
            <span>
              <span class="feature-icon">▦</span>
              2 dificultades
            </span>

            <span>
              <span class="feature-icon">✦</span>
              2 modos de juego
            </span>

            <span>
              <span class="feature-icon">◈</span>
              Recompensas
            </span>
          </div>
        </div>

        <div class="preview-panel">
          <div class="preview-top">
            <div class="preview-labels">
              <span class="preview-eyebrow">
                VISTA PREVIA
              </span>

              <strong>
                {{ store.tamano }}×{{ store.tamano }}
                · {{ nombreDificultad }}
              </strong>
            </div>

            <span class="ready-tag">
              <span class="ready-dot"></span>
              READY TO PLAY
            </span>
          </div>

          <div class="preview-board-area">
            <div
              class="preview-board"
              :class="{ 'hard-board': store.tamano === 4 }"
              :style="{ '--board-size': store.tamano }"
            >
              <div
                v-for="(numero, indice) in fichasVistaPrevia"
                :key="`${store.tamano}-${indice}`"
                class="preview-tile"
                :class="{ 'empty-tile': numero === 0 }"
              >
                {{ numero === 0 ? '' : numero }}
              </div>
            </div>
          </div>

          <div class="preview-bottom">
            <span>UN MOVIMIENTO PUEDE CAMBIARLO TODO</span>
            <span class="preview-decoration">✦</span>
          </div>
        </div>
      </section>

      <section class="configuration-panel">
        <div class="configuration-header">
          <div>
            <span class="configuration-eyebrow">
              CONFIGURA TU DESAFÍO
            </span>

            <h2>Prepara tu partida</h2>

            <p>
              Elige cómo quieres jugar y comienza
              cuando estés listo.
            </p>
          </div>

          <div class="wallet-container">
            <span class="wallet-label">TU SALDO</span>
            <SaldoMonedas />
          </div>
        </div>

        <div class="configuration-grid">
          <div class="configuration-group">
            <div class="group-heading">
              <span class="group-number">01</span>

              <div>
                <h3>Modo de juego</h3>
                <p>¿Cómo quieres jugar?</p>
              </div>
            </div>

            <div class="selection-options">
              <button
                type="button"
                class="selection-card"
                :class="{ selected: store.modo === 'casual' }"
                :aria-pressed="store.modo === 'casual'"
                @click="store.seleccionarModo('casual')"
              >
                <span class="selection-icon casual-icon">
                  ◇
                </span>

                <span class="selection-content">
                  <strong>Casual</strong>
                  <small>
                    Practica, reinicia y mezcla libremente.
                  </small>
                </span>

                <span
                  v-if="store.modo === 'casual'"
                  class="selection-check"
                >
                  ✓
                </span>
              </button>

              <button
                type="button"
                class="selection-card"
                :class="{ selected: store.modo === 'competitivo' }"
                :aria-pressed="store.modo === 'competitivo'"
                @click="store.seleccionarModo('competitivo')"
              >
                <span class="selection-icon competitive-icon">
                  ✦
                </span>

                <span class="selection-content">
                  <strong>Competitivo</strong>
                  <small>
                    Sin reinicios, con ranking y más monedas.
                  </small>
                </span>

                <span
                  v-if="store.modo === 'competitivo'"
                  class="selection-check"
                >
                  ✓
                </span>
              </button>
            </div>
          </div>

          <div class="configuration-group">
            <div class="group-heading">
              <span class="group-number">02</span>

              <div>
                <h3>Dificultad</h3>
                <p>Selecciona tu nivel.</p>
              </div>
            </div>

            <div class="selection-options">
              <button
                type="button"
                class="selection-card"
                :class="{ selected: store.dificultad === 'facil' }"
                :aria-pressed="store.dificultad === 'facil'"
                @click="store.seleccionarDificultad('facil')"
              >
                <span class="selection-icon easy-icon">
                  ▦
                </span>

                <span class="selection-content">
                  <strong>Fácil</strong>
                  <small>3×3 · 8 fichas numeradas</small>
                </span>

                <span
                  v-if="store.dificultad === 'facil'"
                  class="selection-check"
                >
                  ✓
                </span>
              </button>

              <button
                type="button"
                class="selection-card"
                :class="{ selected: store.dificultad === 'dificil' }"
                :aria-pressed="store.dificultad === 'dificil'"
                @click="store.seleccionarDificultad('dificil')"
              >
                <span class="selection-icon hard-icon">
                  ▦
                </span>

                <span class="selection-content">
                  <strong>Difícil</strong>
                  <small>4×4 · 15 fichas numeradas</small>
                </span>

                <span
                  v-if="store.dificultad === 'dificil'"
                  class="selection-check"
                >
                  ✓
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="configuration-footer">
          <div class="selected-summary">
            <span class="summary-label">
              TU PARTIDA
            </span>

            <div class="summary-values">
              <span>{{ nombreModo }}</span>

              <span class="summary-divider">/</span>

              <span>
                {{ nombreDificultad }}
                {{ store.tamano }}×{{ store.tamano }}
              </span>
            </div>
          </div>

          <div class="footer-actions">
            <button
              type="button"
              class="instructions-button"
              @click="mostrarInstrucciones = true"
            >
              <span>ⓘ</span>
              Cómo se juega
            </button>

            <button
              type="button"
              class="start-button"
              @click="jugar"
            >
              JUGAR AHORA
              <span class="start-arrow">↗</span>
            </button>
          </div>
        </div>
      </section>

      <p class="home-footer">
        SLIDE PUZZLE
        <span>·</span>
        PIENSA. DESLIZA. RESUELVE.
      </p>
    </div>

    <div
      v-if="mostrarInstrucciones"
      class="tutorial-overlay"
      @click.self="mostrarInstrucciones = false"
    >
      <section
        class="tutorial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <div class="tutorial-header">
          <span class="tutorial-label">
            GUÍA RÁPIDA
          </span>

          <button
            type="button"
            class="close-tutorial"
            aria-label="Cerrar instrucciones"
            @click="mostrarInstrucciones = false"
          >
            ✕
          </button>
        </div>

        <h2 id="tutorial-title">
          ¿Cómo se juega?
        </h2>

        <p class="tutorial-description">
          Tu objetivo es ordenar todas las fichas
          numéricas y dejar el espacio vacío al final.
        </p>

        <div class="tutorial-steps">
          <div class="tutorial-step">
            <span>01</span>

            <p>
              Selecciona una ficha junto
              al espacio vacío.
            </p>
          </div>

          <div class="tutorial-step">
            <span>02</span>

            <p>
              Muévela horizontal o verticalmente.
            </p>
          </div>

          <div class="tutorial-step">
            <span>03</span>

            <p>
              Ordena todos los números para ganar
              y conseguir recompensas.
            </p>
          </div>
        </div>

        <div class="tutorial-info">
          <span>✦</span>

          <p>
            Si tienes una imagen seleccionada, aparecerá
            detrás de los números. La imagen completa
            se revelará cuando resuelvas el tablero.
          </p>
        </div>

        <button
          type="button"
          class="start-button tutorial-accept"
          @click="mostrarInstrucciones = false"
        >
          ¡ENTENDIDO!
        </button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 80px);
  padding: 34px 24px 28px;
  color: #f5f7ff;
}

.home-container {
  max-width: 1190px;
  margin: 0 auto;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: 38px;
  align-items: center;
  margin-bottom: 27px;
}

.home-introduction {
  min-width: 0;
  padding: 6px 0 10px;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 15px;
  color: #c5baff;
  background: rgba(131, 106, 238, 0.11);
  border: 1px solid rgba(162, 142, 255, 0.32);
  border-radius: 30px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.25px;
}

.label-star {
  color: #66e3ed;
  font-size: 14px;
}

.hero-title {
  margin: 20px 0;
  font-size: clamp(53px, 6vw, 78px);
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 1.04;
}

.hero-title span {
  background: linear-gradient(
    100deg,
    #b4a1ff,
    #60dfe8
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero-description {
  color: #aab7d3;
  max-width: 480px;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 19px;
}

.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-features > span {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  color: #b7c3dd;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
}

.feature-icon {
  color: #70e2eb;
  font-size: 15px;
}

.preview-panel {
  min-width: 0;
  padding: 20px 23px 17px;
  background:
    radial-gradient(
      circle at 65% 45%,
      rgba(120, 89, 234, 0.24),
      transparent 62%
    ),
    linear-gradient(
      145deg,
      #192545,
      #10182e
    );
  border: 1px solid rgba(149, 133, 255, 0.27);
  border-radius: 27px;
  box-shadow: 0 20px 65px rgba(0, 0, 0, 0.24);
}

.preview-top,
.preview-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.preview-labels {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-eyebrow {
  color: #9baacd;
  font-size: 9px;
  letter-spacing: 1.4px;
  font-weight: 800;
}

.preview-labels strong {
  font-size: 14px;
  color: #f7f8ff;
}

.ready-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid rgba(82, 226, 160, 0.3);
  border-radius: 30px;
  background: rgba(52, 211, 153, 0.08);
  color: #79ecc2;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.8px;
}

.ready-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #69e9b6;
}

.preview-board-area {
  display: grid;
  place-items: center;
  margin: 18px 0;
  min-height: 278px;
}

.preview-board {
  width: min(100%, 290px);
  aspect-ratio: 1;
  padding: 11px;
  background: linear-gradient(
    145deg,
    #263359,
    #111a32
  );
  border: 1px solid rgba(166, 151, 255, 0.49);
  border-radius: 20px;
  display: grid;
  grid-template-columns: repeat(
    var(--board-size),
    minmax(0, 1fr)
  );
  gap: 8px;
  transform: rotate(-3deg);
  box-shadow: 10px 17px 32px rgba(2, 7, 20, 0.47);
  transition: transform 0.25s ease;
}

.preview-board:hover {
  transform: rotate(0deg);
}

.preview-tile {
  min-width: 0;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(
    145deg,
    #4b5d94,
    #2a3d70
  );
  border: 1px solid rgba(178, 190, 255, 0.36);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.12),
    0 4px 0 rgba(11, 18, 41, 0.75);
  color: #f4f6ff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(25px, 3.7vw, 37px);
  font-weight: 700;
}

.preview-tile.empty-tile {
  background: rgba(6, 13, 31, 0.5);
  border: 1px dashed rgba(117, 134, 182, 0.5);
  box-shadow: none;
}

.hard-board {
  gap: 6px;
  padding: 9px;
}

.hard-board .preview-tile {
  font-size: clamp(17px, 2.7vw, 25px);
  border-radius: 8px;
}

.preview-bottom {
  padding-top: 4px;
  color: #9baacd;
  font-size: 9px;
  letter-spacing: 1.05px;
  font-weight: 700;
}

.preview-decoration {
  color: #83e1eb;
  font-size: 16px;
}

.configuration-panel {
  padding: 24px 28px 22px;
  background: linear-gradient(
    145deg,
    rgba(26, 37, 68, 0.92),
    rgba(14, 23, 43, 0.94)
  );
  border: 1px solid rgba(162, 178, 238, 0.15);
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(3, 7, 20, 0.16);
}

.configuration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-bottom: 19px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.configuration-eyebrow {
  color: #aea0ff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.configuration-header h2 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.7px;
  margin: 7px 0 4px;
}

.configuration-header p {
  margin: 0;
  color: #96a5c3;
  font-size: 12px;
}

.wallet-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.wallet-label {
  font-size: 9px;
  letter-spacing: 1.3px;
  color: #a3b1cd;
  font-weight: 800;
}

.configuration-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 27px;
  padding: 22px 0;
}

.configuration-group {
  min-width: 0;
}

.configuration-group + .configuration-group {
  padding-left: 27px;
  border-left: 1px solid rgba(255, 255, 255, 0.09);
}

.group-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.group-number {
  width: 33px;
  height: 33px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #a99aff;
  background: rgba(139, 113, 239, 0.12);
  border: 1px solid rgba(161, 145, 251, 0.23);
  border-radius: 10px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.group-heading h3 {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 700;
}

.group-heading p {
  margin: 0;
  color: #90a0bf;
  font-size: 11px;
}

.selection-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.selection-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 93px;
  padding: 13px;
  text-align: left;
  background: rgba(11, 20, 39, 0.69);
  border: 1px solid rgba(143, 162, 221, 0.16);
  border-radius: 14px;
  color: #f5f7ff;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;
}

.selection-card:hover {
  border-color: rgba(156, 139, 255, 0.66);
  transform: translateY(-2px);
}

.selection-card.selected {
  background: linear-gradient(
    135deg,
    rgba(111, 80, 205, 0.27),
    rgba(31, 40, 78, 0.7)
  );
  border-color: #a390ff;
  box-shadow: inset 0 0 0 1px rgba(163, 144, 255, 0.18);
}

.selection-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background: rgba(111, 216, 237, 0.1);
  font-size: 20px;
  color: #6de5ef;
}

.competitive-icon {
  color: #ffd183;
  background: rgba(255, 198, 107, 0.1);
}

.hard-icon {
  color: #bea8ff;
  background: rgba(146, 113, 238, 0.14);
}

.selection-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.selection-content strong {
  font-size: 13px;
  font-weight: 800;
}

.selection-content small {
  color: #9baac6;
  font-size: 10px;
  line-height: 1.45;
}

.selection-check {
  position: absolute;
  top: 9px;
  right: 10px;
  color: #83edbb;
  font-size: 12px;
  font-weight: 800;
}

.configuration-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.selected-summary {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.summary-label {
  color: #91a1be;
  font-size: 9px;
  letter-spacing: 1.25px;
  font-weight: 800;
}

.summary-values {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #e9ecff;
  font-weight: 800;
}

.summary-divider {
  color: #6c79a1;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.instructions-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 13px;
  border: none;
  background: transparent;
  color: #b3c0d9;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.instructions-button:hover {
  color: #72e3ed;
}

.instructions-button span {
  font-size: 16px;
}

.start-button {
  min-width: 215px;
  min-height: 49px;
  padding: 12px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 19px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(
    105deg,
    #7959ed,
    #9d77f8
  );
  color: #fff;
  box-shadow: 0 8px 26px rgba(111, 80, 224, 0.34);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.45px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(117, 85, 227, 0.5);
}

.start-arrow {
  font-size: 20px;
  font-weight: 400;
}

.home-footer {
  margin: 18px 0 0;
  text-align: center;
  color: #61718f;
  font-size: 9px;
  letter-spacing: 1px;
  font-weight: 700;
}

.home-footer span {
  padding: 0 9px;
}

.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(3, 7, 20, 0.86);
  backdrop-filter: blur(10px);
}

.tutorial-modal {
  width: min(100%, 460px);
  padding: 27px;
  background: linear-gradient(
    145deg,
    #1c294a,
    #111a30
  );
  border: 1px solid rgba(156, 139, 255, 0.49);
  border-radius: 22px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5);
}

.tutorial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tutorial-label {
  color: #aea0ff;
  font-size: 10px;
  letter-spacing: 1.4px;
  font-weight: 800;
}

.close-tutorial {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.04);
  color: #d7def1;
  cursor: pointer;
}

.tutorial-modal h2 {
  font-size: 27px;
  margin: 14px 0 12px;
}

.tutorial-description {
  font-size: 13px;
  line-height: 1.7;
  color: #adbbd6;
}

.tutorial-steps {
  margin: 20px 0;
}

.tutorial-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tutorial-step span {
  color: #73e5ef;
  font-size: 13px;
  font-weight: 800;
}

.tutorial-step p {
  color: #d0d9ee;
  font-size: 12px;
  margin: 0;
}

.tutorial-info {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px;
  border: 1px solid rgba(156, 139, 255, 0.25);
  background: rgba(120, 91, 226, 0.1);
  border-radius: 12px;
}

.tutorial-info span {
  color: #b4a1ff;
  font-size: 18px;
}

.tutorial-info p {
  margin: 0;
  font-size: 11px;
  color: #b9c7e0;
  line-height: 1.6;
}

.tutorial-accept {
  margin-top: 20px;
  width: 100%;
}

@media (max-width: 1050px) {
  .home-hero {
    gap: 25px;
  }

  .configuration-grid {
    gap: 18px;
  }

  .configuration-group + .configuration-group {
    padding-left: 18px;
  }

  .selection-card {
    gap: 9px;
    padding: 11px;
  }

  .selection-icon {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 850px) {
  .home-page {
    padding: 25px 20px;
  }

  .home-hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .home-introduction {
    text-align: center;
  }

  .hero-title {
    font-size: clamp(50px, 9vw, 75px);
  }

  .hero-description {
    max-width: 550px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-features {
    justify-content: center;
  }

  .preview-panel {
    width: min(100%, 530px);
    margin: 0 auto;
  }

  .configuration-grid {
    grid-template-columns: 1fr;
  }

  .configuration-group + .configuration-group {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.09);
    padding: 20px 0 0;
  }
}

@media (max-width: 550px) {
  .home-page {
    padding: 19px 13px 30px;
  }

  .hero-label {
    font-size: 9px;
    letter-spacing: 0.8px;
  }

  .hero-title {
    font-size: clamp(47px, 12vw, 62px);
    letter-spacing: -3px;
    margin: 17px 0;
  }

  .hero-description {
    font-size: 12px;
    line-height: 1.75;
  }

  .hero-features {
    gap: 7px;
  }

  .hero-features > span {
    font-size: 10px;
    padding: 7px 9px;
  }

  .preview-panel {
    padding: 15px;
    border-radius: 20px;
  }

  .preview-board-area {
    min-height: 245px;
    margin: 12px 0;
  }

  .preview-board {
    max-width: 245px;
  }

  .preview-tile {
    font-size: 28px;
  }

  .hard-board .preview-tile {
    font-size: 19px;
  }

  .configuration-panel {
    padding: 18px 15px;
    border-radius: 19px;
  }

  .configuration-header {
    align-items: flex-start;
    gap: 10px;
  }

  .configuration-header h2 {
    font-size: 20px;
  }

  .configuration-header p {
    font-size: 11px;
  }

  .wallet-container {
    flex-shrink: 0;
  }

  .selection-options {
    gap: 8px;
  }

  .selection-card {
    min-height: 110px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 12px;
    gap: 7px;
  }

  .selection-content strong {
    font-size: 12px;
  }

  .selection-content small {
    font-size: 10px;
  }

  .configuration-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .selected-summary {
    align-items: center;
  }

  .footer-actions {
    flex-direction: column-reverse;
    gap: 5px;
  }

  .start-button {
    width: 100%;
  }

  .instructions-button {
    justify-content: center;
  }

  .home-footer {
    line-height: 1.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-board,
  .selection-card,
  .start-button {
    transition: none;
  }
}
</style>
