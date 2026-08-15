import { createRouter, createWebHistory } from 'vue-router'
import SpritesView from '../views/SpritesView.vue'
export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'collection', component: SpritesView }, { path: '/sprite/:slug', name: 'sprite', component: () => import('../views/SpriteDetailView.vue') }, { path: '/:pathMatch(.*)*', redirect: '/' }],
  scrollBehavior(to, _from, savedPosition) { return savedPosition ?? (to.hash ? { el: to.hash } : { top: 0 }) },
})
