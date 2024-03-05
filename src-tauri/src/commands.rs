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
use grid_search_desktop::split_host_port;
use ollama_rs::{
    error::OllamaError,
    generation::{
        completion::{request::GenerationRequest, GenerationResponse},
        options::GenerationOptions,
        parameters::KeepAlive,
    },
    Ollama,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::fs;
// use std::io;
// use std::path::PathBuf;
use std::time::SystemTime;
use std::{
    fs::File,
    io::{BufReader, BufWriter},
    path::Path,
};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TParamIteration {
    experiment_uuid: String,
    model: String,
    prompt: String,
    temperature: f32,
    repeat_penalty: f32,
    top_k: u32,
    top_p: f32,
    repeat_last_n: i32,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct IDefaultConfigs {
    server_url: String,
    system_prompt: String,
    default_options: HashMap<String, Value>,
}

#[derive(Debug, Serialize)]
pub struct ExperimentFile {
    name: String,
    created: SystemTime,
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

pub async fn log_experiment(
    config: &IDefaultConfigs,
    params: &TParamIteration,
    res: &GenerationResponse,
) -> Result<(), Error> {
    let experiment_uuid = &params.experiment_uuid;
    let log_dir = "./logs";
    let log_file_path = format!("{}/{}.json", log_dir, experiment_uuid);

    // Create the logs directory if it doesn't exist
    if !Path::new(log_dir).exists() {
        fs::create_dir(log_dir)?;
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

#[tauri::command]
pub async fn get_models(config: IDefaultConfigs) -> Result<Vec<String>, Error> {
    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    println!("Fetching models from {}", &host_url);
    let ollama = Ollama::new(host_url, port);
    let models = ollama.list_local_models().await?;

    let model_list: Vec<String> = models.into_iter().map(|model| model.name).collect();
    Ok(model_list)
}

// pub mod commands {}

#[tauri::command]
pub async fn get_inference(
    config: IDefaultConfigs,
    params: TParamIteration,
) -> Result<GenerationResponse, Error> {
    println!("Config and Params");
    dbg!(&config);
    dbg!(&params);
    println!("----------------------------------------------------------");

    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    let ollama = Ollama::new(host_url, port);

    // Default options might not have been set by the user
    // add only the ones we have a value for
    let mut options_builder = GenerationOptions::default();

    for &option_name in &[
        "mirostat",
        "mirostat_tau",
        "mirostat_eta",
        "num_ctx",
        "num_gqa",
        "num_gpu",
        "num_thread",
        // "repeat_last_n",
        "seed",
        "stop",
        "tfs_z",
        "num_predict",
    ] {
        if let Some(value) = config.default_options.get(option_name) {
            match option_name {
                "mirostat" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<u8>()
                        .expect("Failed to parse mirostat as u8");
                    options_builder = options_builder.mirostat(parsed_value);
                }
                "mirostat_tau" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<f32>()
                        .expect("Failed to parse mirostat_tau as f32");
                    options_builder = options_builder.mirostat_tau(parsed_value);
                }
                "mirostat_eta" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<f32>()
                        .expect("Failed to parse mirostat_eta as f32");
                    options_builder = options_builder.mirostat_eta(parsed_value);
                }
                "num_ctx" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<u32>()
                        .expect("Failed to parse num_ctx as u32");
                    options_builder = options_builder.num_ctx(parsed_value);
                }
                "num_gqa" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<u32>()
                        .expect("Failed to parse num_gqa as u32");
                    options_builder = options_builder.num_gqa(parsed_value);
                }
                "num_gpu" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<u32>()
                        .expect("Failed to parse num_gpu as u32");
                    options_builder = options_builder.num_gpu(parsed_value);
                }
                "num_thread" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<u32>()
                        .expect("Failed to parse num_thread as u32");
                    options_builder = options_builder.num_thread(parsed_value);
                }
                // "repeat_last_n" => {
                //     let parsed_value = value
                //         .to_string()
                //         .parse::<i32>()
                //         .expect("Failed to parse repeat_last_n as i32");
                //     options_builder = options_builder.repeat_last_n(parsed_value);
                // }
                "seed" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<i32>()
                        .expect("Failed to parse seed as i32");
                    options_builder = options_builder.seed(parsed_value);
                }
                "stop" => {
                    let parsed_value = vec![value.to_string()];
                    options_builder = options_builder.stop(parsed_value);
                }
                "tfs_z" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<f32>()
                        .expect("Failed to parse tfs_z as f32");
                    options_builder = options_builder.tfs_z(parsed_value);
                }
                "num_predict" => {
                    let parsed_value = value
                        .to_string()
                        .parse::<i32>()
                        .expect("Failed to parse num_predictnum_predict as i32");
                    options_builder = options_builder.num_predict(parsed_value);
                }
                _ => {
                    println!("Unknown option: {}", option_name);
                }
            }
        }
    }

    // Set mandatory options
    let options = options_builder
        .temperature(params.temperature)
        .repeat_penalty(params.repeat_penalty)
        .top_k(params.top_k)
        .top_p(params.top_p)
        .repeat_last_n(params.repeat_last_n);

    let system_prompt = &config.system_prompt;
    let req = GenerationRequest::new(params.clone().model, params.clone().prompt)
        .options(options)
        .system(system_prompt.into())
        .keep_alive(KeepAlive::UnloadOnCompletion);

    dbg!(&req);

    let res = ollama.generate(req).await.map_err(|err| {
        println!("Error: {}", err.to_string());
        Error::StringError(err.to_string())
    })?;

    log_experiment(&config, &params, &res).await?;

    // println!("---------------------------------------------");
    // dbg!(&res);
    // println!("---------------------------------------------");

    Ok(res)
}

#[tauri::command]
pub fn list_experiments() -> Result<Vec<ExperimentFile>, Error> {
    let mut files: Vec<ExperimentFile> = fs::read_dir("./logs")?
        .filter_map(Result::ok)
        .map(|entry| {
            let path = entry.path();
            let metadata = fs::metadata(&path).ok()?;
            let created = metadata.created().ok()?;
            Some(ExperimentFile {
                name: path.file_name()?.to_string_lossy().into_owned(),
                created,
            })
        })
        .filter_map(std::convert::identity)
        .collect();

    files.sort_by_key(|file| file.created);
    Ok(files)
}
