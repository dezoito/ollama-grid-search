import {
  IDefaultConfigs,
  IExperimentFile,
  IPrompt,
  IResponsePayload,
  TParamIteration,
} from "@/Interfaces";
import { invoke } from "@tauri-apps/api/tauri";

/**
 * Creates a prompt in the database.
 *
 * @param {IPrompt} prompt - The prompt to create.
 * @return {Promise<void | Error>} The result of the operation. If successful,
 * the promise resolves to `void`. If an error occurs, the promise rejects with
 * an `Error` object.
 */
export async function create_prompt(prompt: IPrompt): Promise<void | Error> {
  const createOp = await invoke<void | Error>("create_prompt", {
    input: prompt,
  });
  return createOp;
}

/**
 * Updates a prompt in the database.
 *
 * @param {IPrompt} prompt - The prompt to update.
 * @return {Promise<void | Error>} The result of the operation. If successful,
 * the promise resolves to `void`. If an error occurs, the promise rejects with
 * an `Error` object.
 */
export async function update_prompt(prompt: IPrompt): Promise<void | Error> {
  const updateOp = await invoke<void | Error>("update_prompt", {
    input: prompt,
  });
  return updateOp;
}

/**
 * Deletes a prompt in the database.
 *
 * @param {string} uuid - The UUID of the prompt to delete.
 * @return {Promise<void | Error>} The result of the operation. If successful,
 * the promise resolves to `void`. If an error occurs, the promise rejects with
 * an `Error` object.
 */
export async function delete_prompt(uuid: string): Promise<void | Error> {
  const deleteOp = await invoke<void | Error>("delete_prompt", {
    uuid,
  });
  return deleteOp;
}

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
 * Retrieves all prompts.
 *
 * @return {Promise<Prompt[]>} a promise that resolves to an array of Prompt objects
 */
export async function get_all_prompts(): Promise<IPrompt[]> {
  const prompts = await invoke<IPrompt[]>("get_all_prompts");
  return prompts;
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
