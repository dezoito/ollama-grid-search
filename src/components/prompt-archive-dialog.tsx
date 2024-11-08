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
import { useState } from "react";

export function PromptArchiveDialog() {
  const [open, setOpen] = useState(false);

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
            <DialogDescription>Prompt archive desc</DialogDescription>
          </DialogHeader>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">{/* Content here */}</div>

          {/* Footer */}
          {/* <DialogFooter className="border-t p-6 dark:border-gray-800">
            Footer Content
          </DialogFooter> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
