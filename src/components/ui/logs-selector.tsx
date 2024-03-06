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
import { useQuery } from "@tanstack/react-query";
import { get_experiments } from "../queries";

export function LogsSelector() {
  const query = useQuery<IExperimentFile[]>({
    queryKey: ["get_Experiments"],
    queryFn: (): Promise<IExperimentFile[]> => get_experiments(),
    refetchOnWindowFocus: "always",
    // refetchInterval: 1000 * 30,
    staleTime: 0,
    // cacheTime: 0,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="transparentDark" size="icon" onClick={() => {}}>
          <FileTextIcon className="h-5 w-5 text-cyan-50" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px]  sm:max-w-none">
        <SheetHeader>
          <SheetTitle>Experiments</SheetTitle>
          <SheetDescription>
            Here's a list of your experiments, parameters and results.
          </SheetDescription>
        </SheetHeader>
        <div className="w-max py-4">
          {query.isLoading && (
            <div className="py-2">
              <div>Loading...</div>
            </div>
          )}
          {query.data &&
            query.data.map((exp: IExperimentFile) => (
              <div key={exp.name} className="py-2">
                <div>{exp.name}</div>
                <div className="text-sm text-gray-400">
                  {convertEpochToDateTime(exp.created.secs_since_epoch)}
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
