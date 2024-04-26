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
              <div className="grid grid-cols-[120px_minmax(120px,_auto)] gap-0">
                <div className="flex flex-col">
                  <div className="p-2">Server URL</div>
                  <div className="p-2">Request Timeout</div>
                </div>
                <div className="flex flex-col">
                  <div className="p-2">{data.config.server_url}</div>
                  <div className="p-2">{data.config.request_timeout}</div>
                </div>
              </div>

              {/* options table */}
              <div className="grid  grid-cols-[120px_minmax(120px,_auto)] gap-0">
                <div className="flex flex-col">
                  <div className="p-2">Default Options</div>
                </div>
                <div className="flex flex-col">
                  <div className="p-2 font-mono  text-gray-700 dark:text-gray-400">
                    <pre>
                      {JSON.stringify(data.config.default_options, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* iterations */}
            <div className="my- text-sm">
              <div className="my-4 text-xl font-bold">Inferences</div>
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
                    <div className="ml-4 flex gap-8">
                      <div className="font-mono text-gray-700 dark:text-gray-400">
                        <div>
                          temperature:{" "}
                          {Number(inf.parameters.temperature).toFixed(2)}
                        </div>
                        <div>
                          repeat_penalty:{" "}
                          {Number(inf.parameters.repeat_penalty).toFixed(2)}
                        </div>
                        <div>
                          top_k: {Number(inf.parameters.top_k).toFixed(2)}
                        </div>
                        <div>
                          top_p: {Number(inf.parameters.top_p).toFixed(2)}
                        </div>
                        <div>
                          repeat_last_n: {Number(inf.parameters.repeat_last_n)}
                        </div>
                        <div>
                          tfs_z: {Number(inf.parameters.tfs_z).toFixed(2)}
                        </div>
                        <div>mirostat: {Number(inf.parameters.mirostat)}</div>
                        <div>
                          mirostat_tau:{" "}
                          {Number(inf.parameters.mirostat_tau).toFixed(2)}
                        </div>
                        <div>
                          mirostat_eta:{" "}
                          {Number(inf.parameters.mirostat_eta).toFixed(2)}
                        </div>
                        <div>seed: {Number(inf.parameters.seed)}</div>
                      </div>
                      {/* metadata */}
                      <div className="font-mono text-gray-700 dark:text-gray-400">
                        <div>
                          Created at:{" "}
                          {convertToUTCString(inf.result.created_at)}
                        </div>
                        <div>
                          Prompt Eval Count:{" "}
                          {Number(inf.result.prompt_eval_count)} tokens
                        </div>
                        <div>
                          Prompt Eval Duration:{" "}
                          {formatInterval(
                            convertNanosecondsToTime(
                              inf.result.prompt_eval_duration,
                            ),
                          )}
                        </div>
                        <div>Eval Count: {inf.result.eval_count} tokens</div>
                        <div>
                          Eval Duration:{" "}
                          {formatInterval(
                            convertNanosecondsToTime(inf.result.eval_duration),
                          )}
                        </div>
                        <div>
                          Inference Duration (prompt + eval):{" "}
                          {formatInterval(
                            convertNanosecondsToTime(
                              inf.result.eval_duration +
                                inf.result.prompt_eval_duration,
                            ),
                          )}
                        </div>
                        <div>
                          Total Duration:{" "}
                          {formatInterval(
                            convertNanosecondsToTime(inf.result.total_duration),
                          )}
                        </div>
                        <div>
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
