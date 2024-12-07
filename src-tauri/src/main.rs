// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
mod commands;
mod db;
// Used in the single-instance plugin
#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    // std::env::set_var("NO_PROXY", "127.0.0.1,localhost");
    let builder =
        tauri::Builder::default().plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }));

    // Initialize database before setting up the rest of the app
    let app = builder.setup(|app| {
        let handle = app.handle();

        // Initialize database
        tauri::async_runtime::block_on(async move {
            let database = db::Database::new(&handle)
                .await
                .expect("failed to initialize database");

            // Store database pool in app state
            app.manage(db::DatabaseState(database.pool));
        });

        Ok(())
    });

    // Debug path to db
    // let app_data_dir = app
    //     .handle()
    //     .path_resolver()
    //     .app_data_dir()
    //     .expect("failed to get app dir");
    // println!("App data directory: {:?}", app_data_dir);

    app.invoke_handler(tauri::generate_handler![
        commands::get_models,
        commands::get_inference,
        commands::get_experiments,
        commands::get_ollama_version,
        commands::delete_experiments,
        commands::get_all_prompts,
        commands::create_prompt,
        commands::update_prompt,
        commands::delete_prompt,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
