# Change Log

All notable changes to this project will be documented in this file.

## [Version 0.1.2] - 2024-03-14

### Added

- UI tweaks to improve prompt modal (keyboard shortcut to update + tooltip on icon)

### Changed

- Fixed issue that allowed space delimited lists to pass parameter validation.

## [Version 0.1.1] - 2024-03-14

### Added

- The textarea for the prompt can be expanded to make editing more ergonomic

### Changed

- Prevents multiple instances of the app to run simultaneously.
- Uses the [Rust path module](https://docs.rs/tauri/latest/tauri/api/path/index.html) to store experiment logs (issue #4 - Read-only file system (os error 30) on MacOS).

## [Version 0.1.0] - 2024-03-13

### Added

- Lists previous experiment logs, downloadable as JSON files.

## [Version 0.0.3] - 2024-03-01

### Changed

- Added `Total Duration` ellapsed time to results metadata.
- Calculates `Throughput` based on `total duration` instead of `eval duration`.

## [Version 0.0.2] - 2024-03-01

### Added

- You can now define a list of `repeat_last_n` parameters when running a grid-search.
- Added a changelog.

### Changed

- Added definitions of concepts to starting screen.
