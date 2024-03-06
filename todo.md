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
[ok]- Log experiments to JSON files

---

- Make experiments available

  - to download (as JSON)
  - to visualize (as JSON)?
  - to re-run with the same parameters and defaults
  - add icons for each task

- Add mention of experiments to tutorial

- Add a damn icon.

- Add movable divider component
- Add keyboard shortcuts
- Implement single instance check https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/single-instance

- Add option to display large textarea for prompt in a modal
- Convert code snippets to markdown in responses? (react-markdown didn't work well to filter code)
- Plan on saving results to SQLite
- Add a "default prompt" setting to settings?

- Cancel async commands:
  https://github.com/tauri-apps/tauri/discussions/5894
  https://github.com/tauri-apps/tauri/issues/8351

- Use new deserialize method to handle options:
  https://github.com/pepperoni21/ollama-rs/blob/master/examples/options_from_json.rs

- Implement limited concurrency options
