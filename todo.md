--- v0.0.1

[ok] - Test error handling when server fails
[ok] - Create settings control (modal)
[ok] - Edit README
[ok] - Use form and state values in settings form
[ok] - Check how to share state between backend and frontend
[ok] - Make parameter selection form
[ok] - Verify if Atom values for grid params can be scalar or always converted to lists (always convert to lists)
[ok] - Disable submit when queries are running (maybe add spinning icon)
[ok] - Improve collapsible that displays params, and other metadata
[ok] - Segregate spinner into its own component
[ok] - Add loader/spinner inside each result component
[ok] - Add fixed header to results pannel with controls to expand/collapse metadata in all inferences
[ok] - Add button to cancel/stop experiment
[ok] - Add confirmation dialog when stopping experiment
[ok] - Use Ollama server from settings in get_models and get inference
[ok] - refetch get_models periodically or add icon to refetch -> every 30s
[ok] - Use system prompt + user defined params and default params when invoking the completion API
[ok] - Move commands and utility functions to commands.rs and lib.rs
[ok] - Make desktop the default app, save old one
[ok] - Rename "desktop" id in Cargo.toml to grid-search-desktop
[ok] - Return full response from inference (after ollama-rs version bump)
[ok] - Add response metadata to results
[ok] - Verify if upstream issues with the "stop" option have been resolved (ommited until then)
[ok] - Changing server_url should preserve form data and current results. Just reload available models and default to first
[ok] - Format result's metadata in the frontend
[ok] - Redo README (add pics!)
[ok] - Test a multiplatform release

--- v0.0.2

[ok] - Add "tutorial" to start page
[ok] - Add "repeat_last_n" param to inferences

--- v0.0.3

[ok] - In response metadata, use total duration to calculate throughput

--- v0.1.0
[ok] - Log experiments to JSON files

--- v0.1.1
[ok] - Use the "single-instance" plugin to prevent multiple concurrent instances of the app
https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/single-instance

[ok] - Add option to display large textarea for prompt in a modal (check why it updates the experiment id in configs)

--- v0.1.2
[ok] - Add keyboard shortcuts
[ok] - input validation should check for commas as separators.
[ok] - "Full screen" prompt input

--- v0.2.0.
[ok] - Added "request_timeout" parameter to settings

--- v0.2.1
[ok] - Supports user input for adicional parameters: tfs_z, mirostat, mirostat_eta and mirostat_tau.

--- v0.2.2
[ok] - Adds the application's version number to the settings interfac
[ok] - Allows inspecting past experiments without downloading them

--- v0.3.0

[ok] - Calculate inference time and use this value to calc throughput.
[ok] - Display Ollama's version next to the selected server
[ok] - Check for slashes in server url
[ok] - refetch version when config changes

[ok] - Allow multiple generations for each param combination


--- v0.4.0

[ok] - PRs: UI improvements
[ok] - Add system prompt to main params form
[ok] - Fix issue with date of the experiment being updated on re-renders
[ok] - Present experiment inspection output in human readable format instead of JSON
[ok] - Add versioning to the JSON log files, starting at this release's version.


--- v0.5.0

[ok] - Multiple prompts
[ok] - Concurrent inferences
[ok] - Hide/Show model names
[ok] - Present experiment inspection output in human readable format instead of JSON
[ok] - Add versioning to the JSON log files, starting at this release's version.

--- v0.5.1
[ok] - Fixes generation responses not returning metadata (like eval_duration, total_duration, eval_count).
[ok] - Added Rust CI
[ok] - Added Clippy checks when saving Rust code
[ok] - Corrected existing Rust code to pass Clippy checks
[ok] - Fixed padding in "Expand/Hide" buttons for params and metadate
[ok] - Improved UI for component that displays inference parameters with collapsible prompts

--- v0.5.2
[ok] - Adds custom application icon
[ok] - Handles Ollama version info not being correctly returned by the server

--- v0.5.3
[ok] - Handles Ollama servers using default ports (80 or 443)

--- v0.6.0
[ok] - Added UI controls to re-run past experiments.
[ok] - Added controls to remove experiment files from the UI.
[ok] - Added button to copy an inference text to the clipboard.

[ok] - Fix HMR not working on MacOS (in development, of course).
[ok] - Moved "reload" icon to improve layout.
[ok] - Improved experiment inspection UI readability.
[ok] - Streamlined State management.

--- v0.6.1
[ok] - When removing all experiment logs, only JSON files should be deleted.
[ok] - Add colors to prompt and system_prompt when displaying inference params in results.
[ok] - Border colors are used on the side of a result to group outputs from the same model.

---

- Add CI checks for typescript code (ESLint?)
- Build options straight from config: https://github.com/pepperoni21/ollama-rs/blob/master/examples/options_from_json.rs

- Add feature to clear all existing log files.

- Convert code snippets to markdown in responses? (react-markdown didn't work well to filter code)
- Plan on saving results to SQLite
- Add a "default prompt" setting to settings?

- Add a way to filter visible results by params, or length or throughput?

- Cancel async commands:
  https://github.com/tauri-apps/tauri/discussions/5894
  https://github.com/tauri-apps/tauri/issues/8351

- Use new deserialize method to handle options:
  https://github.com/pepperoni21/ollama-rs/blob/master/examples/options_from_json.rs

- Implement limited concurrency options (nope... ollama runs one request at a time)

=====
On cloning past experiments, on form-grid-params

// Initiates for fields with value set in Settings > default options
// ! make a derived atom called formParams that combines gridParams and config
// ! and can be updated when cloning an experiment
// ! https://jotai.org/docs/guides/composing-atoms
// ! https://chatgpt.com/c/0ea69b31-988d-4e7b-bd7d-a6d2cc0d7347
