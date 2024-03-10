import { IExperimentFile } from "@/Interfaces";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { convertEpochToDateTime } from "@/lib";
import { FileTextIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get_experiments } from "../queries";

export function LogsSelector() {
  const queryClient = useQueryClient();
  const query = useQuery<IExperimentFile[]>({
    queryKey: ["get_Experiments"],
    queryFn: (): Promise<IExperimentFile[]> => get_experiments(),
    staleTime: 0,
    // cacheTime: 0,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="transparentDark"
          size="icon"
          onClick={() =>
            queryClient.refetchQueries({
              queryKey: ["get_Experiments"],
            })
          }
        >
          <FileTextIcon className="h-5 w-5 text-cyan-50" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:max-w-none">
        <SheetHeader>
          <SheetTitle className="text-2xl">Experiments</SheetTitle>
          <SheetDescription>
            Here's a list of your experiments, parameters and results.
          </SheetDescription>
        </SheetHeader>
        <div
          id="results"
          className="h-full w-full overflow-y-auto bg-slate-700 py-6"
        >
          {query.isLoading && (
            <div className="py-2">
              <div>Loading...</div>
            </div>
          )}
          {query.data &&
            query.data.map((exp: IExperimentFile) => (
              <div key={exp.name} className="py-4">
                <div className="">
                  {convertEpochToDateTime(exp.created.secs_since_epoch)}
                </div>
                <div className="text-sm text-gray-400">{exp.name}</div>
                <div className="text-sm text-gray-400">
                  <pre>{exp.contents}</pre>
                </div>
              </div>
            ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            {/* <Button type="submit">Save changes</Button> */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
