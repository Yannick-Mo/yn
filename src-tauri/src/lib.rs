mod commands;
mod storage;

use storage::AppState;
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager, Runtime,
};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[tauri::command]
async fn is_autostart_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    if enabled {
        app.autolaunch().enable().map_err(|e| e.to_string())?;
    } else {
        app.autolaunch().disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let show_main = MenuItem::with_id(app, "show_main", "显示/隐藏 主窗口", true, None::<&str>)?;
    let toggle_float = MenuItem::with_id(app, "toggle_float", "显示/隐藏 悬浮面板", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_main, &toggle_float, &quit])?;

    let tray_icon = tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon.png"))
        .expect("failed to load tray icon");

    let _tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "show_main" => {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
            "toggle_float" => {
                if let Some(window) = app.get_webview_window("floating") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                    }
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let key = shortcut.to_string();
                        match key.as_str() {
                            "Ctrl+Shift+N" => {
                                let _ = app.emit("shortcut:next", ());
                            }
                            "Ctrl+Shift+Y" => {
                                let _ = app.emit("shortcut:toggle", ());
                            }
                            _ => {}
                        }
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let config_path = app.path().app_data_dir().map(|d| d.join("config.json"));
            let (config, path) = if let Ok(ref path) = config_path {
                if let Some(parent) = path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }
                (storage::load_config(path), path.clone())
            } else {
                eprintln!("Warning: could not resolve app_data_dir, using defaults");
                (storage::AppConfig::default(), std::path::PathBuf::new())
            };

            app.manage(AppState {
                config: Mutex::new(config.clone()),
                config_path: path,
            });

            // restore floating panel visibility
            if config.panel_visible {
                if let Some(window) = app.get_webview_window("floating") {
                    let _ = window.show();
                }
            }

            create_tray(app.handle())?;
            if let Err(e) = app.global_shortcut().register("Ctrl+Shift+N") {
                eprintln!("Failed to register Ctrl+Shift+N: {e}");
            }
            if let Err(e) = app.global_shortcut().register("Ctrl+Shift+Y") {
                eprintln!("Failed to register Ctrl+Shift+Y: {e}");
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::set_config,
            is_autostart_enabled,
            set_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
