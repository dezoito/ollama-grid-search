import { configAtom, gridParamsAtom } from "@/Atoms";
import { TParamIteration } from "@/Interfaces";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useQueries } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { get_inference } from "../queries";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import Tutorial from "../ui/tutorial";
import IterationResult from "./iteration-result";

export default function GridResultsPane() {
  const [gridParams, _] = useAtom(gridParamsAtom);
  const [iterations, setIterations] = useState<TParamIteration[]>([]);
  const [noCompleted, setNoCompleted] = useState(0);
  const [expandParams, setExpandParams] = useState(false);
  const [expandMetadata, setExpandMetadata] = useState(false);
  const [config, __] = useAtom(configAtom);
  const [experimentDate, setExperimentDate] = useState<string>(
    new Date().toUTCString(),
  );
  const [hideModelNames, setHideModelNames] = useState(config.hide_model_names);

  useEffect(() => {
    setExperimentDate(new Date().toUTCString());
  }, [gridParams]);

  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis

  // creates a linear array of param combination objects
  useEffect(() => {
    setNoCompleted(0);
    const localIterations = [];
    for (const model of gridParams.models) {
      for (const prompt of gridParams.prompts) {
        for (const temperature of gridParams.temperatureList) {
          for (const repeat_penalty of gridParams.repeatPenaltyList) {
            for (const top_k of gridParams.topKList) {
              for (const top_p of gridParams.topPList) {
                for (const repeat_last_n of gridParams.repeatLastNList) {
                  for (const tfs_z of gridParams.tfsZList) {
                    for (const mirostat of gridParams.mirostatList) {
                      for (const mirostat_tau of gridParams.mirostatTauList) {
                        for (const mirostat_eta of gridParams.mirostatEtaList) {
                          // loop over the number of generations
                          for (
                            let generation = 0;
                            generation < gridParams.generations;
                            generation++
                          ) {
                            // set seed = generation to ensure results differ when temp > 0
                            localIterations.push({
                              experiment_uuid: gridParams.experiment_uuid,
                              model: model,
                              system_prompt: gridParams.system_prompt,
                              prompt: prompt,
                              temperature: temperature,
                              repeat_penalty: repeat_penalty,
                              top_k: top_k,
                              top_p: top_p,
                              repeat_last_n: repeat_last_n,
                              tfs_z: tfs_z,
                              mirostat: mirostat,
                              mirostat_tau: mirostat_tau,
                              mirostat_eta: mirostat_eta,
                              generation: generation,
                              seed: generation,
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    setIterations(localIterations);
  }, [gridParams.experiment_uuid]);

  // Enables a limited number of queries to run concurrently, disable all once they've all been processed
  // so new experiments can run sequentially
  const queries: any = iterations.map((params: TParamIteration, i: number) => ({
    queryKey: ["get_inference", params],
    queryFn: () => get_inference(config, params),
    enabled:
      i === 0 ||
      (i <= noCompleted + (config.concurrent_inferences - 1) &&
        noCompleted !== iterations.length),
    staleTime: 0,
    cacheTime: 0,
  }));

  const results = useQueries({ queries: queries });

  const lastFetched = results.filter((r) => r.isFetched);

  useEffect(() => {
    setNoCompleted(lastFetched.length);
  }, [lastFetched]);

  if (gridParams.models.length === 0) {
    return <Tutorial />;
  }

  return (
    <div>
      <div className="sticky top-0 z-50 bg-white pb-4 dark:bg-zinc-950">
        <div className="my-4 flex gap-4">
          <Button
            variant="ghost"
            size="tight"
            onClick={() => setExpandParams(!expandParams)}
          >
            {expandParams ? (
              <>
                <ChevronUpIcon className="m-1 h-5 w-5 text-black dark:text-gray-600" />
                Hide parameters
              </>
            ) : (
              <>
                <ChevronDownIcon className="m-1 h-5 w-5 text-black dark:text-gray-600" />
                Expand parameters
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="tight"
            onClick={() => setExpandMetadata(!expandMetadata)}
          >
            {expandMetadata ? (
              <>
                <ChevronUpIcon className="m-1 h-5 w-5 text-black dark:text-gray-600" />
                Hide metadata
              </>
            ) : (
              <>
                <ChevronDownIcon className="m-1 h-5 w-5 text-black dark:text-gray-600" />
                Expand metadata
              </>
            )}
          </Button>
          {/* hide/show model names */}
          <div className="ml-4 flex items-center space-x-2">
            <Switch
              defaultChecked={config.hide_model_names}
              onClick={() => setHideModelNames(!hideModelNames)}
            />

            <Label htmlFor="hide_model_names" className="text-xs">
              Hide Model Names
            </Label>
          </div>
        </div>

        <Separator className="my-4" />
        <div>
          <div>Experiment started on {experimentDate}.</div>
          <div>
            Iterations: {noCompleted}/{iterations.length}
          </div>
        </div>
      </div>

      <div id="results-list" className="my-4 overflow-y-auto py-2">
        {/* <pre>{JSON.stringify(iterations, null, 2)}</pre> */}
        {/* map iterations, not results.. use cached query inside component */}
        {iterations.map((iteration: TParamIteration, idx: number) => (
          <div key={idx}>
            <IterationResult
              iterationIndex={idx}
              totalIterations={iterations.length}
              params={iteration}
              expandParams={expandParams}
              expandMetadata={expandMetadata}
              hideModelNames={hideModelNames}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
