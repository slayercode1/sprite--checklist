import { ref, watch, type Ref } from 'vue'
import { reportError } from '../services/errorManager'
export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  let storedValue = initialValue
  try { const rawValue = localStorage.getItem(key); if (rawValue) storedValue = JSON.parse(rawValue) as T }
  catch (error) { reportError(error, { category: 'validation', context: { source: 'localStorage.read', storageKey: key } }); localStorage.removeItem(key) }
  const value = ref(storedValue) as Ref<T>
  watch(value, (nextValue) => { try { localStorage.setItem(key, JSON.stringify(nextValue)) } catch (error) { reportError(error, { context: { source: 'localStorage.write', storageKey: key } }) } }, { deep: true })
  return value
}
