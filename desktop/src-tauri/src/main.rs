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


The Error enum, therefore, has to implement a variant for "OllamaError"
*/
use ollama_rs::generation::completion::GenerationFinalResponseData;
use ollama_rs::{error::OllamaError, generation::completion::request::GenerationRequest, Ollama};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
struct TParamIteration {
    model: String,
    prompt: String,
    temperature: f32,
    repeat_penalty: f32,
    top_k: i32,
    top_p: f32,
}

// Use thiserror::Error to implement serializable errors
// that are returned by commands
#[derive(Debug, Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    // #[error("Error from Ollama")]
    Ollama(#[from] OllamaError),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
async fn get_models() -> Result<Vec<String>, Error> {
    let ollama = Ollama::default();

    // let models = match ollama.list_local_models().await {
    //     Ok(models) => models,
    //     Err(err) => {
    //         // Return a descriptive error message if listing fails
    //         println!("Error: {}", err);
    //         return Error::Ollama(format!("Failed to list local models: {}", err));
    //     }
    // };

    let models = ollama.list_local_models().await?;

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

#[tauri::command]
async fn get_inference(params: TParamIteration) -> Result<String, Error> {
    println!("{:?}", params);

    // let ollama = Ollama::default();
    // let res = match ollama
    //     .generate(GenerationRequest::new(params.model, params.prompt))
    //     .await
    // {
    //     Ok(res) => {
    //         println!("it works");
    //     }
    //     Err(err) => {
    //         // Return a descriptive error message if listing fails
    //         println!("Error: {}", err);
    //         return Err(Error::Ollama(
    //             format!("Failed to list local models: {}", err).into(),
    //         ));
    //     }
    // };
    // let ollama = Ollama::default();

    // let res = ollama
    //     .generate(GenerationRequest::new(params.model, params.prompt).stream(false))
    //     .await
    //     .unwrap();

    todo!()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_models, get_inference])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
