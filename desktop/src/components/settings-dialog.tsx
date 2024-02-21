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

import { configAtom, defaultGridParams } from "@/Atoms";
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
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { gridParamsAtom } from "../Atoms";

export function SettingsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useAtom(configAtom);
  const [_, setGridParams] = useAtom(gridParamsAtom);
  const queryClient = useQueryClient();

  // * default_options has to be valid JSON
  const FormSchema = z.object({
    server_url: z.string().url(),
    system_prompt: z.string(),
    default_options: z.string().refine(
      (data) => {
        try {
          JSON.parse(data);
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: "default_options must be a valid JSON string",
      },
    ),
  });

  // * format default_options to display in form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...config,
      default_options: JSON.stringify(config.default_options, null, 2),
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

    // * convert default_options to object and save changes
    setConfig({
      ...data,
      default_options: JSON.parse(data.default_options),
    });

    // Update models in form (requires resetting fields)
    queryClient.refetchQueries({ queryKey: ["get_models"] });

    //todo
    //! is this really needed? we lose query results
    //! with this update
    setGridParams(defaultGridParams);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="server_url"
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
                  name="system_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
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
                  name="default_options"
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
                          <u>Docs</u>
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
