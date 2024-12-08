use grid_search_desktop::{Error, ExperimentFile};

use crate::db::DatabaseState;

#[tauri::command]
pub async fn get_experiments(
    state: tauri::State<'_, DatabaseState>,
) -> Result<Vec<ExperimentFile>, Error> {
    let stmt = r#"
        SELECT
            name,
            created,
            contents
        FROM experiments
        ORDER BY id DESC
    "#;

    let query = sqlx::query_as::<_, ExperimentFile>(stmt);
    let pool = &state.0;
    let experiments = query.fetch_all(pool).await?;

    println!("\nRetrieved {} experiments:", experiments.len());
    Ok(experiments)
}

#[tauri::command]
pub async fn delete_experiments(
    state: tauri::State<'_, DatabaseState>,
    uuid: String,
) -> Result<(), Error> {
    let pool = &state.0;

    let stmt: &str = match uuid.as_str() {
        "*" => "DELETE FROM experiments",
        _ => "DELETE FROM experiments WHERE experiment_uuid = $1",
    };

    let _ = sqlx::query(stmt).bind(&uuid).execute(pool).await?;
    print!("Deleted experiment with UUID: {}", uuid);

    Ok(())
}
