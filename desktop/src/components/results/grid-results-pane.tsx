import { gridParamsAtom } from "@/Atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

type TIteration = {
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

  if (gridParams.models.length === 0 || gridParams.prompt.trim().length === 0) {
    return <>Tutorial</>;
  }

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
  }, [gridParams]);
  return (
    <div>
      {/* <pre>{JSON.stringify(gridParams, null, 2)}</pre>; */}
      {/* Quick stats on experiment */}
      <div> Experiment started on {now.toUTCString()}</div>
      <div> Number of iterations: {iterationsCount}</div>
      <div id="results-list" className="overflow-y-auto">
        <pre>{JSON.stringify(iterations, null, 2)}</pre>
      </div>
    </div>
  );
}
