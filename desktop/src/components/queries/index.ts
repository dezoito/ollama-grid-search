import { TParamIteration } from "@/Interfaces";
import { asyncSleep } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";

export async function get_inference(params: TParamIteration) {
  const randomNumber = Math.floor(Math.random() * (12000 - 1000 + 1)) + 1000;
  console.log(randomNumber);
  await asyncSleep(randomNumber);
  const inference = await invoke("get_inference", { params: params });
  return inference;
}

export async function get_models() {
  const models = await invoke("get_models");
  return models;
}
