# Development Notes and (some) Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Understanding the Project](#understanding-the-project)
  - [App Workflow](#app-workflow)
  - [Sequence Diagram](#sequence-diagram)
- [Database Migrations](#database-migrations)
- [Getting Help](#getting-help)

## Getting Started

1. Make sure you have Rust installed.

2. Clone the repository (or a fork)

```sh
git clone https://github.com/dezoito/ollama-grid-search.git
cd ollama-grid-search
```

3. Install the frontend dependencies.

   ```sh
   cd <project root>
   # I'm using bun to manage dependencies,
   # but feel free to use yarn or npm
   bun install
   ```

4. Make sure `rust-analyzer` is configured to run `Clippy` when checking code.

   If you are running VS Code, add this to your `settings.json` file

   ```json
   {
      ...
      "rust-analyzer.check.command": "clippy",
   }
   ```

   (or, better yet, just use the settings file provided with the code)

5. Run the app in development mode
   ```sh
   cd <project root>/
   bun tauri dev
   ```
6. Go grab a cup of coffee because this may take a while.

## Understanding the Project

Please refer to the workflow chart and sequence diagram to get a better understanding of how information is passed from one component to the other.

This is mostly focused on the React code, which drives the flow and interactions (whereas the Rust code is a bridge to the LLMs and Database).

### App Workflow

[<img src="./app-workflow.png?raw=true" alt="App Workflow" width="720">](./app-workflow.png)
You can access the [mermaid file](./app-workflow.mermaid) for this workflow in the `./docs` folder.

### Sequence Diagram

[<img src="./sequence-diagram.png?raw=true" alt="Sequence Diagram" width="720">](./sequence-diagram.png)

## Database Migrations

The project uses [SQLx](https://docs.rs/sqlx/latest/sqlx/) for database operations. When making changes to the database schema, create new migration files in the `migrations` directory. These files are executed in order based on their timestamps. For more details about SQLx migrations, check out the [Migrations Guide](https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md#migrate) in the documentation.

Here's an example of a migration file that creates an experiments table:

```sql
-- migration_example.sql
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created TEXT NOT NULL,
    contents TEXT NOT NULL,
    experiment_uuid TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiments_uuid ON experiments(experiment_uuid);
```

For more details on how we implemented SQLite in this application, check out this article:
[Rust - Embedding a SQLite database in a Tauri Application](https://dezoito.github.io/2025/01/01/embedding-sqlite-in-a-tauri-application.html).

## Getting Help

If you need help, or spot any inconsistencies in this documentation, please open a new issue.
