use crate::db::DatabaseState;
use reqwest::Client;
use serde_json::json;
use tokio::time::{self, Duration};

use grid_search_desktop::{
    log_experiment, split_host_port, Error, IDefaultConfigs, TParamIteration,
};

use ollama_rs::{
    generation::{
        completion::{request::GenerationRequest, GenerationResponse},
        options::GenerationOptions,
        // parameters::KeepAlive,
    },
    Ollama,
};

#[tauri::command]
pub async fn get_models(config: IDefaultConfigs) -> Result<Vec<String>, Error> {
    let (host_url, port) = split_host_port(&config.server_url).unwrap();
    println!("Fetching models from {}", &host_url);
    let ollama = Ollama::new(host_url, port);
    let models = ollama.list_local_models().await?;
    // * Can't filter out embeding models since the model family
    // * is not returned by ollama-rs
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
    state: tauri::State<'_, DatabaseState>,
    config: IDefaultConfigs,
    params: TParamIteration,
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

    // Log the experiment if it's successful
    let pool = &state.0;
    match res {
        Ok(generation_response) => {
            log_experiment(pool, &config, &params, &generation_response).await?;
            Ok(generation_response)
        }
        Err(err) => Err(Error::StringError(err.to_string())),
    }
}
