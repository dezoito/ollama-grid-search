# Ollama Grid Search Desktop App.

A Rust based tool to evaluate LLM models and model params, when using Ollama for inference.

## Purpose

This project aims to automate the process of selecting the best model parameters, given an LLM model and a prompt, iterating over the possible combinations and letting the user visually inspect the results.

It assumes the user has [Ollama](https://www.ollama.ai) installed and serving endpoints, either in `localhost` or in a remote server.

It is not a polished tool by any means but beats the heck out running experiments manually!

(For a more in-depth look at an evaluation process assisted by this tool, please check https://dezoito.github.io/2023/12/27/rust-ollama-grid-search.html).

## Grid Search (or something similar...)

Technically, the term "grid search" refers to iterating over a series of different model hyperparams to optimize model performance, but that usually means parameters like `batch_size`, `learning_rate`, or `number_of_epochs`, more commonly used in training.

But the concept here is similar:

Lets define a model, a prompt and some parameter combinations:

```rs
let ollama_url: &str = "http://localhost:11434/api/generate";
let model: &str = "codellama:7b";

let temperature_list: Vec<f32> = vec![0.66, 0.75, 0.9];
let repeat_penalty_list: Vec<f32> = vec![1.5, 1.75, 2.0];
let top_k_list: Vec<i8> = vec![75, 85];
let top_p_list: Vec<f32> = vec![0.72, 0.75, 0.8];

let prompt = r#"You are an experienced software developer.
Write a function that returns all even numbers within a range.
"#

```

The prompt will be submitted once for each out of the 54 possible combinations, using `codellama:7b` to generate numbered responses like:

```sh

1 - Test started at 2023-12-26 14:05:37:
Temperature: 0.66
Repeat Penalty: 1.5
Top_K: 75
Top_P: 0.72


Results
---
Eval Count: 137
Total Duration: 2m12s
Chars per second 1.04
Response:
"def find_even_numbers(start, end):
        even_numbers = [num for num in range(start, end + 1) if num % 2 == 0]
    return even_numbers
"

---------------------------------------

2 - Test started at 2023-12-26 14:07:49:
Temperature: 0.66
Repeat Penalty: 1.5
Top_K: 75
Top_P: 0.75

...
```

Notice that some useful stats are displayed with the generated response.

Once all combinations are completed, the script will display some global statistics:

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
