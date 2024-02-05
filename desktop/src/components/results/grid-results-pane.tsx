import { gridParamsAtom } from "@/Atoms";
import { useAtom } from "jotai";

export default function GridResultsPane() {
  const [gridParams, _] = useAtom(gridParamsAtom);

  return <pre>{JSON.stringify(gridParams, null, 2)}</pre>;
}
