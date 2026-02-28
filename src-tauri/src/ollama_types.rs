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
