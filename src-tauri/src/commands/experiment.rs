use grid_search_desktop::{Error, ExperimentFile};
use std::fs;

use crate::db::DatabaseState;

#[tauri::command]
pub async fn get_experiments(
    state: tauri::State<'_, DatabaseState>,
    // app_handle: tauri::AppHandle,
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
    dbg!(&experiments);
    Ok(experiments)

    // let binding = app_handle.path_resolver().app_data_dir().unwrap();
    // let app_data_dir = binding.to_str().unwrap();
    // let mut files: Vec<ExperimentFile> = fs::read_dir(app_data_dir)?
    //     .filter_map(Result::ok)
    //     .filter_map(|entry| {
    //         let path = entry.path();
    //         if path.extension().unwrap_or_default() != "json" {
    //             return None;
    //         }
    //         let metadata = fs::metadata(&path).ok()?;
    //         let created = metadata.created().ok()?;
    //         let contents = fs::read_to_string(&path).ok()?;
    //         Some(ExperimentFile {
    //             name: path.file_name()?.to_string_lossy().into_owned(),
    //             created,
    //             contents,
    //         })
    //     })
    //     .collect();

    // files.sort_by_key(|file| file.created);
    // files.reverse();
    // Ok(files)
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
