-- Add migration script here
CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created TEXT NOT NULL,
    contents TEXT NOT NULL,
    experiment_uuid TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiments_uuid ON experiments(experiment_uuid);
