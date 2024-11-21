import { IDefaultConfigs, TFormValues } from "@/Interfaces/index";
import { atom } from "jotai";

// Refs https://jotai.org/docs/guides/persistence

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

/*
 * This implemention is taken from Jotai's persistence example, but it doesn't handle
 *  nested values well.
 *
 *  If we add params to defaultConfigs, they won't initially have corresponding keys in localStorage
 *  and the corresponding default values are not passed to the settings form.
 */
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

// "Options" reference:
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
// I've kept only the documented ones at default values
const defaultConfigs: IDefaultConfigs = {
  hide_model_names: false,
  request_timeout: 300,
  concurrent_inferences: 1,
  server_url: "http://localhost:11434",

  system_prompt: "You are a helpful AI assistant.",
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
    tfs_z: 1,
    top_k: 40,
    top_p: 0.9,
    // stop: ["AI assistant:"],  // commented due to causing issues with Llama3
    // seed: 42, // we now use the number of generation for each result
    // num_predict: 42,
    // num_thread: 8, // may cause issues if set
  },
};

// Store configs in LocalStorage
export const configAtom = atomWithLocalStorage("configs", defaultConfigs);

// Derived atom with values from configAtom
// Base atom to hold the form state
// * We need an intermediate Atom in this case, because the initial values
// * are derived, and because we need to be able to update formValuesAtom
// Base atom for storing form values, initialized later
export const formValuesBaseAtom = atom<TFormValues | null>(null);

// Derived atom for initial setup from configAtom
export const formValuesAtom = atom(
  (get) => {
    const formValues = get(formValuesBaseAtom);

    // If formValuesBaseAtom hasn't been initialized yet, pull values from configAtom
    if (formValues === null) {
      const config = get(configAtom);
      return {
        experiment_uuid: "",
        models: [],
        prompts: [""],
        system_prompt: config.system_prompt,
        temperatureList: [config.default_options.temperature],
        repeatPenaltyList: [config.default_options.repeat_penalty],
        topKList: [config.default_options.top_k],
        topPList: [config.default_options.top_p],
        repeatLastNList: [config.default_options.repeat_last_n],
        tfsZList: [config.default_options.tfs_z],
        mirostatList: [config.default_options.mirostat],
        mirostatTauList: [config.default_options.mirostat_tau],
        mirostatEtaList: [config.default_options.mirostat_eta],
        generations: 1,
      };
    }

    // If already initialized, return the current form values
    return formValues;
  },
  (get, set, update: Partial<TFormValues>) => {
    // Get current form values from the base atom
    const currentFormValues = get(formValuesBaseAtom) ?? get(formValuesAtom); // Fallback to the derived atom if not initialized

    // Update the base atom with new values
    const updatedFormValues = {
      ...currentFormValues,
      ...update,
    };

    // Set the updated values in base atom
    set(formValuesBaseAtom, updatedFormValues);
  },
);
