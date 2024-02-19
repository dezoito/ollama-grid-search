import { TParamIteration } from "@/Interfaces";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get_inference } from "../queries";
import { Button } from "../ui/button";
import { CollapsibleItem } from "../ui/collapsible-item";

interface IProps {
  prompt: string;
  params: TParamIteration;
}

export default function IterationResult(props: IProps) {
  const { params } = props;
  const { model, temperature, repeat_penalty, top_k, top_p } = params;
  const queryClient = useQueryClient();

  // Use only the cached queries from the parent component
  const query = useQuery({
    queryKey: ["get_inference", params],
    queryFn: () => get_inference(params),
    enabled: true,
    staleTime: Infinity,
    // cacheTime: Infinity,
  });

  if (query.isFetching) {
    return <div className="my-3 p-4 ">Generating...</div>;
  }
  return (
    <div className="flex flex-row gap-1">
      <div className="bg-cyan-400/20 dark:bg-slate-700/50 my-3 p-4 rounded">
        {/* model + inference params */}
        <CollapsibleItem
          title={model}
          triggerText="Inference Parameters"
          defaultOpen={false}
        >
          <div className="text-sm font-mono">
            <div>temperature: {temperature}</div>
            <div>repeat penalty: {repeat_penalty}</div>
            <div>top k: {top_k}</div>
            <div> top p: {top_p}</div>
          </div>
        </CollapsibleItem>

        {/* inferred text */}
        <div className="text-cyan-600 dark:text-cyan-600 ">
          {query.data as string}
        </div>
        {/* results metadata */}
        <div className="m-3">
          <CollapsibleItem
            title=""
            triggerText="Results metadata"
            defaultOpen={false}
          >
            <div className="text-sm font-mono">
              <div>inference metadata here</div>
            </div>
          </CollapsibleItem>
        </div>
      </div>
      <div className=" my-3">
        {" "}
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["get_inference", params],
              refetchType: "all",
            })
          }
        >
          <ReloadIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-600 " />
        </Button>
      </div>
    </div>
  );
}
