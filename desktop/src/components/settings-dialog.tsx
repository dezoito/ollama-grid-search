import { GearIcon } from "@radix-ui/react-icons";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="transparentDark" size="icon">
          <GearIcon className="h-5 w-5 text-cyan-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Set default values for interacting with Ollama.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="serverURL" className="text-left">
              Ollama Server URL
            </Label>
            <Input
              id="serverURL"
              value="<get from state here>"
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="options" className="text-left">
              System Prompt
            </Label>
            <Textarea
              name="systemPrompt"
              id="systemPrompt"
              placeholder=""
              className="resize-none"
              value="get from atom here"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="options" className="text-left">
              Inference options (
              <a
                target="_blank"
                href="https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values"
              >
                Docs
              </a>
              )
            </Label>
            <Textarea
              name="options"
              id="options"
              placeholder="Tell us a little bit about yourself"
              className="resize-none"
              value="get from atom here"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
