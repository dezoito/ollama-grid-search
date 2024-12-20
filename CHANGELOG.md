# Change Log

All notable changes to this project will be documented in this file.

## [Version 0.9.0] - 2024-12-20

### Added

- Support for navigating over [variable] placeholders in prompts, to paste input.
- Tooltips in upper menu corners.

### Changed

- Renamed components that had stupid names.
- Removed MacOS 12 from the supported OSes when building releases (blame GH Actions).
- Experimentally added support for MacOS 13.

## [Version 0.8.0] - 2024-12-08

### Changed

- Experiments are stored in a database. File system is not used anymore.
- Minor UI improvements in the Experiment selecion UI.

## [Version 0.7.0] - 2024-11-24

### Added

- Fully functional prompt management UI
- Prompt inputs can trigger autocomplete by starting with "/"
- Added SQLite integration for prompt management and other developments

### Changed

- Several small UI improvements (mostly using ScrollAreas instead of overflows - Improved validation rules on experiment form

## [Version 0.6.2] - 2024-10-29

### Fixed

- The "refetch" button must be shown when there was an error in the inference call.

## [Version 0.6.1] - 2024-10-28

### Changed

- When removing all experiment logs, only JSON files should be deleted.
- Add colors to prompt and system_prompt when displaying inference params in results.
- Border colors are used on the side of a result to group outputs from the same model.

## [Version 0.6.0] - 2024-10-20

### Added

- Added UI controls to re-run past experiments.
- Added controls to remove experiment files from the UI.
- Added button to copy an inference text to the clipboard.

### Changed

- Moved "reload" icon to improve layout.
- Improved experiment inspection UI readability.
- Streamlined State management.

### Fixes

- Fix HMR not working on MacOS (in development, of course).

## [Version 0.5.3] - 2024-09-16

### Fixes

- Handles Ollama servers using default ports (80 or 443).

## [Version 0.5.2] - 2024-09-15

### Added

- Adds custom application icon.

### Fixes

- Handles Ollama version info not being correctly returned by the server.

## [Version 0.5.1] - 2024-07-10

### Added

- Added Clippy checks when saving Rust code.
- Corrected existing Rust code to pass Clippy checks.
- Improved UI for component that displays inference parameters with collapsible prompts.

### Changed

- Fixes generation responses not returning metadata (like `eval_duration`, `total_duration`, `eval_count`).
- Added Rust CI checks.
- Fixed padding in "Expand/Hide" buttons for params and metadate.
- `keep-alive` parameter for generation is set to Ollama's default (instead of `indefinitely`).

## [Version 0.5.0] - 2024-05-10

### Added

- Allows multiple prompts when running experiments (courtesy of @calebsheridan).
- Allows multiple concurrent inference calls, matching Ollama's support for concurrency.
- Allows user to hide model names on the results pane, to avoid bias in evaluations.
- Added `concurrent_inferences` input to settings.
- Added `hide_model_names` input to settings.

### Changed

- Experiment inspection view was updated to show which prompt was used for each iteration, preserving their line breaks (courtesy of @calebsheridan).
- Minor UI tweaks.

## [Version 0.4.3] - 2024-05-01

### Fixes

- Bug in new installations that had no previous configs for "system prompt"

## [Version 0.4.2] - 2024-05-01

### Added

- Adds basic self-signed code signing to macOS app/DMG.

### Changed

- Bumps Linux build runner version to current stable.
- Builds for both ARM and x86 macOS separately.
- Bumps Tauri package versions to current stable.

All contributions from @sammcj!

## [Version 0.4.1] - 2024-04-27

### Changed

- Github action now builds releases for INTEL and AARCH based Macs.
- Bumped `ollama-rs` to version 0.1.9.
- Improved readability for past experiments.

## [Version 0.4.0] - 2024-04-26

### Added

- Added system prompt to main form.
- Added versioning to the JSON log files, starting at this release's version.

### Changed

- Many UI improvements (Thanks to @calebsheridan).
- Fixes issue with date of the experiment being updated on re-renders.
- Presents experiment inspection output in human readable format instead of JSON.
- Fixes bug where the experiment's start date would be updated on component's re-render.

## [Version 0.3.0] - 2024-04-12

### Added

- Allows multiple generations for each combination of parameters.
- Improved metrics are displayed after inference results.
- Allows inspecting past experiments without the need to download the corresponding file.
- Displays current version number to the settings interface.
- Displays the version of Ollama running on the selected server.

## [Version 0.2.1] - 2024-03-24

### Added

- Supports user input for adicional parameters: `tfs_z`, `mirostat`, `mirostat_eta` and `mirostat_tau`.

## [Version 0.2.0] - 2024-03-23

### Added

- Added a "request_timeout" parameter to settings that controls the amount of time (in seconds),
  the application should wait for an inference call to complete before returning and error (for that individual call). This is useful as, IME, some combinations of parameters can make models hang.

## [Version 0.1.2] - 2024-03-14

### Added

- UI tweaks to improve prompt modal (keyboard shortcut to update + tooltip on icon).

### Changed

- Fixed issue that allowed space delimited lists to pass parameter validation.

## [Version 0.1.1] - 2024-03-14

### Added

- The textarea for the prompt can be expanded to make editing more ergonomic.

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
