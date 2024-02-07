import { gridParamsAtom } from "@/Atoms";
import { asyncSleep } from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export type TParamIteration = {
  model: string;
  temperature: number;
  repeatPenalty: number;
  topK: number;
  topP: number;
};

const now = new Date();
const start = now.toUTCString();

export default function GridResultsPane() {
  const [gridParams, _] = useAtom(gridParamsAtom);

  const [iterations, setIterations] = useState<TParamIteration[]>([]);
  const [noCompleted, setNoCompleted] = useState(0);

  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis

  async function get_models() {
    const randomNumber = Math.floor(Math.random() * (12000 - 1000 + 1)) + 1000;
    console.log(randomNumber);
    await asyncSleep(randomNumber);
    const models = await invoke("get_models");
    return models;
  }

  // creates a linear array with param combinations
  useEffect(() => {
    const localIterations = [];
    for (const model of gridParams.models) {
      for (const temperature of gridParams.temperatureList) {
        for (const repeatPenalty of gridParams.repeatPenaltyList) {
          for (const topK of gridParams.topKList) {
            for (const topP of gridParams.topPList) {
              localIterations.push({
                model,
                temperature,
                repeatPenalty,
                topK,
                topP,
              });
            }
          }
        }
      }
    }
    setIterations(localIterations);
  }, [gridParams.prompt, gridParams.models]);

  const queries = iterations.map((params: TParamIteration, i: number) => ({
    queryKey: ["get_inference", params],
    queryFn: get_models,
    enabled: i === 0 || i <= noCompleted,
    staleTime: Infinity,
    cacheTime: Infinity,
  }));

  const results = useQueries({ queries: queries });

  const lastFetched = results.filter((r) => r.isFetched);

  useEffect(() => {
    setNoCompleted(lastFetched.length);
  }, [lastFetched]);

  if (gridParams.models.length === 0 || gridParams.prompt.trim().length === 0) {
    return <>Tutorial</>;
  }

  return (
    <div>
      {/* <pre>{JSON.stringify(gridParams, null, 2)}</pre>; */}
      {/* Quick stats on experiment */}
      <div> Experiment started on {start}</div>
      <div id="results-list" className="overflow-y-auto">
        <pre>
          Iterations: {noCompleted}/{iterations.length}
        </pre>
        {/* <pre>First Loading: {JSON.stringify(firstLoading, null, 2)}</pre> */}
        <pre>
          {JSON.stringify(results, null, 2)}
          {/* {results?.map((iteration: TIteration, idx: number) => (
            <div key={idx}>
              <IterationResult params={iteration} prompt={gridParams.prompt} />
            </div>
          ))} */}
        </pre>
      </div>
    </div>
  );
}
