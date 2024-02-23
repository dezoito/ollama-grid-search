# Ollama Grid Search Desktop App.

A Rust based tool to evaluate LLM models and model params, when using Ollama for inference.

It uses Tauri to setup a Rust "backend" on your desktop, and React to render an intuitive interface.

## Development

This project is still in very early development.

If you wish to try it or contribute, here's what you should do:

1. Install Rust:
   https://www.rust-lang.org/tools/install

2. Clone the project and checkout the "tauri" branch.

   ```sh
   git clone https://github.com/dezoito/ollama-grid-search.git
   cd ollama-grid-search
   git checkout tauri

   ```

3. Install the frontend dependencies.

   ```sh
   cd <project root>/desktop
   # I'm using bun to manage dependecies,
   # but feel free to use yarn or npm
   git checkout tauri
   bun install
   ```

4. Run the app in development mode
   ```sh
   cd <project root>/desktop
   bun run tauri dev
   ```
