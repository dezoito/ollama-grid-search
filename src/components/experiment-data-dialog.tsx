import { ActivityLogIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { IExperimentFile } from "@/Interfaces";
import {
  convertNanosecondsToTime,
  formatInterval,
  tokensPerSecond,
} from "@/lib";
import { useState } from "react";
import { convertToUTCString } from "../lib/index";
import { Separator } from "./ui/separator";

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
          <DialogTitle>Experiment: {experiment.name}</DialogTitle>
          {/* <DialogDescription>
            {convertEpochToDateTime(experiment.created.secs_since_epoch)}
          </DialogDescription> */}
        </DialogHeader>

        {/* we need to set a max-height on this div for overflow to work */}
        <div className="flex max-h-[500px] w-full flex-col gap-4 overflow-y-auto">
          <div className="text-sm">
            <div className="font-bold">Metadata</div>
            <div className="flex flex-col gap-2 px-2">
              <div>ID: {JSON.parse(experiment.contents).experiment_uuid}</div>
              <div>Date: {experiment.created.toString()}</div>
            </div>
          </div>

          {/* CONFIG */}
          <div className="text-sm">
            <div className="font-bold">Settings</div>

            {/* main settings table */}
            <div className="grid grid-cols-[180px_minmax(180px,_auto)] gap-0">
              <div className="flex flex-col">
                <div className="p-2">Server URL</div>
                <div className="p-2">Timeout</div>
                <div className="p-2">Default System Prompt</div>
              </div>
              <div className="flex flex-col">
                <div className="p-2">{data.config.server_url}</div>
                <div className="p-2">{data.config.request_timeout}</div>
                <div className="p-2 text-amber-600 dark:text-amber-500">
                  {data.config.system_prompt}
                </div>
              </div>
            </div>

            {/* options table */}
            <div className="grid  grid-cols-[180px_minmax(180px,_auto)] gap-0">
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

          <Separator className="my-3" />

          {/* inferences */}
          <div className="text-sm">
            <div className="font-bold">Inferences</div>

            {/* inferences table */}
            <div>
              {data.inferences.map((inf: any, index: number) => (
                <div key={index} className="my-8">
                  <div className="font-bold">
                    [{index + 1}/{data.inferences.length}]{" "}
                    {inf.parameters.model}
                  </div>
                  <div className="m-4">
                    <div>Inference Prompts</div>
                    <div className="whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-400">
                      System prompt:{" "}
                      <span className="text-amber-600 dark:text-amber-500">
                        {inf.parameters.system_prompt}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-400">
                      Prompt:{" "}
                      <span className="text-green-600 dark:text-green-500">
                        {inf.parameters.prompt}
                      </span>
                    </div>
                  </div>
                  <div className="m-4">
                    <div>Response</div>
                    <div className="whitespace-pre-wrap text-cyan-600 dark:text-cyan-600">
                      {inf.result.response}
                    </div>
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
                          repeat_last_n: {Number(inf.parameters.repeat_last_n)}
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

                      {/* Vertical line separator */}
                      <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
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
                            convertNanosecondsToTime(inf.result.eval_duration),
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
                            convertNanosecondsToTime(inf.result.total_duration),
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
        {/* <DialogFooter>
          <div className="flex w-full items-center justify-around"></div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
