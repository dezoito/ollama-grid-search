import {
  IDefaultConfigs,
  IResponsePayload,
  TParamIteration,
} from "@/Interfaces";
import { invoke } from "@tauri-apps/api/tauri";

export async function get_inference(
  config: IDefaultConfigs,
  params: TParamIteration,
): Promise<IResponsePayload> {
  // const randomNumber = Math.floor(Math.random() * (12000 - 1000 + 1)) + 1000;
  // console.log(randomNumber);
  // await asyncSleep(randomNumber);
  const inference = await invoke<IResponsePayload>("get_inference", {
    config: config,
    params: params,
  });
  return inference;
}

// export const get_inference = async () => {
//   const inference = await invoke("get_inference");
//   return inference;
// };

export async function get_models(config: IDefaultConfigs): Promise<string[]> {
  console.dir(config);
  const models = await invoke<string[]>("get_models", { config: config });
  return models;
}