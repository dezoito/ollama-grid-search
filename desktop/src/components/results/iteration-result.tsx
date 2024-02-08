import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { invoke } from "@tauri-apps/api/tauri";
import { TParamIteration } from "@/Interfaces";
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { get_inference } from "../queries";
import { Button } from "../ui/button";

interface IProps {
  prompt: string;
  params: TParamIteration;
}

export default function IterationResult(props: IProps) {
  const { params } = props;
  const queryClient = useQueryClient();

  // Use only the cached queries from the parent component
  const query = useQuery({
    queryKey: ["get_inference", params],
    queryFn: () => get_inference(params),
    enabled: true,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (query.isFetching) {
    return <>Generating...</>;
  }
  return (
    <div>
      {/* <div>{prompt}</div> */}
      {/* <div>{JSON.stringify(params)}</div> */}
      <div className="bg-slate-700 m-3 opacity-50">
        {/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
        <div className="text-cyan-400">{query.data as string}</div>
      </div>
      <div>
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
          <ReloadIcon className="h-4 w-4 text-cyan-400" />
        </Button>
      </div>
    </div>
  );
}
