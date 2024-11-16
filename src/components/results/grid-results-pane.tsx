import { configAtom, formValuesAtom } from "@/Atoms";
import { TFormValues, TParamIteration } from "@/Interfaces";
import Tutorial from "@/components/tutorial";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useQueries } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { get_inference } from "../queries";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import IterationResult from "./iteration-result";

export default function GridResultsPane() {
  const [config, __] = useAtom(configAtom);
  const [formValues, _] = useAtom<TFormValues>(formValuesAtom);
  const [iterations, setIterations] = useState<TParamIteration[]>([]);
  const [noCompleted, setNoCompleted] = useState(0);
  const [expandParams, setExpandParams] = useState(false);
  const [expandMetadata, setExpandMetadata] = useState(false);
  const [experimentDate, setExperimentDate] = useState<string>(
    new Date().toUTCString(),
  );
  const [hideModelNames, setHideModelNames] = useState(config.hide_model_names);
  const borderStyles = [
    "border-amber-500",
    "border-lime-400",
    "border-violet-500",
    "border-green-600",
    "border-yellow-300",
    "border-cyan-500",
    "border-fuchsia-600",
    "border-yellow-600",
    "border-rose-700",
    "border-blue-600",
    "border-pink-500",
    "border-rose-700",
  ];

  const numStyles = borderStyles.length;

  useEffect(() => {
    setExperimentDate(new Date().toUTCString());
  }, [formValues]);

  //https://stackoverflow.com/questions/76933229/can-react-query-make-sequential-network-calls-and-wait-for-previous-one-to-finis

  // creates a linear array of param combination objects
  useEffect(() => {
    // Do not trigger run immediatelly when we clone
    // an existing experiment
    if (formValues.experiment_uuid === "") return;
    setNoCompleted(0);
    const localIterations = [];
    for (const model of formValues.models) {
      for (const prompt of formValues.prompts) {
        for (const temperature of formValues.temperatureList) {
          for (const repeat_penalty of formValues.repeatPenaltyList) {
            for (const top_k of formValues.topKList) {
              for (const top_p of formValues.topPList) {
                for (const repeat_last_n of formValues.repeatLastNList) {
                  for (const tfs_z of formValues.tfsZList) {
                    for (const mirostat of formValues.mirostatList) {
                      for (const mirostat_tau of formValues.mirostatTauList) {
                        for (const mirostat_eta of formValues.mirostatEtaList) {
                          // loop over the number of generations
                          for (
                            let generation = 0;
                            generation < formValues.generations;
                            generation++
                          ) {
                            // set seed = generation to ensure results differ when temp > 0
                            localIterations.push({
                              experiment_uuid: formValues.experiment_uuid,
                              model: model,
                              system_prompt: formValues.system_prompt,
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
  }, [formValues.experiment_uuid]);

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

  if (formValues.models.length === 0) {
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
            className="pr-2"
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
            className="pr-2"
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

      <div id="results-list" className="mb-2 py-2">
        <ScrollArea className="h-[calc(100vh-250px)]">
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
                borderStyle={
                  borderStyles[
                    formValues.models.indexOf(iteration.model) % numStyles
                  ]
                }
              />
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
