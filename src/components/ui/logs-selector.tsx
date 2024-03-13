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
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { saveAs } from "file-saver";
import { get_experiments } from "../queries";

const handleDownload = async (
  fileName: string,
  fileContents: string,
  type = "application/json",
) => {
  // console.log("Init handle download", fileName, fileContents);

  // From: https://github.com/tauri-apps/tauri/issues/4633#issuecomment-1866686470
  // Other options: https://davelage.com/posts/tauri-save-files/
  // * Currently, there is no way to select a initial directory like "downloads"
  if (window.__TAURI__) {
    const filePath = await save({
      defaultPath: fileName,
    });
    await writeTextFile(filePath || "", fileContents);
  } else {
    saveAs(new Blob([fileContents], { type }), fileName);
  }
};

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
            Here's a list of your experiments, parameters and results, in JSON
            format:
          </SheetDescription>
        </SheetHeader>
        <div id="results" className="h-full w-full gap-8 overflow-y-auto py-6">
          {query.isLoading && (
            <div className="py-2">
              <div>Loading...</div>
            </div>
          )}
          {query.data &&
            query.data.map((exp: IExperimentFile) => (
              <div className="my-2">
                <Button
                  variant="ghost"
                  className="flex h-full w-full flex-col items-start rounded-sm text-left text-sm transition-all hover:bg-accent"
                  size="lg"
                  onClick={() => handleDownload(exp.name, exp.contents)}
                >
                  <div className="py-2">
                    <div className="w-full font-semibold">
                      {convertEpochToDateTime(exp.created.secs_since_epoch)}
                    </div>

                    <div className="text-sm text-gray-400">{exp.name}</div>
                  </div>
                </Button>
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
