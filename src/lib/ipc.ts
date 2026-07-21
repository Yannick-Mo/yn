import { invoke } from "@tauri-apps/api/core"

export interface AppConfig {
  theme: string
  panel_visible: boolean
  panel_opacity: number
  panel_blur: number
  panel_bg_color: string | null
  panel_text_color: string | null
  panel_sub_color: string | null
  panel_border_show: boolean
  panel_border_color: string | null
  panel_border_width: number
  panel_font_size: number
  panel_sub_size: number
  panel_corner_radius: number
  panel_show_nav: boolean
  update_interval_ms: number
  enabled_sources: string[]
  source_strategy: string
  panel_x: number | null
  panel_y: number | null
}

export function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>("get_config")
}

export function setConfig(config: AppConfig): Promise<void> {
  return invoke<void>("set_config", { config })
}

export function isAutostartEnabled(): Promise<boolean> {
  return invoke<boolean>("is_autostart_enabled")
}

export function setAutostart(enabled: boolean): Promise<void> {
  return invoke<void>("set_autostart", { enabled })
}
