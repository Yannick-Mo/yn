import { create } from "zustand"
import { emit } from "@tauri-apps/api/event"
import type { AppConfig } from "../lib/ipc"
import * as ipc from "../lib/ipc"

interface ConfigStore {
  config: AppConfig | null
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<AppConfig>) => Promise<void>
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: null,
  loaded: false,

  load: async () => {
    const config = await ipc.getConfig()
    set({ config, loaded: true })
  },

  update: async (patch) => {
    const { config } = get()
    if (!config) return
    const merged = { ...config, ...patch }
    await ipc.setConfig(merged)
    set({ config: merged })
    emit("config:updated", merged)
  },
}))
