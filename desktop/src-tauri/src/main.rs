// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/*
On error handling:

https://github.com/tauri-apps/tauri/discussions/3913

Everything you return from commands must implement Serialize,
this includes Errors and anyhow's error type doesn't implement it.
You basically have 2 choices here, either you convert errors to Strings or implement your own
custom Error which implements Serialize and has From implementations for external errors.
Here's the relevant section in our wip docs:
https://jonaskruckenberg.github.io/tauri-docs-wip/development/inter-process-communication.html#error-handling


(The simpler option was used here)
*/

use ollama_rs::Ollama;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!...", name)
}

#[tauri::command(async)]
async fn get_models() -> Result<Vec<String>, String> {
    let ollama = Ollama::default();

    let models = match ollama.list_local_models().await {
        Ok(models) => models,
        Err(err) => {
            // Return a descriptive error message if listing fails
            return Err(format!("Failed to list local models: {}", err));
        }
    };

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_models])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
