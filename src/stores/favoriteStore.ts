import { create } from "zustand"
import type { Favorite } from "../lib/db"

interface FavoriteStore {
  items: Favorite[]
  setItems: (items: Favorite[]) => void
}

export const useFavoriteStore = create<FavoriteStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
