# Ollama grid search

A Rust based CLI app to evaluate LLM models and model params, when using Ollama for inference.

## Grid Search (or something similar...)

The user should define a model and a prompt, and the script will iterate over sets of parameters, prompt an Ollama instance, and display the results for each combination, so that they can be evaluated.

For each param we define a set of desired values.

Ex:

```
temperature: [0.2, 0.4, 0.6, 0.8]
repeat_penalty: [0.4, 0.8, 1.2, 1.6]
...

```

## Params:

The following params can be adjusted at each iteration:

- Temperature (range 0:1)
- Repeat Penalty (range 0:2)
- Top K (range 0:100)
- Top P (range 0:1)
