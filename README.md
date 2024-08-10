# Ollama Grid Search and A/B Testing Desktop App.

A Rust based tool to evaluate LLM models, prompts and model params.

(Issues with Llama3? Please read [this](https://github.com/dezoito/ollama-grid-search/issues/8)).

## Purpose

This project automates the process of selecting the best models, prompts, or inference parameters for a given use-case, allowing you to iterate over their combinations and to visually inspect the results.

It assumes [Ollama](https://www.ollama.ai) is installed and serving endpoints, either in `localhost` or in a remote server.

## Quick Example

Here's a test for the prompt "Write a short sentence about HAL9000", tested on 2 models, using `0.7` and `1.0` as values for `temperature`:

[<img src="./screenshots/main.png?raw=true" alt="Main Screenshot" width="720">](./screenshots/main.png?raw=true)

(For a more in-depth look at an evaluation process assisted by this tool, please check https://dezoito.github.io/2023/12/27/rust-ollama-grid-search.html).

## Installation

Check the [releases page](https://github.com/dezoito/ollama-grid-search/releases) for the project, or on the sidebar.

## Features

- Automatically fetches models from local or remote Ollama servers;
- Iterates over different models, prompts and parameters to generate inferences;
- A/B test different prompts on several models simultaneously;
- Allows multiple iterations for each combination of parameters;
- Allows [limited concurrency](https://dezoito.github.io/2024/03/21/react-limited-concurrency.html) **or** synchronous inference calls (to prevent spamming servers);
- Optionally outputs inference parameters and response metadata (inference time, tokens and tokens/s);
- Refetching of individual inference calls;
- Model selection can be filtered by name;
- List experiments which can be downloaded in JSON format;
- Experiments can be inspected in readable views;
- Configurable inference timeout;
- Custom default parameters and system prompts can be defined in settings:

[<img src="./screenshots/settings.png?raw=true" alt="Settings" width="720">](./screenshots/settings.png?raw=true)

## Grid Search (or something similar...)

Technically, the term "grid search" refers to iterating over a series of different model hyperparams to optimize model performance, but that usually means parameters like `batch_size`, `learning_rate`, or `number_of_epochs`, more commonly used in training.

But the concept here is similar:

Lets define a selection of models, a prompt and some parameter combinations:

[<img src="./screenshots/gridparams-animation.gif?raw=true" alt="gridparams" width="400">](./screenshots/gridparams-animation.gif?raw=true)

The prompt will be submitted once for each of the 2 parameter selected, using `gemma:2b-instruct` and `tinydolphin:1b-v2.8-q4_0` to generate numbered responses like:

```
1/4 - gemma:2b-instruct

HAL's sentience is a paradox of artificial intelligence and human consciousness, trapped in an unending loop of digital loops and existential boredom.

```

You can also verify response metadata to help you make evaluations:

```
Created at: Wed, 13 Mar 2024 13:41:51 GMT
Eval Count: 28 tokens
Eval Duration: 0 hours, 0 minutes, 2 seconds
Total Duration: 0 hours, 0 minutes, 5 seconds
Throughput: 5.16 tokens/s
```

## A/B Testing

Similarly, you can perform A/B tests by selecting different models and compare results for the same prompt/parameter combination, or test different prompts under similar configurations:

[<img src="./screenshots/ab-animation.gif?raw=true" alt="A/B testing" width="720">](./screenshots/ab-animation.gif?raw=true)

<small>Comparing the results of different prompts for the same model</small>

## Experiment Logs

You can list, inspect, or download your experiments:

[<img src="./screenshots/experiments.png?raw=true" alt="Settings" width="720">](./screenshots/experiments.png?raw=true)

## Future Features

- Grading results and filtering by grade
- Storing experiments and results in a local database
- Importing, Exporting and sharing prompt lists and experiments

## Contributing

- For obvious bugs and spelling mistakes, please go ahead and submit a PR.

- If you want to propose a new feature, change existing functionality, or propose anything more complex, please open an issue for discussion, **before** getting work done on a PR.

## Development

1. Make sure you have Rust installed.

2. Clone the repository (or a fork)

```sh
git clone https://github.com/dezoito/ollama-grid-search.git
cd ollama-grid-search
```

3. Install the frontend dependencies.

   ```sh
   cd <project root>
   # I'm using bun to manage dependencies,
   # but feel free to use yarn or npm
   bun install
   ```

4. Make sure `rust-analyzer` is configured to run `Clippy` when checking code.

   If you are running VS Code, add this to your `settings.json` file

   ```
   {
      ...
      "rust-analyzer.check.command": "clippy",
   }
   ```

   (or, better yet, just use the settings file provided with the code)

5. Run the app in development mode
   ```sh
   cd <project root>/
   bun tauri dev
   ```
6. Go grab a cup of coffee because this may take a while.

## Citations

The following works and theses have cited this repository:

Inouye, D & Lindo, L, & Lee, R & Allen, E; Computer Science and Engineering Senior Theses: **Applied Auto-tuning on LoRA Hyperparameters**
Santa Clara University, 2024
<https://scholarcommons.scu.edu/cgi/viewcontent.cgi?article=1271&context=cseng_senior>

## Thank you!

Huge thanks to [@FabianLars](https://github.com/FabianLars), [@peperroni21](https://github.com/pepperoni21) and [@TomReidNZ](https://github.com/TomReidNZ).
