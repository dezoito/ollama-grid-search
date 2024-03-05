// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_models,
            commands::get_inference,
            commands::list_experiments,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
