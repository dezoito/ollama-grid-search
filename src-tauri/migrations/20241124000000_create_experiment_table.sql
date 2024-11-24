CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created TEXT NOT NULL,
    contents TEXT NOT NULL,
    experiment_uuid TEXT UNIQUE NOT NULL,
    is_favorite BOOLEAN DEFAULT 0,
    date_created INTEGER NOT NULL DEFAULT (unixepoch('now'))
);
CREATE INDEX IF NOT EXISTS idx_experiments_uuid ON experiments(experiment_uuid);
