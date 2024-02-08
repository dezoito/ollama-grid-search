import { gridParamsAtom } from "@/Atoms";
import { TParamIteration } from "@/Interfaces";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { get_inference } from "../queries";

const now = new Date();
const start = now.toUTCString();

export default function GridResultsPane() {
  const [gridParams, _] = useAtom(gridParamsAtom);
  const [iterations, setIterations] = useState<TParamIteration[]>([]);
  const [noCompleted, setNoCompleted] = useState(0);

  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis

  // creates a linear array with param combinations
  useEffect(() => {
    const localIterations = [];
    for (const model of gridParams.models) {
      for (const temperature of gridParams.temperatureList) {
        for (const repeat_penalty of gridParams.repeatPenaltyList) {
          for (const top_k of gridParams.topKList) {
            for (const top_p of gridParams.topPList) {
              localIterations.push({
                model,
                prompt: gridParams.prompt,
                temperature,
                repeat_penalty,
                top_k,
                top_p,
              });
            }
          }
        }
      }
    }
    setIterations(localIterations);
  }, [gridParams.prompt, gridParams.models]);

  // // Define type for query options
  // type ModelQueryOptions = UseQueryOptions<
  //   unknown,
  //   Error,
  //   unknown,
  //   string[] | TParamIteration[]
  // >;

  // const queries: any = iterations.map((params: TParamIteration, i: number) => ({
  //   queryKey: ["get_inference", params],
  //   queryFn: get_inference(params),
  //   enabled: i === 0 || i <= noCompleted,
  //   staleTime: Infinity,
  //   cacheTime: Infinity,
  // }));

  // const results = useQueries({ queries: queries });

  // const lastFetched = results.filter((r) => r.isFetched);

  // useEffect(() => {
  //   setNoCompleted(lastFetched.length);
  // }, [lastFetched]);

  // fire just one query
  const results = useQuery({
    queryKey: ["get_inference"],
    queryFn: () =>
      get_inference({
        model: "dolphin-mistral:v2.6",
        prompt: "Oi",
        temperature: 0.5,
        repeat_penalty: 1.5,
        top_k: 50,
        top_p: 0.25,
      }),
  });

  if (gridParams.models.length === 0 || gridParams.prompt.trim().length === 0) {
    return <>Tutorial</>;
  }

  return (
    <div>
      {/* <pre>{JSON.stringify(gridParams, null, 2)}</pre>; */}
      {/* Quick stats on experiment */}
      <div> Experiment started on {start}</div>
      <div id="results-list" className="overflow-y-auto">
        Iterations: {noCompleted}/{iterations.length}
        <pre>{JSON.stringify(results, null, 2)}</pre>
        {/* map iterations, not results.. get cached query in component */}
        {/* {iterations.map((iteration: TParamIteration, idx: number) => (
          <div key={idx}>
            <IterationResult params={iteration} prompt={gridParams.prompt} />
          </div>
        ))} */}
        {/* {results.map((result: any, i: number) => (
          <pre>{JSON.stringify(result, null, 2)}</pre>
        ))} */}
      </div>
    </div>
  );
}
