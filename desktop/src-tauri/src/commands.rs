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

use std::collections::HashMap;

use desktop::split_host_port;
use ollama_rs::{
    error::OllamaError,
    generation::{completion::request::GenerationRequest, options::GenerationOptions},
    Ollama,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct TParamIteration {
    model: String,
    prompt: String,
    temperature: f32,
    repeat_penalty: f32,
    top_k: u32,
    top_p: f32,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IDefaultConfigs {
    server_url: String,
    system_prompt: String,
    default_options: HashMap<String, Value>,
}

// Use thiserror::Error to implement serializable errors
// that are returned by commands
#[derive(Debug, Error)]
pub enum Error {
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

#[tauri::command(rename_all = "snake_case")]
pub async fn get_models(config: IDefaultConfigs) -> Result<Vec<String>, Error> {
    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    println!("Fetching models from {}", &host_url);
    let ollama = Ollama::new(host_url, port);
    let models = ollama.list_local_models().await?;

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

pub mod commands {}

#[tauri::command]
pub async fn get_inference(
    config: IDefaultConfigs,
    params: TParamIteration,
) -> Result<String, Error> {
    //TODO, simplify and return the entire response
    println!("Config:");
    dbg!(&config);
    println!("Params:");
    dbg!(&params);
    // println!(
    //     "Stop: {}",
    //     config.default_options.get("stop").unwrap().to_string()
    // );

    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    let ollama = Ollama::new(host_url, port);

    // Set the inference options, first apply the
    // default options from settings, then the actual
    // inference options defined on the form
    let options = GenerationOptions::default()
        .mirostat(
            config
                .default_options
                .get("mirostat")
                .unwrap()
                .to_string()
                .parse::<u8>()
                .expect("Failed to parse mirostat as u8"),
        )
        .mirostat_tau(
            config
                .default_options
                .get("mirostat_tau")
                .unwrap()
                .to_string()
                .parse::<f32>()
                .expect("Failed to parse mirostat_tau as f32"),
        )
        .mirostat_eta(
            config
                .default_options
                .get("mirostat_eta")
                .unwrap()
                .to_string()
                .parse::<f32>()
                .expect("Failed to parse mirostat_eta as f32"),
        )
        .num_ctx(
            config
                .default_options
                .get("num_ctx")
                .unwrap()
                .to_string()
                .parse::<u32>()
                .expect("Failed to parse num_ctx as u32"),
        )
        .num_gqa(
            config
                .default_options
                .get("num_gqa")
                .unwrap()
                .to_string()
                .parse::<u32>()
                .expect("Failed to parse num_gqa as u32"),
        )
        .num_thread(
            config
                .default_options
                .get("num_thread")
                .unwrap()
                .to_string()
                .parse::<u32>()
                .expect("Failed to parse num_thread as u32"),
        )
        .repeat_last_n(
            config
                .default_options
                .get("repeat_last_n")
                .unwrap()
                .to_string()
                .parse::<i32>()
                .expect("Failed to parse repeat_last_n as i32"),
        )
        .seed(
            config
                .default_options
                .get("seed")
                .unwrap()
                .to_string()
                .parse::<i32>()
                .expect("Failed to parse seed as i32"),
        )
        // .stop(config.default_options.get("stop").unwrap().to_string())
        .tfs_z(
            config
                .default_options
                .get("tfs_z")
                .unwrap()
                .to_string()
                .parse::<f32>()
                .expect("Failed to parse tfs_z as f32"),
        )
        .num_predict(
            config
                .default_options
                .get("num_predict")
                .unwrap()
                .to_string()
                .parse::<i32>()
                .expect("Failed to parse num_predict as i32"),
        )
        .temperature(params.temperature)
        .repeat_penalty(params.repeat_penalty)
        .top_k(params.top_k)
        .top_p(params.top_p);

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
