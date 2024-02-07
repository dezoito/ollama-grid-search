import { gridParamsAtom } from "@/Atoms";
import { asyncSleep } from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export type TIteration = {
  model: string;
  temperature: number;
  repeatPenalty: number;
  topK: number;
  topP: number;
};

export default function GridResultsPane() {
  const [gridParams, _] = useAtom(gridParamsAtom);
  const now = new Date();
  const [iterations, setIterations] = useState<TIteration[]>([]);
  const [selection, setSelection] = useState([]);
  const [noCompleted, setNoCompleted] = useState(0);

  const iterationsCount =
    gridParams.models.length *
    gridParams.temperatureList.length *
    gridParams.repeatPenaltyList.length *
    gridParams.topKList.length *
    gridParams.topPList.length;

  //TODO https://stackoverflow.com/questions/74488619/react-query-how-to-process-a-queue-one-item-at-a-time-and-remove-the-original
  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis

  /*


  const results = useQueries(
    selection.map((item, i) => ({
      queryKey: ['something', item]
      queryFn: () => fetchItem(item)
      enabled: i <= noCompleted
      staleTime: Infinity
      cacheTime: Infinity
    })
  )

  const firstLoading = results.findIndex((r) => r.isLoading)

  React.useEffect(() => {
    setNoCompleted(firstLoading)
  }, [firstLoading])
 */

  // https://stackoverflow.com/questions/74304516/react-query-dynamic-incremental-queries
  async function get_models() {
    const models = await invoke("get_models");
    return models;
  }

  // Define type for query options
  // type ModelQueryOptions = UseQueryOptions<
  //   unknown,
  //   Error,
  //   unknown,
  //   string[] | TIteration[]
  // >;

  // Create an array of queries
  // const queries: ModelQueryOptions[] = iterations.map(
  const queries = iterations.map((params: TIteration, i: number) => ({
    queryKey: [`get_inference${i}`], // Use 'i' for dynamic queryKey
    queryFn: async () => {
      const p = params;
      await asyncSleep(2500);
      return p;
    },
  }));

  const results = useQueries({ queries: queries });

  const firstLoading = results.findIndex((r) => r.isLoading);

  useEffect(() => {
    setNoCompleted(firstLoading);
  }, [firstLoading]);

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

  if (gridParams.models.length === 0 || gridParams.prompt.trim().length === 0) {
    return <>Tutorial</>;
  }

  return (
    <div>
      {/* <pre>{JSON.stringify(gridParams, null, 2)}</pre>; */}
      {/* Quick stats on experiment */}
      <div> Experiment started on {now.toUTCString()}</div>
      <div> Number of iterations: {iterationsCount}</div>
      <div id="results-list" className="overflow-y-auto">
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
