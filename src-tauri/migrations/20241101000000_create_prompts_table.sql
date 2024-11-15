-- Add migration script name
-- Description: Create prompts table
-- Version: 20241101000000
-- Create the prompts table
CREATE TABLE prompts (
    uuid TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    prompt TEXT NOT NULL,
    date_created INTEGER NOT NULL DEFAULT (unixepoch('now')),
    last_modified INTEGER NOT NULL DEFAULT (unixepoch('now')),
    -- Add constraints to ensure data integrity
    CHECK (length(name) > 0),
    CHECK (length(slug) > 0),
    CHECK (length(prompt) > 0)
);

-- Create trigger to update last_modified automatically
CREATE TRIGGER update_prompts_last_modified
AFTER
UPDATE
    ON prompts FOR EACH ROW
    WHEN OLD.last_modified = NEW.last_modified BEGIN
UPDATE
    prompts
SET
    last_modified = unixepoch('now')
WHERE
    uuid = NEW.uuid;

END;

-- Create indexes for common lookups
CREATE INDEX idx_prompts_date_created ON prompts(date_created);

CREATE INDEX idx_prompts_name ON prompts(name);
CREATE INDEX idx_prompts_slug ON prompts(slug);

