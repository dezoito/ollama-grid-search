import { IDefaultConfigs, IGridParams } from "@/Interfaces/index";
import { atom } from "jotai";

// Refs https://jotai.org/docs/guides/persistence

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const atomWithLocalStorage = (key: string, initialValue: unknown) => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getInitialValue = () => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
    return initialValue;
  };
  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
      // console.log('I set a value in local storage', localStorage.getItem(key))
    },
  );
  return derivedAtom;
};

const defaultConfigs: IDefaultConfigs = {
  server_url: "http://localhost:11434/",
  system_prompt: "",
  default_options: {
    mirostat: 0,
    mirostat_tau: 5.0,
    mirostat_eta: 0.1,
    num_ctx: 4096,
    num_gqa: 1,
    num_gpu: 50,
    repeat_last_n: 64,
    repeat_penalty: 1.1,
    temperature: 0.7,
    seed: 42,
    tfs_z: 1,
    top_k: 40,
    top_p: 0.9,
    stop: ["AI assistant:"],
    // num_predict: 42,
    // num_thread: 8, // may cause issues if set
    // ------------
    // Params below appear in docs, but don't seem to be supported at this time.
    // ------------
    // num_keep: 5,
    // typical_p: 0.7,
    // presence_penalty: 1.5,
    // frequency_penalty: 1.0,
    // penalize_newline: true,
    // numa: false,
    // num_batch: 2,
    // main_gpu: 0,
    // low_vram: false,
    // f16_kv: true,
    // vocab_only: false,
    // use_mmap: true,
    // use_mlock: false,
    // embedding_only: false,
    // rope_frequency_base: 1.1,
    // rope_frequency_scale: 0.8,
  },
};

// Store configs in LocalStorage
// "Options" reference:
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
// I've kept only the documented ones at default values
export const configAtom = atomWithLocalStorage("configs", defaultConfigs);

// Initializes grid parameters
export const defaultGridParams = {
  uuid: "",
  models: [],
  prompt: "",
  temperatureList: [defaultConfigs.default_options.temperature],
  repeatPenaltyList: [defaultConfigs.default_options.repeat_penalty],
  topKList: [defaultConfigs.default_options.top_k],
  topPList: [defaultConfigs.default_options.top_p],
  repeatLastNList: [defaultConfigs.default_options.repeat_last_n],
};

export const gridParamsAtom = atom<IGridParams>(defaultGridParams);
