use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub theme: String,
    pub panel_visible: bool,
    pub panel_opacity: f64,
    pub panel_blur: f64,
    pub panel_bg_color: Option<String>,
    pub panel_text_color: Option<String>,
    pub panel_sub_color: Option<String>,
    pub panel_border_show: bool,
    pub panel_border_color: Option<String>,
    pub panel_border_width: f64,
    pub panel_font_size: f64,
    pub panel_sub_size: f64,
    pub panel_corner_radius: f64,
    pub panel_show_nav: bool,
    pub update_interval_ms: u64,
    pub enabled_sources: Vec<String>,
    pub source_strategy: String,
    pub panel_x: Option<i32>,
    pub panel_y: Option<i32>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "glass".into(),
            panel_visible: true,
            panel_opacity: 0.3,
            panel_blur: 12.0,
            panel_bg_color: None,
            panel_text_color: None,
            panel_sub_color: None,
            panel_border_show: false,
            panel_border_color: None,
            panel_border_width: 1.0,
            panel_font_size: 16.0,
            panel_sub_size: 12.0,
            panel_corner_radius: 0.0,
            panel_show_nav: true,
            update_interval_ms: 1_800_000,
            enabled_sources: vec!["local".into(), "hitokoto".into(), "jinrishici".into()],
            source_strategy: "random".into(),
            panel_x: None,
            panel_y: None,
        }
    }
}

pub struct AppState {
    pub config: Mutex<AppConfig>,
    pub config_path: PathBuf,
}

pub fn load_config(path: &std::path::Path) -> AppConfig {
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_config(path: &std::path::Path, config: &AppConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}
