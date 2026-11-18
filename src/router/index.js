
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

import LoginView from '../views/LoginView.vue'
import MenuView from '../views/MenuView.vue'
import GameView from '../views/GameView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import ColeccionView from '../views/ColeccionView.vue'
import PerfilView from '../views/PerfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'menu',
      component: MenuView,
      meta: { requiereLogin: true }
    },
    {
      path: '/jugar',
      name: 'juego',
      component: GameView,
      meta: { requiereLogin: true }
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: LeaderboardView,
      meta: { requiereLogin: true }
    },
    {
      path: '/coleccion',
      name: 'coleccion',
      component: ColeccionView,
      meta: { requiereLogin: true }
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: { requiereLogin: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.inicializar()

  if (to.meta.requiereLogin && !auth.autenticado) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }

  return true
})

export default router
