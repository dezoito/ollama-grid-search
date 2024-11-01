use anyhow::Result;
use sqlx::{sqlite::SqlitePool, Pool, Sqlite};
use std::env;
use std::fs;
use tauri::AppHandle;

pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = app_handle
            .path_resolver()
            .app_data_dir()
            .expect("failed to get app dir");

        // Ensure the app directory exists
        fs::create_dir_all(&app_dir)?;

        let db_path = app_dir.join("grid_search.db");

        // Set the DATABASE_URL environment variable to point to this SQLite file
        env::set_var("DATABASE_URL", format!("sqlite://{}", db_path.display()));

        println!("-----------------------------------------------");
        println!("Initializing database at: {:?}", db_path);
        println!("-----------------------------------------------");

        // Create the connection options
        let connection_options = sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);

        // Create and initialize the database pool
        let pool = SqlitePool::connect_with(connection_options).await?;

        // Run migrations regardless of whether the database is new
        // SQLx will track which migrations have been run
        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }
}

// State management for Tauri
#[allow(dead_code)]
pub struct DatabaseState(pub Pool<Sqlite>);
