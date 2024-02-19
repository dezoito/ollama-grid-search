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
// use ollama_rs::generation::completion::GenerationFinalResponseData;
use ollama_rs::{error::OllamaError, generation::completion::request::GenerationRequest, Ollama};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
struct TParamIteration {
    model: String,
    prompt: String,
    temperature: f32,
    repeat_penalty: f32,
    top_k: i32,
    top_p: f32,
}

#[allow(unused)]
async fn wait_and_return(duration_seconds: u64) -> String {
    // Convert seconds to Duration
    let duration = Duration::from_secs(duration_seconds);

    // Sleep for the specified duration
    sleep(duration).await;

    // Return a message indicating that the wait is over
    format!("Waited for {} seconds.", duration_seconds)
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

    // New variant for string-related errors
    #[error("String error: {0}")]
    StringError(String), // Include a String to represent the error message
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
    let models = ollama.list_local_models().await?;

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

#[tauri::command]
async fn get_inference(params: TParamIteration) -> Result<String, Error> {
    //TODO, simplify and return the entire response
    let ollama = Ollama::default();
    dbg!(&params);
    let res = match ollama
        .generate(GenerationRequest::new(params.model, params.prompt))
        .await
    {
        Ok(value) => value,
        Err(err) => {
            println!("Error: {}", err.to_string());
            return Err(Error::StringError(err.to_string()));
        }
    };
    // dbg!(res);
    println!("Inference complete.");
    Ok(res.response)
}

// async fn get_inference(params: TParamIteration) -> Result<String, Error> {
//     wait_and_return(5).await;
//     dbg!(params);
//     Ok("I'm returning from get_inference".to_string())
// }

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_models, get_inference])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
