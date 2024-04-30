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

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnterFullScreenIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import z from "zod";

interface IProps {
  content: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>, idx: number) => void;
  idx: number;
  fieldName: string;
  fieldLabel: string;
}

export function PromptDialog(props: IProps) {
  const { content, handleChange, idx, fieldName, fieldLabel } = props;
  const [open, setOpen] = useState(false);

  // * default_options has to be valid JSON
  const FormSchema = z.object({
    [fieldName]: z.string(),
  });

  // * format default_options to display in form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      [fieldName]: content,
    },
  });

  function onSubmit() {
    setOpen(false);
  }

  // Updates prompt element on ctrl+enter (cmd+enter on macOS)
  useHotkeys("mod+enter", () => form.handleSubmit(onSubmit)(), {
    enableOnFormTags: ["TEXTAREA"],
  });

  /*  
      ! Undocumented behaviour
      - Form has to wrap the entire dialog
      - form has to be inside DialogContent
  */
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" type="button">
            <Tooltip>
              <TooltipTrigger asChild>
                <EnterFullScreenIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Expand {fieldLabel} input</TooltipContent>
            </Tooltip>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90%]">
          <form className="space-y-6">
            <DialogHeader>
              <DialogTitle>Prompt Editor</DialogTitle>
              <DialogDescription>
                Use this dialog to edit the contents of the {fieldLabel}.
              </DialogDescription>
            </DialogHeader>
            {/* 
            form here
             */}

            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-4">
                <FormItem>
                  <FormLabel>
                    Prompt{" "}
                    <span className="text-sm text-gray-500">
                      (Changes are automatically saved)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={18} cols={100}
                      value={content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e, idx)} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Close (Ctrl+Enter)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
