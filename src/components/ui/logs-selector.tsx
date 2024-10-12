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
import { DownloadIcon, FileTextIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { saveAs } from "file-saver";
import { useState } from "react";
import { ExperimentDataDialog } from "../experiment-data-dialog";
import { get_experiments } from "../queries";
import { toast } from "./use-toast";

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
  const [sheetOpen, setSheetOpen] = useState(false);

  function cloneExperiment(data: string) {
    toast({
      title: JSON.stringify(data, null, 2),
      duration: 2500,
    });
    setSheetOpen(false);
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
          <FileTextIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:max-w-none">
        <SheetHeader>
          <SheetTitle className="text-2xl">Experiments</SheetTitle>
          <SheetDescription>
            Inspect, re-run or download your experiments (JSON)
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
              <div
                className="my-1 flex items-center gap-2 justify-self-start rounded-sm p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                key={exp.name}
              >
                <div className="flex-1 py-1">
                  <div className="text-[14px] font-semibold">
                    {convertEpochToDateTime(exp.created.secs_since_epoch)}
                  </div>

                  <div className="pb-1 text-xs text-gray-400">{exp.name}</div>
                </div>

                {/* Buttons to inspect and download */}
                <div>
                  <ExperimentDataDialog experiment={exp} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cloneExperiment(exp.contents)}
                  >
                    <UpdateIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(exp.name, exp.contents)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          <div>&nbsp;</div>
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
