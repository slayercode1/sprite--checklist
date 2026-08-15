import { onBeforeUnmount, onMounted, ref } from 'vue'
import { subscribeToErrors, type ErrorNotification } from '../services/errorManager'
export function useErrorNotifications() {
  const notifications = ref<ErrorNotification[]>([])
  let unsubscribe = () => {}
  const dismiss = (errorId: string) => { notifications.value = notifications.value.filter((item) => item.errorId !== errorId) }
  onMounted(() => { unsubscribe = subscribeToErrors((notification) => { notifications.value.push(notification); window.setTimeout(() => dismiss(notification.errorId), notification.severity === 'error' ? 10_000 : 7_000) }) })
  onBeforeUnmount(() => unsubscribe())
  return { notifications, dismiss }
}
