import { asyncSleep } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { TIteration } from "./grid-results-pane";

interface IProps {
  prompt: string;
  params: TIteration;
}

export default function IterationResult(props: IProps) {
  const { prompt, params } = props;

  const query = useQuery({
    queryKey: ["get_inference", params, prompt],
    queryFn: async () => {
      await asyncSleep(2500);
      return 1;
    },
  });

  if (query.isLoading) {
    return <>loading....</>;
  }
  return (
    <div>
      <div>{prompt}</div>
      <div>{JSON.stringify(params)}</div>
      <div>{JSON.stringify(query.data)}</div>;
    </div>
  );
}
