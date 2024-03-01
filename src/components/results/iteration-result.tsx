import { configAtom } from "@/Atoms";
import { IResponsePayload, TParamIteration } from "@/Interfaces";
import {
  asyncSleep,
  convertNanosecondsToTime,
  convertToUTCString,
  formatInterval,
  tokensPerSecond,
} from "@/lib";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { get_inference } from "../queries";
import { Button } from "../ui/button";
import { CollapsibleItem } from "../ui/collapsible-item";
import Spinner from "../ui/spinner";

interface IProps {
  prompt: string;
  params: TParamIteration;
  iterationIndex: number;
  totalIterations: number;
  expandParams: boolean;
  expandMetadata: boolean;
}

export default function IterationResult(props: IProps) {
  const {
    params,
    iterationIndex,
    totalIterations,
    expandParams,
    expandMetadata,
  } = props;
  const { model, temperature, repeat_penalty, top_k, top_p, repeat_last_n } =
    params;
  const [enabled, setEnabled] = useState(false);
  const [config, __] = useAtom(configAtom);
  const queryClient = useQueryClient();

  // Use only the cached queries from the parent component
  // Keep "enabled: false" to run queries in sequence and not concurrently
  const query = useQuery<IResponsePayload>({
    queryKey: ["get_inference", params],
    queryFn: (): Promise<IResponsePayload> => get_inference(config, params),
    enabled: enabled,
    staleTime: Infinity,
    // cacheTime: Infinity,
  });

  // Temporarily re-enables the current query
  // so we can refetch it, then disables it again
  // so new experiments can run sequentially.
  const refetchCurrentQuery = async () => {
    setEnabled(true);
    await asyncSleep(1);
    queryClient.refetchQueries({ queryKey: ["get_inference", params] });
    await asyncSleep(1);

    setEnabled(false);
  };

  return (
    <div className="flex flex-row gap-1">
      <div className="my-3 w-11/12 rounded bg-cyan-400/20 p-4 dark:bg-slate-700/50">
        {/* model + inference params */}

        <CollapsibleItem
          title={`${iterationIndex + 1}/${totalIterations} - ${model}`}
          triggerText="Inference Parameters"
          defaultOpen={expandParams}
        >
          <div className="font-mono text-sm">
            <div>temperature: {temperature}</div>
            <div>repeat penalty: {repeat_penalty}</div>
            <div>top k: {top_k}</div>
            <div>top p: {top_p}</div>
            <div>repeat last n: {repeat_last_n}</div>
          </div>
        </CollapsibleItem>

        {query.isFetching ? (
          <div className="my-3 flex items-center gap-2 text-center">
            <Spinner className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:fill-cyan-500 dark:text-gray-600" />
            <span className="text-sm ">Running inference...</span>
          </div>
        ) : (
          // inference result
          <div id="inference-result" className="my-2">
            {query.error && (
              <div className="whitespace-pre-wrap text-red-600 dark:text-red-600">
                {query.error.toString()}
              </div>
            )}

            <div className="whitespace-pre-wrap text-cyan-600 dark:text-cyan-600">
              {query.data && query.data.response}
            </div>

            {/* results metadata */}
            {query.data && (
              <div className="my-3">
                <CollapsibleItem
                  triggerText="Results metadata"
                  defaultOpen={expandMetadata}
                >
                  <div className="font-mono text-sm">
                    <>
                      <div>
                        Created at: {convertToUTCString(query.data.created_at)}
                      </div>
                      <div>Eval Count: {query.data.eval_count} tokens</div>
                      <div>
                        Eval Duration:{" "}
                        {formatInterval(
                          convertNanosecondsToTime(query.data.eval_duration),
                        )}
                      </div>
                      <div>
                        Throughput:{" "}
                        {tokensPerSecond(
                          query.data.eval_duration,
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

      {/* Allow reloading after inference is done */}
      {query.isFetched && !query.isFetching && (
        <div className=" my-3">
          <Button variant="ghost" size="sm" onClick={refetchCurrentQuery}>
            <ReloadIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-600 " />
          </Button>
        </div>
      )}
    </div>
  );
}
