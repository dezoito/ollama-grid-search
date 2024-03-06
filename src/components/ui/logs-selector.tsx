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
import { FileTextIcon } from "@radix-ui/react-icons";

export function LogsSelector() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="transparentDark" size="icon" onClick={() => {}}>
          <FileTextIcon className="h-5 w-5 text-cyan-50" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Experiments</SheetTitle>
          <SheetDescription>
            Here's a list of your experiments, parameters and results.
          </SheetDescription>
        </SheetHeader>
        <div className=" py-4">Experiments here </div>
        <SheetFooter>
          <SheetClose asChild>
            {/* <Button type="submit">Save changes</Button> */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
