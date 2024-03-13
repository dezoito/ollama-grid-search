import { EnterFullScreenIcon } from "@radix-ui/react-icons";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface IProps {
  originalForm: any;
}

export function PromptDialog(props: IProps) {
  const { originalForm } = props;
  const [open, setOpen] = useState(false);

  // * default_options has to be valid JSON
  const FormSchema = z.object({
    prompt: z.string(),
  });

  // * format default_options to display in form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: originalForm.getValues("prompt"),
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    originalForm.setValue("prompt", data.prompt);
    setOpen(false);
  }

  /*  
      ! Undocumented behaviour
      - Form has to wrap the entire dialog
      - form has to be inside DialogContent
  */
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="transparentDark" size="sm">
            <EnterFullScreenIcon className="h-4 w-4 text-cyan-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90%]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Prompt</DialogTitle>
              <DialogDescription>
                Use this dialog for a more comfortable prompting experience.
              </DialogDescription>
            </DialogHeader>
            {/* 
            form here
             */}

            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={18} cols={100} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Prompt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
