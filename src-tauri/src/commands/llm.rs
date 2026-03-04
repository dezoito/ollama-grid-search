use crate::db::DatabaseState;
use reqwest::Client;
use serde_json::json;
use tokio::time::{self, Duration};

use grid_search_desktop::{
    log_experiment, split_host_port, Error, IDefaultConfigs, TParamIteration,
};

#[tauri::command]
pub async fn get_models(config: IDefaultConfigs, local_only: bool) -> Result<Vec<String>, Error> {
    let mut server = config.server_url.clone();
    if server.ends_with('/') {
        server.pop();
    }
    let url = format!("{}/api/tags", server);
    println!("Fetching models from {}", &url);

    let timeout = Duration::from_secs(config.request_timeout);
    let client = Client::new();

    let response = client
        .get(url)
        .timeout(timeout)
        .send()
        .await
        .map_err(|err| {
            let err_str = format!("Model list request failed: {}", err);
            Error::StringError(err_str)
        })?;

    let models_response: grid_search_desktop::ollama_types::ListLocalModelsResponse = response
        .json()
        .await
        .map_err(|err| {
            let err_str = format!("Failed to parse models response: {}", err);
            Error::StringError(err_str)
        })?;

    let model_list: Vec<String> = models_response.models
        .into_iter()
        .filter(|model| {
            // Optionally filter out cloud models using the helper method
            if local_only && model.is_cloud() {
                return false;
            }

            // Always exclude embedding models (bert family)
            if let Some(ref details) = model.details {
                if let Some(ref family) = details.family {
                    if family.contains("bert") {
                        return false;
                    }
                }
            }

            true
        })
        .map(|model| model.name)
        .collect();

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
    state: tauri::State<'_, DatabaseState>,
    config: IDefaultConfigs,
    params: TParamIteration,
) -> Result<grid_search_desktop::GenerationResponse, Error> {
    let mut server = config.server_url.clone();
    if server.ends_with('/') {
        server.pop();
    }
    let url = format!("{}/api/generate", server);

    // Build generation options object
    let mut options_builder = grid_search_desktop::ModelOptions::default();

    for &option_name in &[
        "num_ctx", "num_gqa", "num_gpu", "num_thread", "stop", "num_predict",
    ] {
        if let Some(value) = config.default_options.get(option_name) {
            match option_name {
                "num_ctx" => {
                    let parsed_value = value.to_string().parse::<u64>()
                        .expect("Failed to parse num_ctx as u64");
                    options_builder = options_builder.num_ctx(parsed_value);
                }
                "num_gqa" => {
                    let parsed_value = value.to_string().parse::<u32>()
                        .expect("Failed to parse num_gqa as u32");
                    options_builder = options_builder.num_gqa(parsed_value);
                }
                "num_gpu" => {
                    let parsed_value = value.to_string().parse::<u32>()
                        .expect("Failed to parse num_gpu as u32");
                    options_builder = options_builder.num_gpu(parsed_value);
                }
                "num_thread" => {
                    let parsed_value = value.to_string().parse::<u32>()
                        .expect("Failed to parse num_thread as u32");
                    options_builder = options_builder.num_thread(parsed_value);
                }
                "stop" => {
                    let parsed_value = vec![value.to_string()];
                    options_builder = options_builder.stop(parsed_value);
                }
                "num_predict" => {
                    let parsed_value = value.to_string().parse::<i32>()
                        .expect("Failed to parse num_predict as i32");
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

    let req = grid_search_desktop::GenerationRequest::new(
        params.clone().model,
        params.clone().prompt,
    )
    .options(options)
    .system(params.clone().system_prompt);

    dbg!(&req);

    // Make HTTP request
    let timeout = Duration::from_secs(config.request_timeout);
    let client = Client::new();

    let http_response = time::timeout(
        timeout,
        client.post(&url).json(&req).send()
    ).await.map_err(|_| {
        let err_msg = format!("Request timed out after {} seconds", timeout.as_secs());
        Error::StringError(err_msg)
    })?;

    let http_response = http_response.map_err(|err| {
        let err_str = format!("Generation request failed: {}", err);
        Error::StringError(err_str)
    })?;

    let generation_response: grid_search_desktop::GenerationResponse = http_response
        .json()
        .await
        .map_err(|err| {
            let err_str = format!("Failed to parse generation response: {}", err);
            Error::StringError(err_str)
        })?;

    println!("---------------------------------------------");
    dbg!(&generation_response);
    println!("---------------------------------------------");

    // Log the experiment if successful
    let pool = &state.0;
    log_experiment(pool, &config, &params, &generation_response).await?;
    Ok(generation_response)
}
