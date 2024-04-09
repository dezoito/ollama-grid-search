import { ActivityLogIcon } from "@radix-ui/react-icons";

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

import { IExperimentFile } from "@/Interfaces";
import { useState } from "react";

interface IProps {
  experiment: IExperimentFile;
}

export function ExperimentDataDialog(props: IProps) {
  const { experiment } = props;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <ActivityLogIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Experiment Data</DialogTitle>
          <DialogDescription>
            {/* {convertEpochToDateTime(experiment.created.secs_since_epoch)} */}
          </DialogDescription>
        </DialogHeader>

        {/* we need to set a max-height on this div for overflow to work */}
        <div className="grid max-h-[500px] w-full gap-6 overflow-y-auto px-4 py-4">
          <pre className="font-mono text-sm">{experiment.contents}</pre>
        </div>
        {/* <DialogFooter>
          <div className="flex w-full items-center justify-around"></div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
