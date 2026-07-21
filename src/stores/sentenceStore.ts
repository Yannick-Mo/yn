import { create } from "zustand"
import { emit } from "@tauri-apps/api/event"
import { SourceRegistry } from "../engine"
import type { Sentence } from "../engine/types"
import { addHistory } from "../lib/db"

interface SentenceStore {
  current: Sentence | null
  history: Sentence[]
  error: string | null
  registry: SourceRegistry
  timerId: ReturnType<typeof setInterval> | null
  fetching: boolean
  next: () => Promise<void>
  prev: () => void
  forward: () => void
  startAutoRefresh: (intervalMs: number) => void
  stopAutoRefresh: () => void
  clearHistory: () => void
}

export const useSentenceStore = create<SentenceStore>((set, get) => ({
  current: null,
  history: [],
  error: null,
  registry: new SourceRegistry(),
  timerId: null,
  fetching: false,

  next: async () => {
    const { registry, fetching } = get()
    if (fetching) return
    set({ fetching: true })
    const result = await registry.fetchSentence()
    if (result.sentence) {
      await addHistory(result.sentence)
      set((state) => ({
        current: result.sentence,
        history: [result.sentence!, ...state.history].slice(0, 100),
        error: null,
        fetching: false,
      }))
      emit("sentence:new", result.sentence)
    } else {
      set({ error: result.error, fetching: false })
    }
  },

  prev: () => {
    const { history, current } = get()
    if (history.length < 2 || !current) return
    const idx = history.indexOf(current)
    if (idx < history.length - 1) {
      set({ current: history[idx + 1] })
    }
  },

  forward: () => {
    const { history, current } = get()
    if (history.length < 2 || !current) return
    const idx = history.indexOf(current)
    if (idx > 0) {
      set({ current: history[idx - 1] })
    }
  },

  startAutoRefresh: (intervalMs: number) => {
    const { timerId } = get()
    if (timerId) clearInterval(timerId)
    const id = setInterval(() => { get().next() }, intervalMs)
    set({ timerId: id })
  },

  stopAutoRefresh: () => {
    const { timerId } = get()
    if (timerId) {
      clearInterval(timerId)
      set({ timerId: null })
    }
  },

  clearHistory: () => set({ history: [], current: null }),
}))
