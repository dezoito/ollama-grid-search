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
import { ArchiveIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PromptList } from "./prompt-list";

export function PromptArchiveDialog() {
  const [open, setOpen] = useState(false);
  // Controls whether we display a list of prompts of a CRUD form
  const [displayList, setDisplayList] = useState(true);
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
      <DialogTrigger asChild>
        <Button variant="transparentDark" size="icon">
          <ArchiveIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-2.5 right-2.5 top-5 h-[calc(100vh-30px)] w-[calc(100vw-20px)] max-w-none translate-x-0 translate-y-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <DialogHeader className="border-b px-6 py-4 dark:border-gray-800">
            <DialogTitle>Prompt Archive</DialogTitle>
            <DialogDescription>
              Manage your favorite prompts here.
            </DialogDescription>
          </DialogHeader>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Content here */}

            {displayList ? (
              promptQuery.data && (
                <PromptList
                  prompts={promptQuery.data}
                  setCurrentPrompt={setCurrentPrompt}
                />
              )
            ) : (
              <>Handle a form here</>
            )}
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
