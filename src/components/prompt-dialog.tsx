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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnterFullScreenIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import z from "zod";
import { PromptTextArea } from "./prompt-textarea";

interface IProps {
  content: string;
  handleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) => void;
  idx: number;
  fieldName: string;
  fieldLabel: string;
}

export function PromptDialog(props: IProps) {
  const { content, handleChange, idx, fieldName, fieldLabel } = props;
  const [open, setOpen] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const FormSchema = z.object({
    [fieldName]: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      [fieldName]: localContent,
    },
  });

  function onSubmit() {
    setOpen(false);
  }

  const handleLocalChange = (value: string) => {
    setLocalContent(value);
    const syntheticEvent = {
      target: { value, name: fieldName },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleChange(syntheticEvent, idx);
  };

  // Shortcut to save updated prompt text
  useHotkeys("mod+enter", () => form.handleSubmit(onSubmit)(), {
    enableOnFormTags: ["TEXTAREA"],
  });

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
              <DialogTitle>
                <span className="capitalize">{fieldLabel}</span> Editor
              </DialogTitle>
              <DialogDescription>
                Use this dialog to edit the contents of the {fieldLabel}.
                Variables like [input] can be replaced by pasting text.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-4">
                <FormItem>
                  <FormLabel>
                    <span className="capitalize">{fieldLabel}</span>{" "}
                    <span className="text-sm text-gray-500">
                      (Changes are automatically saved)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <PromptTextArea
                      value={localContent}
                      onChange={handleLocalChange}
                      rows={15}
                      placeholder="Type '/' to search prompts..."
                    />
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
