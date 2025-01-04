# Ollama Grid Search: Instantly Evaluate Multiple LLMs and Prompts.

This project automates the process of selecting the best models, prompts, or inference parameters for a given use-case, allowing you to iterate over their combinations and to visually inspect the results.

It assumes [Ollama](https://www.ollama.ai) is installed and serving endpoints, either in `localhost` or in a remote server.

Here's what an experiment for a simple prompt, tested on 3 different models, looks like:

[<img src="./screenshots/main.png?raw=true" alt="Main Screenshot" width="720">](./screenshots/main.png?raw=true)

(For a more in-depth look at an evaluation process assisted by this tool, please check https://dezoito.github.io/2023/12/27/rust-ollama-grid-search.html).

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Grid Search Concept](#grid-search-or-something-similar)
- [A/B Testing](#ab-testing)
- [Prompt Archive](#prompt-archive)
- [Experiment Logs](#experiment-logs)
- [Future Features](#future-features)
- [Contributing](#contributing)
- [Development](#development)
- [Citations](#citations)
- [Acknowledgements](#thank-you)

## Installation

Check the [releases page](https://github.com/dezoito/ollama-grid-search/releases) for the project, or on the sidebar.

## Features

- Automatically fetches models from local or remote Ollama servers;
- Iterates over multiple different models, prompts and parameters to generate inferences;
- A/B test different prompts on several models simultaneously;
- Allows multiple iterations for each combination of parameters;
- Allows [limited concurrency](https://dezoito.github.io/2024/03/21/react-limited-concurrency.html) **or** synchronous inference calls (to prevent spamming servers);
- Optionally outputs inference parameters and response metadata (inference time, tokens and tokens/s);
- Refetching of individual inference calls;
- Model selection can be filtered by name;
- List experiments which can be downloaded in JSON format;
- Experiments can be inspected in readable views;
- Re-run past experiments, cloning or modifying the parameters used in the past;
- Configurable inference timeout;
- Custom default parameters and system prompts can be defined in settings
- Fully functional prompt database with examples;
- Prompts can be selected and "autocompleted" by typing "/" in the inputs

## Grid Search (or something similar...)

Technically, the term "grid search" refers to iterating over a series of different model hyperparams to optimize model performance, but that usually means parameters like `batch_size`, `learning_rate`, or `number_of_epochs`, more commonly used in training.

But the concept here is similar:

Lets define a selection of models, a prompt and some parameter combinations:

[<img src="./screenshots/gridparams-animation.gif?raw=true" alt="gridparams" width="400">](./screenshots/gridparams-animation.gif?raw=true)

The prompt will be submitted once for each parameter **value**, for each one of the selected models, generating a set of responses.

## A/B Testing

Similarly, you can perform A/B tests by selecting different models and compare results for the same prompt/parameter combination, or test different prompts under similar configurations:

[<img src="./screenshots/ab-animation.gif?raw=true" alt="A/B testing" width="720">](./screenshots/ab-animation.gif?raw=true)

<small>Comparing the results of different prompts for the same model</small>

## Prompt Archive

You can save and manage your prompts (we want to make prompts compatible with [Open WebUI](https://github.com/open-webui/open-webui))

[<img src="./screenshots/prompt-archive.png?raw=true" alt="Settings" width="720">](./screenshots/prompt-archive.png?raw=true)

You can **autocomplete** prompts by typing "/" (inspired by Open WebUI, as well):

[<img src="./screenshots/autocomplete.gif?raw=true" alt="A/B testing" width="720">](./screenshots/autocomplete.gif?raw=true)

## Experiment Logs

You can list, inspect, or download your experiments:

[<img src="./screenshots/experiments.png?raw=true" alt="Settings" width="720">](./screenshots/experiments.png?raw=true)

## Future Features

- Grading results and filtering by grade
- Importing, exporting and sharing prompt lists and experiment files.

## Contributing

- For obvious bugs and spelling mistakes, please go ahead and submit a PR.

- If you want to propose a new feature, change existing functionality, or propose anything more complex, please open an issue for discussion, **before** getting work done on a PR.

## Development

The [development notes](./docs/DEVELOPMENT.md) provide setup instructions, sequence diagrams, and workflow charts that should make it easier to understand the project and get started.

## Citations

The following works and theses have cited this repository:

Inouye, D & Lindo, L, & Lee, R & Allen, E; Computer Science and Engineering Senior Theses: **Applied Auto-tuning on LoRA Hyperparameters**
Santa Clara University, 2024
<https://scholarcommons.scu.edu/cgi/viewcontent.cgi?article=1271&context=cseng_senior>

## Thank you!

Huge thanks to [@FabianLars](https://github.com/FabianLars), [@peperroni21](https://github.com/pepperoni21) and [@TomReidNZ](https://github.com/TomReidNZ).
