import { IExperimentFile, TFormValues } from "@/Interfaces";
import { Button } from "@/components/ui/button";

import { formValuesAtom } from "@/Atoms";
import { ExperimentDataDialog } from "@/components/experiment-data-dialog";
import { get_experiments } from "@/components/queries";
import { useConfirm } from "@/components/ui/alert-dialog-provider";
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
import { toast } from "@/components/ui/use-toast";
import {
  CrossCircledIcon,
  DownloadIcon,
  FileTextIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { saveAs } from "file-saver";
import { useAtom } from "jotai";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function processExperimentData(logContent: string): TFormValues {
  const logData = JSON.parse(logContent);
  const formValues: TFormValues = {
    experiment_uuid: "",
    models: [],
    system_prompt: logData.config.system_prompt || "",
    prompts: [],
    temperatureList: [],
    repeatPenaltyList: [],
    topKList: [],
    topPList: [],
    repeatLastNList: [],
    tfsZList: [],
    mirostatList: [],
    mirostatTauList: [],
    mirostatEtaList: [],
    generations: 0,
  };

  const uniquePrompts = new Set<string>();
  const uniqueModels = new Set<string>();
  const parameterSets = new Set<string>();

  logData.inferences.forEach((inference: any) => {
    const params = inference.parameters;
    uniquePrompts.add(params.prompt);
    uniqueModels.add(params.model);

    const roundedParams = {
      temperature: Number(params.temperature.toFixed(2)),
      repeat_penalty: Number(params.repeat_penalty.toFixed(2)),
      top_k: params.top_k,
      top_p: Number(params.top_p.toFixed(2)),
      repeat_last_n: params.repeat_last_n,
      tfs_z: Number(params.tfs_z.toFixed(2)),
      mirostat: params.mirostat,
      mirostat_tau: Number(params.mirostat_tau.toFixed(2)),
      mirostat_eta: Number(params.mirostat_eta.toFixed(2)),
    };

    const paramSet = JSON.stringify(roundedParams);

    const addParamIfNotDuplicate = (
      paramList: number[],
      paramValue: number,
    ): void => {
      if (!paramList.some((p) => p === paramValue)) {
        paramList.push(paramValue);
      }
    };

    if (!parameterSets.has(paramSet)) {
      parameterSets.add(paramSet);

      addParamIfNotDuplicate(
        formValues.temperatureList,
        roundedParams.temperature,
      );
      addParamIfNotDuplicate(
        formValues.repeatPenaltyList,
        roundedParams.repeat_penalty,
      );
      addParamIfNotDuplicate(formValues.topKList, roundedParams.top_k);
      addParamIfNotDuplicate(formValues.topPList, roundedParams.top_p);
      addParamIfNotDuplicate(
        formValues.repeatLastNList,
        roundedParams.repeat_last_n,
      );
      addParamIfNotDuplicate(formValues.tfsZList, roundedParams.tfs_z);
      addParamIfNotDuplicate(formValues.mirostatList, roundedParams.mirostat);
      addParamIfNotDuplicate(
        formValues.mirostatTauList,
        roundedParams.mirostat_tau,
      );
      addParamIfNotDuplicate(
        formValues.mirostatEtaList,
        roundedParams.mirostat_eta,
      );
    }
  });

  formValues.models = Array.from(uniqueModels);
  formValues.prompts = Array.from(uniquePrompts);
  formValues.generations = Math.floor(
    logData.inferences.length /
      parameterSets.size /
      uniqueModels.size /
      uniquePrompts.size,
  );

  console.log(formValues);
  return formValues;
}

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

export function ExperimentSelector() {
  const queryClient = useQueryClient();
  const [_, setFormValues] = useAtom(formValuesAtom);
  const [sheetOpen, setSheetOpen] = useState(false);
  const confirm = useConfirm();

  const query = useQuery<IExperimentFile[]>({
    queryKey: ["get_experiments"],
    queryFn: (): Promise<IExperimentFile[]> => get_experiments(),
    staleTime: 0,
    // cacheTime: 0,
  });

  function cloneExperiment(data: string) {
    const experimentData = processExperimentData(data);
    setFormValues(experimentData);
    toast({
      title:
        "The Form has been updated with the selected experiment parameters.",
      duration: 2500,
    });
    setSheetOpen(false);
  }

  async function deleteExperiments(experiment_uuid: string) {
    if (
      await confirm({
        title: "Sanity Check",
        body: "Are you sure you want to do that?",
        cancelButton: "Cancel",
        actionButton: "Delete!",
      })
    ) {
      console.log("Deleting experiment", experiment_uuid);

      await invoke<string>("delete_experiments", {
        uuid: experiment_uuid,
      });
      toast({
        variant: "warning",
        title: "The selected experiments have been deleted.",
        duration: 2500,
      });

      queryClient.refetchQueries({
        queryKey: ["get_experiments"],
      });
      // setSheetOpen(true);
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              variant="transparentDark"
              size="icon"
              onClick={() =>
                queryClient.refetchQueries({
                  queryKey: ["get_experiments"],
                })
              }
            >
              <FileTextIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>Saved experiments</TooltipContent>
      </Tooltip>

      <SheetContent className="w-[510px] sm:max-w-none">
        <SheetHeader>
          <SheetTitle className="text-2xl">Experiments</SheetTitle>
          <SheetDescription>
            Inspect, re-run, download or delete your experiments.
          </SheetDescription>
        </SheetHeader>
        <div id="results" className="h-full w-full gap-8 py-6">
          {query.isLoading && (
            <div className="py-2">
              <div>Loading...</div>
            </div>
          )}
          {query.data && (
            <div className="mr-1 flex justify-end">
              {" "}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await deleteExperiments("*");
                }}
                className="flex items-center space-x-2 text-red-500"
              >
                <CrossCircledIcon className="h-4 w-4" />
                <span>Delete all experiments</span>
              </Button>
            </div>
          )}
          <div className="scrollv max-h-[calc(100vh-200px)] scroll-m-4 overflow-y-auto pr-1 scrollbar scrollbar-track-inherit scrollbar-thumb-gray-200 dark:scrollbar-track-inherit dark:scrollbar-thumb-gray-800">
            {query.data &&
              query.data.map((exp: IExperimentFile) => (
                <div
                  className="my-1 flex items-center gap-2 justify-self-start rounded-sm p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={exp.name}
                >
                  <div className="flex-1 py-1">
                    <div className="text-[14px] font-semibold">
                      {exp.name}
                      {/* {convertEpochToDateTime(exp.created.secs_since_epoch)} */}
                    </div>

                    <div className="pb-1 text-xs text-gray-400">
                      {exp.created.toString()}
                    </div>
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
                      onClick={() =>
                        handleDownload(exp.name + ".json", exp.contents)
                      }
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>

                    {/* delete log file */}
                    <Button
                      size="icon"
                      variant="destructiveGhost"
                      onClick={async () => {
                        await deleteExperiments(
                          JSON.parse(exp.contents).experiment_uuid,
                        );
                      }}
                    >
                      <CrossCircledIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
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
