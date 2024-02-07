import { useQuery } from "@tanstack/react-query";
// import { invoke } from "@tauri-apps/api/tauri";
import { TParamIteration } from "@/Interfaces";
import { get_inference } from "../queries";

interface IProps {
  prompt: string;
  params: TParamIteration;
}

export default function IterationResult(props: IProps) {
  const { prompt, params } = props;

  // Use only the cached queries from the parent component
  const query = useQuery({
    queryKey: ["get_inference", params],
    queryFn: get_inference(params),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (query.isLoading) {
    return <>loading....</>;
  }
  return (
    <div className="bg-slate-500 m-3">
      {/* <div>{prompt}</div> */}
      {/* <div>{JSON.stringify(params)}</div> */}
      <div className="bg-slate-300 m-3">{JSON.stringify(query, null, 2)}</div>
    </div>
  );
}
