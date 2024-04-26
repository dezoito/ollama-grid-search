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

use std::collections::HashMap;

use chrono::Utc;
use ollama_rs::error::OllamaError;
use ollama_rs::generation::completion::GenerationResponse;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::fs;
use std::time::SystemTime;
use std::{
    fs::File,
    io::{BufReader, BufWriter},
    path::Path,
};
use thiserror::Error;
use url::{ParseError, Url};

use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TParamIteration {
    pub experiment_uuid: String,
    pub model: String,
    pub prompt: String,
    pub system_prompt: String,
    pub temperature: f32,
    pub repeat_penalty: f32,
    pub top_k: u32,
    pub top_p: f32,
    pub repeat_last_n: i32,
    pub tfs_z: f32,
    pub mirostat: u8,
    pub mirostat_tau: f32,
    pub mirostat_eta: f32,
    pub seed: i32,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct IDefaultConfigs {
    pub request_timeout: u64,
    pub server_url: String,
    pub system_prompt: String,
    pub default_options: HashMap<String, Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExperimentFile {
    pub name: String,
    pub created: SystemTime,
    pub contents: String,
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

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    // New variant for string-related errors
    #[error("String error: {0}")]
    StringError(String), // Include a String to represent the error message
}

// Errors must implement serde::Serialize to be used in Commands
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[allow(unused)]
pub async fn wait_and_return(duration_seconds: u64) -> String {
    // Convert seconds to Duration
    let duration = Duration::from_secs(duration_seconds);

    // Sleep for the specified duration
    sleep(duration).await;

    // Return a message indicating that the wait is over
    format!("Waited for {} seconds.", duration_seconds)
}

pub fn split_host_port(url: &str) -> Result<(String, u16), ParseError> {
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

pub async fn log_experiment(
    config: &IDefaultConfigs,
    params: &TParamIteration,
    res: &GenerationResponse,
    app_data_dir: &str,
) -> Result<(), Error> {
    let experiment_uuid = &params.experiment_uuid;
    let log_file_path = format!("{}/{}.json", app_data_dir, experiment_uuid);

    // Create the logs directory if it doesn't exist
    if !Path::new(&app_data_dir).exists() {
        fs::create_dir(&app_data_dir)?;
    }

    let mut log_data = if Path::new(&log_file_path).exists() {
        // Load existing log file
        let file = File::open(&log_file_path)?;
        let reader = BufReader::new(file);
        serde_json::from_reader(reader)?
    } else {
        // Create new log data
        json!({
            "experiment_uuid": experiment_uuid,
            "datetime": Utc::now().to_string(),
            "config": config,
            "inferences": []
        })
    };

    // Add the new inference entry
    let inference_entry = json!({
        "parameters": params,
        "result": res
    });

    if let Some(inferences) = log_data["inferences"].as_array_mut() {
        inferences.push(inference_entry);
    } else {
        return Err(Error::StringError(
            "Failed to access inferences array".to_string(),
        ));
    }

    // Write the updated log data back to the file
    let file = File::create(&log_file_path)?;
    let writer = BufWriter::new(file);
    serde_json::to_writer_pretty(writer, &log_data)?;

    println!("Experiment logged at: {}", log_file_path);

    Ok(())
}
