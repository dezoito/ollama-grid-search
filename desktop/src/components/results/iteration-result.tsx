import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { invoke } from "@tauri-apps/api/tauri";
import { TParamIteration } from "@/Interfaces";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ReloadIcon } from "@radix-ui/react-icons";
import { get_inference } from "../queries";
import { Button } from "../ui/button";

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
      {/* <div>{prompt}</div> */}
      {/* <div>{JSON.stringify(params)}</div> */}
      <div className="bg-cyan-400/20 dark:bg-slate-700/50 my-3 p-4 rounded">
        {/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
        <div className="text-sm font-semibold">{model}:</div>

        <div className="text-cyan-600 dark:text-cyan-600 ">
          {query.data as string}
        </div>
        {/* params */}
        <div className="m-1">
          <Collapsible>
            <CollapsibleTrigger>Inference Parameters</CollapsibleTrigger>
            <CollapsibleContent>
              <div className="text-sm font-mono">
                {JSON.stringify(
                  { model, temperature, repeat_penalty, top_k, top_p },
                  null,
                  2,
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
