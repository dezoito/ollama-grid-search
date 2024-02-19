// represents the sets of params sent from the form
export interface IGridParams {
  uuid: string;
  models: string[];
  prompt: string;
  temperatureList: number[];
  repeatPenaltyList: number[];
  topKList: number[];
  topPList: number[];
}

// represents a single set of params to
// be used in inference
// * we should create a matching struct in the Rust code
export type TParamIteration = {
  model: string;
  prompt: string;
  temperature: number;
  repeat_penalty: number;
  top_k: number;
  top_p: number;
};
