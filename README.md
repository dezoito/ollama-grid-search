# Ollama Grid Search and A/B Testing Desktop App.

A Rust based tool to evaluate LLM models, prompts and model params.

## Purpose

This project aims to automate the process of selecting the best model parameters, given an LLM model and a prompt, iterating over the possible combinations and letting the user visually inspect the results.

It assumes the user has [Ollama](https://www.ollama.ai) installed and serving endpoints, either in `localhost` or in a remote server.

![](./screenshots/main.png?raw=true)

(For a more in-depth look at an evaluation process assisted by this tool, please check https://dezoito.github.io/2023/12/27/rust-ollama-grid-search.html).

## Installation

List binaries here...

## Features

- Automatically fetches models from local or remote Ollama servers;
- Iterates over different models and params to generate inferences;
- A/B test prompts on different models simultaneously
- Makes synchronous inference calls to avoid spamming servers;
- Optionally output inference parameters and response metadata (inference time, tokens and tokens/s);
- Refetching of single inference calls;
- Model selection can be filtered by name;
- Custom default parameters and system prompts can be defined in settings:

![](./screenshots/settings.png?raw=true)

## Grid Search (or something similar...)

Technically, the term "grid search" refers to iterating over a series of different model hyperparams to optimize model performance, but that usually means parameters like `batch_size`, `learning_rate`, or `number_of_epochs`, more commonly used in training.

But the concept here is similar:

Lets define a model, a prompt and some parameter combinations:

![](./screenshots/gridparams.png?raw=true)

The prompt will be submitted once for each of the 3 parameter combinations, using `deepseek-coder:1.3b` to generate numbered responses like:

````
1/3 - deepseek-coder:1.3b

Sure, here is the simple way to write hello_world() or simply saying Hello World using python programming language :
```python
def sayHelloWorld():

...
````

You can also verify response metadata to help you make evaluations:

```
Created at: Mon, 26 Feb 2024 13:42:23 GMT
Eval Count: 195 tokens
Eval Duration: 0 hours, 0 minutes, 19 seconds
Throughput: 9.89 tokens/s
```

## A/B Testing

Similarly, you can perform A/B tests by selecting different models and compare results for the same prompt/parameter combination.

## TODO Future Features

- Grading results and filtering by grade
- Storing experiments and results in a local database
- Implementing limited concurrency for inference queries
- UI/UX improvements

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
   # I'm using bun to manage dependecies,
   # but feel free to use yarn or npm
   bun install
   ```

4. Run the app in development mode
   ```sh
   cd <project root>/
   bun tauri dev
   ```
5. Go grab a cup of coffee because this may take a while.
