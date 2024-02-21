import { IDefaultConfigs, TParamIteration } from "@/Interfaces";
import { invoke } from "@tauri-apps/api/tauri";

export async function get_inference(params: TParamIteration) {
  // const randomNumber = Math.floor(Math.random() * (12000 - 1000 + 1)) + 1000;
  // console.log(randomNumber);
  // await asyncSleep(randomNumber);
  const inference = await invoke("get_inference", { params: params });
  return inference;
}

// export const get_inference = async () => {
//   const inference = await invoke("get_inference");
//   return inference;
// };

export async function get_models(config: IDefaultConfigs) {
  console.dir(config);
  const models = await invoke("get_models", { config: config });
  return models;
}
