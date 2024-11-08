import { ArchiveIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prompt Archive</DialogTitle>
          <DialogDescription>Prompt archive desc</DialogDescription>
        </DialogHeader>
        {/* 
            Content here
             */}

        {/* we need to set a max-height on this div for overflow to work */}
        <div className="grid max-h-[500px] gap-6 overflow-y-auto px-4 py-4"></div>
        <DialogFooter>Footer Content</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
