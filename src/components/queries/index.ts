import {
  IDefaultConfigs,
  IExperimentFile,
  IResponsePayload,
  TParamIteration,
} from "@/Interfaces";
import { invoke } from "@tauri-apps/api/tauri";

/**
 * Retrieves an inference using the provided configuration and parameters.
 *
 * @param {IDefaultConfigs} config - The default configurations for the inference.
 * @param {TParamIteration} params - The parameters for the inference iteration.
 * @return {Promise<IResponsePayload>} The response payload containing the inference.
 */
export async function get_inference(
  config: IDefaultConfigs,
  params: TParamIteration,
): Promise<IResponsePayload> {
  const inference = await invoke<IResponsePayload>("get_inference", {
    config: config,
    params: params,
  });
  return inference;
}

/**
 * Retrieves models using the provided configuration.
 *
 * @param {IDefaultConfigs} config - the default configurations
 * @return {Promise<string[]>} a promise that resolves to an array of strings representing the models
 */
export async function get_models(config: IDefaultConfigs): Promise<string[]> {
  const models = await invoke<string[]>("get_models", { config: config });
  return models;
}

/**
 * Retrieves ollama version from the server.
 *
 * @param {IDefaultConfigs} config - the default configurations
 * @return {Promise<string>} The version number string
 */
export async function get_ollama_version(
  config: IDefaultConfigs,
): Promise<string> {
  const version = await invoke<string>("get_ollama_version", {
    config: config,
  });
  return version;
}

/**
 * Retrieves a list of experiments from the server.
 *
 * @return {Promise<IExperimentFile[]>} The list of experiment files retrieved from the server.
 */
export async function get_experiments(): Promise<IExperimentFile[]> {
  const experiments = await invoke<IExperimentFile[]>("get_experiments");
  return experiments;
}
