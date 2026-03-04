use serde::{Deserialize, Serialize};

/// Model returned from /api/tags endpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalModel {
    pub name: String,
    pub model: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub remote_model: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub remote_host: Option<String>,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub details: Option<ModelDetails>,
}

impl LocalModel {
    pub fn is_cloud(&self) -> bool {
        self.remote_model.is_some()
    }

    pub fn is_local(&self) -> bool {
        !self.is_cloud()
    }
}

/// Technical details about a model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelDetails {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_model: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub family: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub families: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parameter_size: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quantization_level: Option<String>,
}

/// Response from /api/tags
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListLocalModelsResponse {
    pub models: Vec<LocalModel>,
}

/// Error type for Ollama operations
#[derive(Debug, thiserror::Error)]
pub enum OllamaError {
    #[error("Request error: {0}")]
    Request(String),
    #[error("JSON error: {0}")]
    Json(String),
    #[error("Ollama server error: {0}")]
    Server(String),
}

/// Response from /api/generate endpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationResponse {
    pub model: String,
    pub created_at: String,
    pub response: String,
    pub done: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<i32>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub total_duration: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub load_duration: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt_eval_count: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt_eval_duration: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub eval_count: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub eval_duration: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub thinking: Option<String>,
}

/// Model options for generation (builder pattern)
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ModelOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mirostat: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mirostat_eta: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mirostat_tau: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_ctx: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_gqa: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_gpu: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_thread: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repeat_last_n: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repeat_penalty: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tfs_z: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_predict: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
}

impl ModelOptions {
    pub fn mirostat(mut self, mirostat: u8) -> Self {
        self.mirostat = Some(mirostat);
        self
    }
    pub fn mirostat_eta(mut self, v: f32) -> Self {
        self.mirostat_eta = Some(v);
        self
    }
    pub fn mirostat_tau(mut self, v: f32) -> Self {
        self.mirostat_tau = Some(v);
        self
    }
    pub fn num_ctx(mut self, v: u64) -> Self {
        self.num_ctx = Some(v);
        self
    }
    pub fn num_gqa(mut self, v: u32) -> Self {
        self.num_gqa = Some(v);
        self
    }
    pub fn num_gpu(mut self, v: u32) -> Self {
        self.num_gpu = Some(v);
        self
    }
    pub fn num_thread(mut self, v: u32) -> Self {
        self.num_thread = Some(v);
        self
    }
    pub fn repeat_last_n(mut self, v: i32) -> Self {
        self.repeat_last_n = Some(v);
        self
    }
    pub fn repeat_penalty(mut self, v: f32) -> Self {
        self.repeat_penalty = Some(v);
        self
    }
    pub fn temperature(mut self, v: f32) -> Self {
        self.temperature = Some(v);
        self
    }
    pub fn seed(mut self, v: i32) -> Self {
        self.seed = Some(v);
        self
    }
    pub fn stop(mut self, v: Vec<String>) -> Self {
        self.stop = Some(v);
        self
    }
    pub fn tfs_z(mut self, v: f32) -> Self {
        self.tfs_z = Some(v);
        self
    }
    pub fn num_predict(mut self, v: i32) -> Self {
        self.num_predict = Some(v);
        self
    }
    pub fn top_k(mut self, v: u32) -> Self {
        self.top_k = Some(v);
        self
    }
    pub fn top_p(mut self, v: f32) -> Self {
        self.top_p = Some(v);
        self
    }
}

/// Request for /api/generate endpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationRequest {
    #[serde(rename = "model")]
    pub model_name: String,
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<ModelOptions>,
    #[serde(default = "default_stream")]
    pub stream: bool,
}

fn default_stream() -> bool {
    false
}

impl GenerationRequest {
    pub fn new(model_name: String, prompt: String) -> Self {
        Self {
            model_name,
            prompt,
            system: None,
            options: None,
            stream: false,
        }
    }

    pub fn options(mut self, options: ModelOptions) -> Self {
        self.options = Some(options);
        self
    }

    pub fn system(mut self, system: String) -> Self {
        self.system = Some(system);
        self
    }
}
