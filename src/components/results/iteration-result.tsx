import { configAtom } from "@/Atoms";
import { IResponsePayload, TParamIteration } from "@/Interfaces";
import {
  asyncSleep,
  convertNanosecondsToTime,
  convertToUTCString,
  formatInterval,
  tokensPerSecond,
} from "@/lib";
import { ClipboardCopyIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { get_inference } from "../queries";
import { Button } from "../ui/button";
import { CollapsibleItem } from "../ui/collapsible-item";
import { CollapsibleText } from "../ui/collapsible-text";
import { Separator } from "../ui/separator";
import Spinner from "../ui/spinner";
import { toast } from "../ui/use-toast";
interface IProps {
  params: TParamIteration;
  iterationIndex: number;
  totalIterations: number;
  expandParams: boolean;
  expandMetadata: boolean;
  hideModelNames: boolean;
  borderStyle: string;
}

export default function IterationResult(props: IProps) {
  const {
    params,
    iterationIndex,
    totalIterations,
    expandParams,
    expandMetadata,
    hideModelNames,
    borderStyle: borderStyle,
  } = props;
  const {
    model,
    system_prompt,
    prompt,
    temperature,
    repeat_penalty,
    top_k,
    top_p,
    repeat_last_n,
    tfs_z,
    mirostat,
    mirostat_tau,
    mirostat_eta,
  } = params;
  const [enabled, setEnabled] = useState(false);
  const [config, __] = useAtom(configAtom);
  const queryClient = useQueryClient();

  const modelLabel = hideModelNames ? "<Model name hidden>" : model;

  // Use only the cached queries from the parent component
  // Keep "enabled: false" to run queries in sequence and not concurrently
  const query = useQuery<IResponsePayload>({
    queryKey: ["get_inference", params],
    queryFn: (): Promise<IResponsePayload> => get_inference(config, params),
    enabled: enabled,
    staleTime: 0,
    // cacheTime: Infinity,
  });

  // Temporarily re-enables the current query
  // so we can refetch it, then disables it again
  // so new experiments can run sequentially.
  const refetchCurrentQuery = async () => {
    setEnabled(true);
    await asyncSleep(1);
    queryClient.refetchQueries({
      queryKey: ["get_inference", params],
    });
    await asyncSleep(1);

    setEnabled(false);
  };

  // Updates the list of experiments
  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["get_experiments"] });
  }, [query.data]);

  return (
    <div className="flex flex-row gap-1">
      <div
        className={`my-2 w-[98%] rounded border-l-2 ${borderStyle} bg-cyan-400/20 p-4 dark:bg-slate-700/50`}
      >
        {/* model + inference params */}

        <CollapsibleItem
          title={`[${iterationIndex + 1}/${totalIterations}] Gen ${params.generation + 1} | ${modelLabel} `}
          triggerText="Inference Parameters"
          defaultOpen={expandParams}
        >
          <div className="font-mono text-sm">
            <div>temperature: {temperature}</div>
            <div>repeat penalty: {repeat_penalty}</div>
            <div>top k: {top_k}</div>
            <div>top p: {top_p}</div>
            <div>repeat last n: {repeat_last_n}</div>
            <div>tfs_z: {tfs_z}</div>
            <div>mirostat: {mirostat}</div>
            <div>mirostat tau: {mirostat_tau}</div>
            <div>mirostat eta: {mirostat_eta}</div>
            <Separator className="my-2" />
            <div className=" whitespace-pre-wrap">
              prompt:{" "}
              <CollapsibleText
                text={prompt}
                maxChars={45}
                textClasses={"text-green-600 dark:text-green-500"}
              />
            </div>
            <div className=" whitespace-pre-wrap">
              system prompt:{" "}
              <CollapsibleText
                text={system_prompt}
                maxChars={45}
                textClasses={"text-amber-600 dark:text-amber-500"}
              />
            </div>
          </div>
        </CollapsibleItem>

        {query.isFetching ? (
          <div className="my-3 flex items-center gap-2 text-center">
            <Spinner className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:fill-cyan-500 dark:text-gray-600" />
            <span className="text-sm ">Running inference...</span>
          </div>
        ) : (
          // inference result
          <div id="inference-result">
            {query.error && (
              <div className="whitespace-pre-wrap text-red-600 dark:text-red-600">
                {query.error.toString()}

                <Button
                  variant="ghost"
                  className="mt-1"
                  size="sm"
                  onClick={refetchCurrentQuery}
                >
                  <ReloadIcon className="text-grey-700 h-4 w-4 dark:text-gray-400 " />
                </Button>
              </div>
            )}

            <div className="mt-3 whitespace-pre-wrap text-cyan-600 dark:text-cyan-600">
              {query.data && query.data.response}
            </div>

            {/* results metadata */}
            {query.data && (
              <div className="my-3 flex items-start">
                {/* copy text to clipboard */}
                <Button
                  className="mt-1"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (query.data) {
                      navigator.clipboard.writeText(query.data.response);

                      toast({
                        variant: "success",
                        title: "Inferred text copied to clipboard.",
                        duration: 2500,
                      });
                    }
                  }}
                >
                  <ClipboardCopyIcon className="h-4 w-4 text-gray-700 dark:text-gray-400 " />
                </Button>

                {/* Allow reloading after inference is done */}
                {query.isFetched && !query.isFetching && (
                  <Button
                    variant="ghost"
                    className="mt-1"
                    size="sm"
                    onClick={refetchCurrentQuery}
                  >
                    <ReloadIcon className="text-grey-700 h-4 w-4 dark:text-gray-400 " />
                  </Button>
                )}

                <CollapsibleItem
                  triggerText="Results metadata"
                  defaultOpen={expandMetadata}
                >
                  <div className="font-mono text-sm">
                    <>
                      <div>
                        Created at: {convertToUTCString(query.data.created_at)}
                      </div>
                      <div>
                        Prompt Eval Count: {query.data.prompt_eval_count} tokens
                      </div>
                      <div>
                        Prompt Eval Duration:{" "}
                        {formatInterval(
                          convertNanosecondsToTime(
                            query.data.prompt_eval_duration,
                          ),
                        )}
                      </div>
                      <div>Eval Count: {query.data.eval_count} tokens</div>
                      <div>
                        Eval Duration:{" "}
                        {formatInterval(
                          convertNanosecondsToTime(query.data.eval_duration),
                        )}
                      </div>
                      <div>
                        Inference Duration (prompt + eval):{" "}
                        {formatInterval(
                          convertNanosecondsToTime(
                            query.data.eval_duration +
                              query.data.prompt_eval_duration,
                          ),
                        )}
                      </div>
                      <div>
                        Total Duration:{" "}
                        {formatInterval(
                          convertNanosecondsToTime(query.data.total_duration),
                        )}
                      </div>
                      <div>
                        Throughput (tokens/total_duration):{" "}
                        {tokensPerSecond(
                          query.data.total_duration,
                          query.data.eval_count,
                        )}{" "}
                        tokens/s
                      </div>
                    </>
                  </div>
                </CollapsibleItem>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
