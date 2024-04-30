import { ActivityLogIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { IExperimentFile } from "@/Interfaces";
import {
  convertEpochToDateTime,
  convertNanosecondsToTime,
  convertToUTCString,
  formatInterval,
  tokensPerSecond,
} from "@/lib";
import { useState } from "react";

interface IProps {
  experiment: IExperimentFile;
}

export function ExperimentDataDialog(props: IProps) {
  const { experiment } = props;
  const [open, setOpen] = useState(false);
  const data = JSON.parse(experiment.contents);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <ActivityLogIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Experiment Data</DialogTitle>
          <DialogDescription>
            {/* {convertEpochToDateTime(experiment.created.secs_since_epoch)} */}
          </DialogDescription>
        </DialogHeader>

        {/* we need to set a max-height on this div for overflow to work */}
        <div className="grid max-h-[500px] w-full gap-6 overflow-y-auto px-4 py-4">
          {/* <pre className="font-mono text-sm">{experiment.contents}</pre> */}
          <div>
            <div className="text-xl font-bold">
              ID: {experiment.name.slice(0, -5)}
            </div>
            <div className="text-base">
              Date:{" "}
              {convertEpochToDateTime(experiment.created.secs_since_epoch)}
            </div>
            {/* CONFIG */}
            <div className="my-4 text-sm">
              <div className="font-bold">Settings</div>

              {/* main settings table */}
              <div className="grid grid-cols-[140px_minmax(140px,_auto)] gap-0">
                <div className="flex flex-col">
                  <div className="p-2">Server URL</div>
                  <div className="p-2">Timeout</div>
                  <div className="p-2">Default System Prompt</div>
                </div>
                <div className="flex flex-col">
                  <div className="p-2">{data.config.server_url}</div>
                  <div className="p-2">{data.config.request_timeout}</div>
                  <div className="p-2">{data.config.system_prompt}</div>
                </div>
              </div>

              {/* options table */}
              <div className="grid  grid-cols-[140px_minmax(140px,_auto)] gap-0">
                <div className="flex flex-col">
                  <div className="p-2">Default Options</div>
                </div>
                <div className="flex flex-col">
                  <div className="p-2 font-mono  text-gray-700 dark:text-gray-400">
                    <pre>
                      {Object.entries(data.config.default_options || {}).map(
                        ([key, value]) => (
                          <div key={key}>
                            {key}: {JSON.stringify(value)}
                          </div>
                        ),
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* inferences */}
            <div className="my- text-sm">
              <div className="my-4 text-xl font-bold">Inferences</div>

              <div>
                <div className="grid grid-cols-[140px_minmax(140px,_auto)] gap-0">
                  <div className="flex flex-col">
                    <div className="p-1 ">System Prompt</div>
                    <div className="p-1 ">Prompt</div>
                  </div>

                  {/* get prompt and sys prompt from the first inference (they are all the same from threre) */}
                  <div className="flex flex-col">
                    <div className="p-1 font-mono text-gray-700 dark:text-gray-400">
                      {data.inferences[0].parameters.system_prompt}
                    </div>
                    <div className="p-1 font-mono text-gray-700 dark:text-gray-400">
                      {data.inferences[0].parameters.prompt}
                    </div>
                  </div>
                </div>
              </div>

              {/* inferences table */}
              <div>
                {data.inferences.map((inf: any, index: number) => (
                  <div key={index} className="my-6">
                    <div className="font-bold">
                      [{index + 1}/{data.inferences.length}]{" "}
                      {inf.parameters.model}
                    </div>
                    <div className="m-4 text-cyan-600 dark:text-cyan-600">
                      {inf.result.response}
                    </div>
                    {/* parameters and metadata */}
                    <div>
                      <div className="ml-4 flex gap-8">
                        <div>
                          <div>Inference Parameters</div>

                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            temperature:{" "}
                            {Number(inf.parameters.temperature).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            repeat_penalty:{" "}
                            {Number(inf.parameters.repeat_penalty).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            top_k: {Number(inf.parameters.top_k).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            top_p: {Number(inf.parameters.top_p).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            repeat_last_n:{" "}
                            {Number(inf.parameters.repeat_last_n)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            tfs_z: {Number(inf.parameters.tfs_z).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            mirostat: {Number(inf.parameters.mirostat)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            mirostat_tau:{" "}
                            {Number(inf.parameters.mirostat_tau).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            mirostat_eta:{" "}
                            {Number(inf.parameters.mirostat_eta).toFixed(2)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            seed: {Number(inf.parameters.seed)}
                          </div>
                        </div>
                        {/* metadata */}
                        <div>
                          <div>Result Metadata</div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Created at:{" "}
                            {convertToUTCString(inf.result.created_at)}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Prompt Eval Count:{" "}
                            {Number(inf.result.prompt_eval_count)} tokens
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Prompt Eval Duration:{" "}
                            {formatInterval(
                              convertNanosecondsToTime(
                                inf.result.prompt_eval_duration,
                              ),
                            )}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Eval Count: {inf.result.eval_count} tokens
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Eval Duration:{" "}
                            {formatInterval(
                              convertNanosecondsToTime(
                                inf.result.eval_duration,
                              ),
                            )}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Inference Duration (prompt + eval):{" "}
                            {formatInterval(
                              convertNanosecondsToTime(
                                inf.result.eval_duration +
                                  inf.result.prompt_eval_duration,
                              ),
                            )}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Total Duration:{" "}
                            {formatInterval(
                              convertNanosecondsToTime(
                                inf.result.total_duration,
                              ),
                            )}
                          </div>
                          <div className="font-mono text-gray-700 dark:text-gray-400">
                            Throughput (tokens/total_duration):{" "}
                            {tokensPerSecond(
                              inf.result.total_duration,
                              inf.result.eval_count,
                            )}{" "}
                            tokens/s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* <DialogFooter>
          <div className="flex w-full items-center justify-around"></div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
