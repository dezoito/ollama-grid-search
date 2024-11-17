use crate::db::DatabaseState;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

use grid_search_desktop::Error;

#[derive(Debug, FromRow, Serialize)]
pub struct Prompt {
    pub uuid: String,
    pub name: String,
    pub slug: String,
    pub prompt: String,
    pub date_created: i64,  // Unix timestamp
    pub last_modified: i64, // Unix timestamp
}

#[derive(Debug, Deserialize)]
pub struct PromptInput {
    pub uuid: String,
    pub name: String,
    pub slug: String,
    pub prompt: String,
}

#[tauri::command]
pub async fn create_prompt(
    state: tauri::State<'_, DatabaseState>,
    input: PromptInput,
) -> Result<(), Error> {
    let pool = &state.0;
    let now = Utc::now().timestamp();

    let stmt = r#"
        INSERT INTO prompts (uuid, name, slug, prompt, date_created, last_modified)
        VALUES ($1, $2, $3, $4, $5, $6)
    "#;

    sqlx::query(stmt)
        .bind(&input.uuid)
        .bind(&input.name)
        .bind(&input.slug)
        .bind(&input.prompt)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

    println!("Created new prompt: {} ({})", input.name, input.uuid);
    Ok(())
}

#[tauri::command]
pub async fn update_prompt(
    state: tauri::State<'_, DatabaseState>,
    input: PromptInput,
) -> Result<(), Error> {
    let pool = &state.0;
    let now = Utc::now().timestamp();

    let stmt = r#"
        UPDATE prompts 
        SET name = $1, 
            slug = $2, 
            prompt = $3,
            last_modified = $4
        WHERE uuid = $5
    "#;

    let result = sqlx::query(stmt)
        .bind(&input.name)
        .bind(&input.slug)
        .bind(&input.prompt)
        .bind(now)
        .bind(&input.uuid)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(Error::StringError("Prompt not found".to_string()));
    }

    println!("Updated prompt: {} ({})", input.name, input.uuid);
    Ok(())
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
            last_modified
        FROM prompts
        ORDER BY lower(name) ASC
    "#;

    let query = sqlx::query_as::<_, Prompt>(stmt);
    let pool = &state.0;
    let prompts = query.fetch_all(pool).await?;

    println!("\nRetrieved {} prompts:", prompts.len());

    Ok(prompts)
}

#[tauri::command]
pub async fn delete_prompt(
    state: tauri::State<'_, DatabaseState>,
    uuid: String,
) -> Result<(), Error> {
    let pool = &state.0;

    let stmt = "DELETE FROM prompts WHERE uuid = $1";

    let result = sqlx::query(stmt).bind(&uuid).execute(pool).await?;

    if result.rows_affected() == 0 {
        return Err(Error::StringError("Prompt not found".to_string()));
    }

    println!("Deleted prompt with UUID: {}", uuid);
    Ok(())
}
