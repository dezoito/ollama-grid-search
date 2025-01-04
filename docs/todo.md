- Diff inference params when displaying results

- Use tauri-specta to export TS types from the rust structs
  https://github.com/specta-rs/tauri-specta/tree/v1.0.2

- Add CI checks for typescript code (ESLint?)

- Convert code snippets to markdown in responses? (react-markdown didn't work well to filter code)
- Plan on saving results to SQLite
- Add a "default prompt" setting to settings?

- Add a way to filter visible results by params, or length or throughput?

- Cancel async commands:
  https://github.com/tauri-apps/tauri/discussions/5894
  https://github.com/tauri-apps/tauri/issues/8351

- Use new deserialize method to handle options:
  https://github.com/pepperoni21/ollama-rs/blob/master/examples/options_from_json.rs
