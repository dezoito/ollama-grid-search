// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use url::{ParseError, Url};

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
use ollama_rs::{
    error::OllamaError,
    generation::{completion::request::GenerationRequest, options::GenerationOptions},
    Ollama,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
struct TParamIteration {
    model: String,
    prompt: String,
    temperature: f32,
    repeat_penalty: f32,
    top_k: u32,
    top_p: f32,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
struct IDefaultConfigs {
    server_url: String,
    system_prompt: String,
    default_options: HashMap<String, Value>,
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

#[allow(unused)]
async fn wait_and_return(duration_seconds: u64) -> String {
    // Convert seconds to Duration
    let duration = Duration::from_secs(duration_seconds);

    // Sleep for the specified duration
    sleep(duration).await;

    // Return a message indicating that the wait is over
    format!("Waited for {} seconds.", duration_seconds)
}

fn split_host_port(url: &str) -> Result<(String, u16), ParseError> {
    let some_url = Url::parse(url)?;
    Ok((
        format!(
            "{}://{}",
            some_url.scheme(),
            some_url.host_str().unwrap().to_string(),
        ),
        some_url.port().unwrap(),
    ))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_models(config: IDefaultConfigs) -> Result<Vec<String>, Error> {
    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    println!("Fetching models from {}", &host_url);
    let ollama = Ollama::new(host_url, port);
    let models = ollama.list_local_models().await?;

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

#[tauri::command]
async fn get_inference(config: IDefaultConfigs, params: TParamIteration) -> Result<String, Error> {
    println!("Config:");
    dbg!(&config);
    println!("Params:");
    dbg!(&params);

    //TODO, simplify and return the entire response
    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    let ollama = Ollama::new(host_url, port);

    // set the inference options
    let options = GenerationOptions::default()
        .temperature(params.temperature)
        .repeat_penalty(params.repeat_penalty)
        .top_k(params.top_k)
        .top_p(params.top_p);

    // Ugly way to do this (maybe in a loop?)
    // let options = GenerationOptions::default();
    // let options = options.clone().temperature(params.temperature); // Set temperature
    // let options = options.clone().repeat_penalty(params.repeat_penalty); // Set temperature

    let req = GenerationRequest::new(params.model, params.prompt)
        .options(options)
        .system(config.system_prompt);

    dbg!(&req);

    let res = match ollama.generate(req).await {
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
