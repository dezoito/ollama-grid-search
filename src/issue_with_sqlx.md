30-oct-2024

When using sqlx, we generally want to use the macro `query!` since it performs compile-time verification of your SQL queries against your database schema.

It also allows you to map results directly to structs:

````rs
    let experiments =
        sqlx::query!("SELECT name, created, contents FROM experiments ORDER BY created DESC")
            .fetch_all(pool)
            .await
            .map_err(|e| Error::StringError(e.to_string()))?;

    // Convert to your ExperimentFile struct
    let files: Vec<ExperimentFile> = experiments
        .into_iter()
        .map(|row| ExperimentFile {
            name: row.name,
            created: SystemTime::from(chrono::DateTime::parse_from_rfc3339(&row.created).unwrap()),
            contents: row.contents,
        })
        .collect();
    ```

    The caveat is that it forces the developer to:

    1. Store the database URL in an environment variablae (and it can vary, according to the target OS)

    Or

    2. Use `cargo sqlx prepare` to generate query cache files, that are used during compile time.

The commands for the second option are:

```sh
cargo install sqlx-cli
cargo sqlx prepare -- --lib
```

The prepared queries approach is preferred for production builds because:

It doesn't require a live database connection during compilation
It catches SQL errors at compile time
It works in CI/CD environments
It version controls your query metadata

==== A simpler option, which does not require the steps above, but does not perform compile time verification, is to use the `query()` function, rather than the macro above.

This option DOES NOT map rows directly to structs:


```rs
use sqlx::Row; // To extract columns manually from rows

let experiments = sqlx::query("SELECT name, created, contents FROM experiments ORDER BY created DESC")
    .fetch_all(pool)
    .await
    .map_err(|e| Error::StringError(e.to_string()))?;

// Map the result to your `ExperimentFile` struct
let files: Vec<ExperimentFile> = experiments
    .into_iter()
    .map(|row| ExperimentFile {
        name: row.try_get("name").unwrap_or_default(),
        created: SystemTime::from(chrono::DateTime::parse_from_rfc3339(&row.try_get::<String, _>("created").unwrap()).unwrap()),
        contents: row.try_get("contents").unwrap_or_default(),
    })
    .collect();

Ok(files)

```

============

If we choose to use the macro:

When the database file is created at runtime with a dynamic path, you can work around the `sqlx` compile-time check by:

1. **Manually creating a temporary SQLite file** in an expected location for `cargo sqlx prepare` and setting `DATABASE_URL` to point to it, so `sqlx` can use it to cache the query metadata.

2. **Using conditional compilation or environment variables** to skip or simulate this check during compile-time for `sqlx`.

### Solution 1: Temporary Database Path for Development

You can manually create a temporary SQLite file at a known path during development, then set `DATABASE_URL` to point to it for running `cargo sqlx prepare`. For example:

1. Create a directory (e.g., `db`) in your project root and add a temporary SQLite file, e.g., `db/temp_database.sqlite`.

2. Export `DATABASE_URL` to point to this file before running `cargo sqlx prepare`:

   ```sh
   export DATABASE_URL="sqlite://db/temp_database.sqlite"
   cargo sqlx prepare
   ```

3. **Make sure this path is only used for development** and avoid using this database file in production by wrapping it in a check, like so:

   ```rust
   #[cfg(debug_assertions)]
   dotenv::dotenv().ok();
   let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| format!("sqlite://{}", app_handle.path_resolver().app_data_dir().unwrap().join("runtime_database.sqlite").display()));
   ```

### Solution 2: Use Environment Flags to Bypass `sqlx` in CI/Production

If the database is strictly dynamic and varies on OS, you can conditionally run `sqlx prepare` in your development environment only, and bypass it in CI/production where `DATABASE_URL` might not be available. Here's an example:

```sh
# Run in dev mode with query checking
DATABASE_URL="sqlite://db/temp_database.sqlite" cargo sqlx prepare

# Run in CI/Production without query checking
SQLX_OFFLINE=true cargo build --release
```

### Explanation

- **`DATABASE_URL` for Development**: Setting `DATABASE_URL` during development lets `sqlx` prepare and cache the metadata for the queries in an offline `.sqlx` file.
- **`SQLX_OFFLINE=true` for Production**: This lets you compile without needing `DATABASE_URL` at runtime.
````

---

The actual database file created by the app is saved at
~/Library/Application Support/com.github.dezoito.gridsearch/

! We need to _copy_ the database file to (whenever changes are made to the schema):

temp/grid_search.db

so we can run `DATABASE_URL="sqlite://temp/grid_search.db" cargo sqlx prepare` from /src-tauri

[that fixed the warnings and compilation errors]

### Opening the actual database file

```sh
cd ~/Library/Application\ Support/com.github.dezoito.gridsearch
open -a "DB Browser for SQLite" grid_search.db

# or
open -a "DB Browser for SQLite" ~/Library/Application\ Support/com.github.dezoito.gridsearch/grid_search.db
```

REFS
https://tauritutorials.com/blog/building-a-todo-app-in-tauri-with-sqlite-and-sqlx

https://users.rust-lang.org/t/help-needed-with-sqlx-query-macro-and-database-url-in-a-rust-discord-bot/103914

https://github.com/launchbadge/sqlx/tree/main/sqlx-cli#readme

https://www.shuttle.dev/blog/2023/10/04/sql-in-rust

https://www.youtube.com/watch?v=TCERYbgvbq0&t=511s

============
Forget using macros such as query! and quey_as! . just use the non macro functions
and skip runing `cargo sqlx prepare` and copying db files and all the nonsense

=================
When inserting experiments into the DB
1- we really should separate an experiment from its generations
2- we are not going to do it, though, but we must check if an experiment exists before trying to add a generation to its `contents` field!!!!

3- (we also have to handle deleting existing experiments now)
