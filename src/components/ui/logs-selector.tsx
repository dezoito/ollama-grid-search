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
            Here's a list of your experiments, parameters and results.
          </SheetDescription>
        </SheetHeader>
        <div id="results" className="h-full w-full overflow-y-auto py-6">
          {query.isLoading && (
            <div className="py-2">
              <div>Loading...</div>
            </div>
          )}
          {query.data &&
            query.data.map((exp: IExperimentFile) => (
              <div key={exp.name} className="py-4">
                <div className="">
                  {convertEpochToDateTime(exp.created.secs_since_epoch)} hs
                </div>
                <div className="text-sm text-gray-400">{exp.name}</div>
                {/* <div className="bg-slate-600 text-sm text-gray-400">
                  <pre>{exp.contents}</pre>
                </div> */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(exp.name, exp.contents)}
                  >
                    Download
                  </Button>
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
