import { IPrompt } from "@/Interfaces";
import { get_all_prompts } from "@/components/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArchiveIcon, PlusIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PromptArchiveForm } from "./promp-archive-form";
import { PromptList } from "./prompt-list";

export function PromptArchiveDialog() {
  const [open, setOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<IPrompt | null>(null);

  const promptQuery = useQuery<IPrompt[]>({
    queryKey: ["get_all_prompts"],
    queryFn: (): Promise<IPrompt[]> => get_all_prompts(),
    refetchInterval: 1000 * 30 * 1,
    refetchOnWindowFocus: "always",
    staleTime: 0,
    // cacheTime: 0,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="transparentDark" size="icon">
              <ArchiveIcon className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Manage Prompts</TooltipContent>
      </Tooltip>

      <DialogContent className="fixed left-2.5 right-2.5 top-5 h-[calc(100vh-30px)] w-[calc(100vw-20px)] max-w-none translate-x-0 translate-y-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <DialogHeader className="border-b px-6 py-4 dark:border-gray-800">
            <DialogTitle>Prompt Archive</DialogTitle>
            <DialogDescription>
              <span className="flex w-full items-center justify-center gap-4">
                <span className="w-full">
                  Manage your collection of prompts (
                  {promptQuery.data && promptQuery.data.length} in collection).
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setCurrentPrompt(null)}
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Create a new Prompt
                </Button>
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Main Content Area */}
          <div className="flex gap-4 p-6">
            {/* Content here */}
            <div className="w-[400px]">
              {/* Left Column Content */}
              {promptQuery.data && (
                <PromptList
                  prompts={promptQuery.data}
                  currentPrompt={currentPrompt}
                  setCurrentPrompt={setCurrentPrompt}
                />
              )}
            </div>
            <div className="flex-1">
              {/* Right Column Content */}
              {promptQuery.data && (
                <PromptArchiveForm
                  prompts={promptQuery.data}
                  currentPrompt={currentPrompt}
                  setCurrentPrompt={setCurrentPrompt}
                  setOpen={setOpen}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          {/* <DialogFooter className="border-t p-6 dark:border-gray-800">
            Footer Content
          </DialogFooter> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
