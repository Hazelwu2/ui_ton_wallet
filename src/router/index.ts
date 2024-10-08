import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Trc20View from '../views/Trc20View.vue'
import UserActionViewInGame from '../views/UserActionViewInGame.vue'
import Auth from '../views/Auth.vue'
import MiniApp from '../views/MiniApp.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trc',
      component: Trc20View
    },
    {
      path: '/user',
      name: 'user',
      component: UserActionViewInGame
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    },
    {
      path: '/mini-app',
      name: 'mini-app',
      component: MiniApp
    },
    {
      path: '/stock',
      name: 'stock',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/StockView.vue')
    }
  ]
})

export default router
