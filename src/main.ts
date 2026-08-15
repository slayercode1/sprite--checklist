import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { reportError } from './services/errorManager'

const app = createApp(App)
app.config.errorHandler = (error, instance, info) => reportError(error, { context: { source: 'vue', component: instance?.$options.name, info } })
window.addEventListener('unhandledrejection', (event) => { event.preventDefault(); reportError(event.reason, { context: { source: 'unhandledrejection' } }) })
window.addEventListener('error', (event) => reportError(event.error ?? new Error('Window error'), { context: { source: 'window', filename: event.filename, line: event.lineno } }))
app.use(router).mount('#app')
