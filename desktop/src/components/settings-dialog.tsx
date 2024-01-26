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

import { configAtom } from "@/Atoms";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export function SettingsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useAtom(configAtom);

  // * defaultOptions has to be valid JSON
  const FormSchema = z.object({
    serverURL: z.string().min(1),
    systemPrompt: z.string(),
    defaultOptions: z.string().refine(
      (data) => {
        try {
          JSON.parse(data);
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: "defaultOptions must be a valid JSON string",
      },
    ),
  });

  // * format defaultOptions to display in form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...config,
      defaultOptions: JSON.stringify(config.defaultOptions, null, 2),
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // if (Object.keys(form.formState.errors).length > 0) {
    //   console.log("FORM ERRORS", form.formState.errors);
    // }
    toast({
      title: "Settings updated.",
      duration: 2500,
    });

    // * convert defaultOptions to object and save changes
    setConfig({
      ...data,
      defaultOptions: JSON.parse(data.defaultOptions),
    });
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
          <Button variant="transparentDark" size="icon">
            <GearIcon className="h-5 w-5 text-cyan-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Set default values for interacting with Ollama.
              </DialogDescription>
            </DialogHeader>
            {/* 
            form here
             */}
            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="serverURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ollama Server URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        URL for your Ollama server
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: Override your models' default system prompt.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="defaultOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Options</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} />
                      </FormControl>
                      <FormDescription>
                        Override Ollama's default model options (
                        <a
                          target="_blank"
                          href="https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values"
                        >
                          Docs
                        </a>
                        )
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
