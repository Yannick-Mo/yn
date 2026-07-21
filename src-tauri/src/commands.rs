use crate::storage::{self, AppConfig, AppState};
use tauri::State;

#[tauri::command]
pub fn get_config(state: State<AppState>) -> AppConfig {
    state.config.lock().unwrap().clone()
}

#[tauri::command]
pub fn set_config(state: State<AppState>, config: AppConfig) -> Result<(), String> {
    let mut c = state.config.lock().map_err(|e| e.to_string())?;
    *c = config.clone();
    storage::save_config(&state.config_path, &config);
    Ok(())
}
