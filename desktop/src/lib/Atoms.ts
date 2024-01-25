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

// Store configs in LocalStorage
// "Options" reference:
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
// I've kept only the documented ones at default values
export const configAtom = atomWithLocalStorage("configs", {
  serverURL: "http://localhost:11434/",
  systemPromp: "",
  options: {
    mirostat: 0,
    mirostat_tau: 5.0,
    mirostat_eta: 0.1,
    num_ctx: 4096,
    num_gqa: 1,
    num_gpu: 50,
    num_thread: 8,
    repeat_last_n: 64,
    repeat_penalty: 1.1,
    temperature: 0.7,
    seed: 42,
    stop: ["AI assistant:"],
    tfs_z: 1,
    num_predict: 42,
    top_k: 40,
    top_p: 0.9,
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
});

// // Stores search query and credentials (in session)
// export const searchInputAtom = atom<ISearchFormInput>({

// });

// //Creates a global instance of a semaphore that we can use to control call
// // concurrency
// const semaphore = new Semaphore(1);
// export const semaphoreAtom = atom(semaphore);
