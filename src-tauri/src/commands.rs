use crate::db::DatabaseState;
use reqwest::Client;
use serde::Serialize;
use serde_json::json;
use std::fs;
// use std::{fs, time::SystemTime};
use tokio::time::{self, Duration};

use grid_search_desktop::{
    log_experiment, split_host_port, Error, ExperimentFile, IDefaultConfigs, TParamIteration,
};

use ollama_rs::{
    generation::{
        completion::{request::GenerationRequest, GenerationResponse},
        options::GenerationOptions,
        // parameters::KeepAlive,
    },
    Ollama,
};

use sqlx::prelude::*;
// use uuid::Uuid;

#[derive(Debug, FromRow, Serialize)]
pub struct Prompt {
    pub uuid: String,
    pub name: String,
    pub slug: String,
    pub prompt: String,
    pub date_created: i64,  // Unix timestamp
    pub last_modified: i64, // Unix timestamp
    pub is_active: bool,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn get_all_prompts(state: tauri::State<'_, DatabaseState>) -> Result<Vec<Prompt>, Error> {
    let stmt = r#"
        SELECT
            uuid,
            name,
            slug,
            prompt,
            date_created,
            last_modified,
            is_active,
            notes
        FROM prompts
        ORDER BY name ASC
    "#;

    // Execute the query
    let query = sqlx::query_as::<_, Prompt>(stmt);

    let pool = &state.0;
    let prompts = query.fetch_all(pool).await?;

    println!("Retrieved {} prompts:", prompts.len());
    for prompt in prompts.iter() {
        println!(
            "  UUID: {:?}, Name: {}, Active: {}, Created: {}",
            prompt.uuid, prompt.name, prompt.is_active, prompt.date_created
        );
    }

    Ok(prompts)
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

#[tauri::command]
pub async fn get_ollama_version(config: IDefaultConfigs) -> Result<String, Error> {
    // In this command we use reqwest since ollama_rs does not have a method to get
    // the ollama server version
    let mut server = config.server_url.clone();
    if server.ends_with('/') {
        server.pop();
    }
    let url = format!("{}/api/version", server);
    println!("Fetching ollama version from {}", &url);

    let timeout = Duration::from_secs(config.clone().request_timeout); // in seconds
    let client = Client::new();

    // dbg!(&url);
    let response = client
        .get(url)
        .timeout(timeout)
        .send()
        .await
        .map_err(|err| {
            let err_str = format!("Version Request failed with status: {}", err);
            Error::StringError(err_str)
        })?;

    dbg!(&response);

    Ok(response
        .text()
        .await
        .unwrap_or(json!({"version": "_(Version Unavailable)"}).to_string()))
}

#[tauri::command]
pub async fn get_inference(
    config: IDefaultConfigs,
    params: TParamIteration,
    app_handle: tauri::AppHandle,
) -> Result<GenerationResponse, Error> {
    // println!("----------------------------------------------------------");
    // println!("Config and Params");
    // dbg!(&config);
    // dbg!(&params);
    // println!("----------------------------------------------------------");

    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    let ollama = Ollama::new(host_url, port);

    // Build generation options object
    // First the ones that are default values set in "settings"
    let mut options_builder = GenerationOptions::default();

    for &option_name in &[
        "num_ctx",
        "num_gqa",
        "num_gpu",
        "num_thread",
        "stop",
        "num_predict",
    ] {
        if let Some(value) = config.default_options.get(option_name) {
            match option_name {
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
                // Commented since a different seed is used at each generation (for the same model/params)
                // "seed" => {
                //     let parsed_value = value
                //         .to_string()
                //         .parse::<i32>()
                //         .expect("Failed to parse seed as i32");
                //     options_builder = options_builder.seed(parsed_value);
                // }
                "stop" => {
                    let parsed_value = vec![value.to_string()];
                    options_builder = options_builder.stop(parsed_value);
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

    // Set mandatory options based on user input
    let options = options_builder
        .temperature(params.temperature)
        .repeat_penalty(params.repeat_penalty)
        .top_k(params.top_k)
        .top_p(params.top_p)
        .repeat_last_n(params.repeat_last_n)
        .tfs_z(params.tfs_z)
        .mirostat(params.mirostat)
        .mirostat_tau(params.mirostat_tau)
        .mirostat_eta(params.mirostat_eta)
        .seed(params.seed);

    // dbg!(&options);

    // get prompt defined in settings
    //let system_prompt = &config.system_prompt;

    // Preload the model by sending an empty prompt
    // GenerationRequest::new(params.clone().model, "".to_string())
    //     .options(options.clone())
    //     .system(system_prompt.into())
    //     .keep_alive(KeepAlive::Indefinitely);

    let req = GenerationRequest::new(params.clone().model, params.clone().prompt)
        .options(options)
        .system(params.clone().system_prompt);
    // .keep_alive(KeepAlive::Indefinitely);

    dbg!(&req);

    // Process the inference; set a wrapper to check for timeouts
    let timeout = Duration::from_secs(config.request_timeout);
    let res = match time::timeout(timeout, ollama.generate(req)).await {
        Ok(result) => result,
        Err(_) => {
            let err_msg = format!("Request timed out after {} seconds", timeout.as_secs());
            println!("{}", err_msg);
            return Err(Error::StringError(err_msg));
        }
    };
    println!("---------------------------------------------");
    dbg!(&res);
    println!("---------------------------------------------");

    // sets the base path for storing logs
    // see https://github.com/tauri-apps/tauri/discussions/5557
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .unwrap_or_else(|| panic!("Failed to get application data directory"));
    let app_data_dir_str = app_data_dir.to_string_lossy();

    // Log the experiment if it's successful
    match res {
        Ok(generation_response) => {
            log_experiment(&config, &params, &generation_response, &app_data_dir_str).await?;
            Ok(generation_response)
        }
        Err(err) => Err(Error::StringError(err.to_string())),
    }
}

#[tauri::command]
pub fn get_experiments(app_handle: tauri::AppHandle) -> Result<Vec<ExperimentFile>, Error> {
    let binding = app_handle.path_resolver().app_data_dir().unwrap();
    let app_data_dir = binding.to_str().unwrap();
    let mut files: Vec<ExperimentFile> = fs::read_dir(app_data_dir)?
        .filter_map(Result::ok)
        .filter_map(|entry| {
            let path = entry.path();
            if path.extension().unwrap_or_default() != "json" {
                return None;
            }
            let metadata = fs::metadata(&path).ok()?;
            let created = metadata.created().ok()?;
            let contents = fs::read_to_string(&path).ok()?;
            Some(ExperimentFile {
                name: path.file_name()?.to_string_lossy().into_owned(),
                created,
                contents,
            })
        })
        .collect();

    files.sort_by_key(|file| file.created);
    files.reverse();
    Ok(files)
}

// ---
// Example below connects to the database
// ---

// #[tauri::command]
// pub async fn get_experiments(
//     state: tauri::State<'_, DatabaseState>,
// ) -> Result<Vec<ExperimentFile>, Error> {
//     // Access the database pool
//     let pool = &state.0;

//     // Example query
//     let experiments =
//         sqlx::query!("SELECT name, created, contents FROM experiments ORDER BY created DESC")
//             .fetch_all(pool)
//             .await
//             .map_err(|e| Error::StringError(e.to_string()))?;

//     // Convert to your ExperimentFile struct
//     let files: Vec<ExperimentFile> = experiments
//         .into_iter()
//         .map(|row| ExperimentFile {
//             name: row.name,
//             created: SystemTime::from(chrono::DateTime::parse_from_rfc3339(&row.created).unwrap()),
//             contents: row.contents,
//         })
//         .collect();

//     Ok(files)
// }

#[tauri::command]
pub fn delete_experiment_files(
    app_handle: tauri::AppHandle,
    file_name: String,
) -> Result<(), String> {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get application data directory".to_string())?;

    if file_name == "*" {
        // Delete all JSON files in the directory
        for entry in fs::read_dir(&app_data_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.is_file() && path.extension().map(|e| e == "json").unwrap_or(false) {
                fs::remove_file(path).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    } else {
        // Delete a specific file
        let file_path = app_data_dir.join(file_name);
        if file_path.exists() && file_path.is_file() {
            fs::remove_file(file_path).map_err(|e| e.to_string())?;
            Ok(())
        } else {
            // File doesn't exist, do nothing
            Ok(())
        }
    }
}
