import { gridParamsAtom } from "@/Atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import IterationResult from "./iteration-result";

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

  const iterationsCount =
    gridParams.models.length *
    gridParams.temperatureList.length *
    gridParams.repeatPenaltyList.length *
    gridParams.topKList.length *
    gridParams.topPList.length;

  //TODO https://stackoverflow.com/questions/74488619/react-query-how-to-process-a-queue-one-item-at-a-time-and-remove-the-original
  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis
  // https://stackoverflow.com/questions/74304516/react-query-dynamic-incremental-queries

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
          {iterations.map((iteration: TIteration, idx: number) => (
            <div key={idx}>
              <IterationResult params={iteration} prompt={gridParams.prompt} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
