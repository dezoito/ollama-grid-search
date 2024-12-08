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
use chrono::Utc;
use ollama_rs::error::OllamaError;
use ollama_rs::generation::completion::GenerationResponse;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use sqlx::prelude::FromRow;
use sqlx::Pool;
use sqlx::Sqlite;
use std::collections::HashMap;
use thiserror::Error;
use url::{ParseError, Url};

use eff_wordlist::short::random_word;
use sqlx::Error as SqlxError;
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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ExperimentFile {
    pub name: String,
    pub created: String,
    pub contents: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Experiment {
    pub id: Option<i64>,
    pub name: String,
    pub contents: String,
    pub experiment_uuid: String,
    pub is_favorite: bool,
    pub created: String,
    pub date_created: Option<i64>,
}

impl Experiment {
    /// Create a new experiment
    pub fn new(
        name: String,
        contents: String,
        experiment_uuid: String,
        created: String,
        is_favorite: bool,
    ) -> Self {
        Self {
            id: None, // Will be set by database on insertion
            name,
            contents,
            experiment_uuid,
            is_favorite,
            created,
            date_created: None, // Will be set by database on insertion
        }
    }
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

    // New variant for database errors
    #[error(transparent)]
    Database(#[from] SqlxError),

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

pub fn create_experiment_name() -> String {
    // uses eff_short_wordlist to create a name
    // composed of three random words for an experiment
    let mut word_vec = vec![];
    for _ in 0..3 {
        word_vec.push(random_word());
    }
    word_vec.join("-")
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
    let port = some_url.port().unwrap_or_else(|| {
        if some_url.scheme() == "https" {
            443
        } else {
            80
        }
    });
    Ok((
        format!("{}://{}", some_url.scheme(), some_url.host_str().unwrap(),),
        port,
    ))
}

pub async fn log_experiment(
    pool: &Pool<Sqlite>,
    config: &IDefaultConfigs,
    params: &TParamIteration,
    res: &GenerationResponse,
) -> Result<(), Error> {
    let experiment_uuid = &params.experiment_uuid;

    // Create a log data JSON structure
    let log_data = json!({
        "experiment_uuid": experiment_uuid,
        "datetime": Utc::now().to_string(),
        "log_version": "0.5.0",
        "config": config,
        "inferences": [
            {
                "parameters": params,
                "result": res
            }
        ]
    });

    // query the database to see if the experiment already exists
    let stmt = "SELECT * FROM experiments WHERE experiment_uuid = $1";

    // Use a more idiomatic approach to handle the optional result
    match sqlx::query_as::<_, Experiment>(stmt)
        .bind(experiment_uuid)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?
    {
        Some(existing_experiment) => {
            // Update the existing experiment
            let mut contents: Value = serde_json::from_str(&existing_experiment.contents)
                .map_err(|e| Error::StringError(e.to_string()))?;

            contents["inferences"].as_array_mut().unwrap().push(json!({
                "parameters": params,
                "result": res
            }));

            let stmt = r#"
                UPDATE experiments
                SET contents = $1, created = $2
                WHERE experiment_uuid = $3
            "#;

            sqlx::query(stmt)
                .bind(serde_json::to_string(&contents)?.to_string())
                .bind(Utc::now().to_string())
                .bind(experiment_uuid)
                .execute(pool)
                .await?;
        }
        None => {
            // Create a new experiment record
            let experiment = Experiment::new(
                create_experiment_name(),
                serde_json::to_string(&log_data)?.to_string(),
                experiment_uuid.to_string(),
                Utc::now().to_string(),
                false,
            );

            let stmt = r#"
                INSERT INTO experiments (
                    name,
                    contents,
                    experiment_uuid,
                    created,
                    is_favorite
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
            "#;
            sqlx::query(stmt)
                .bind(experiment.name)
                .bind(experiment.contents)
                .bind(experiment.experiment_uuid)
                .bind(experiment.created)
                .bind(experiment.is_favorite)
                .execute(pool)
                .await?;
        }
    }

    Ok(())
}
