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
import { useQueryClient } from "@tanstack/react-query";
import { getVersion } from "@tauri-apps/api/app";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function SettingsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useAtom(configAtom);
  const queryClient = useQueryClient();
  const [appVersion, setAppVersion] = useState<string>();

  const appVersionPromise = getVersion();
  (async () => {
    let v = await appVersionPromise;
    setAppVersion(v);
  })();

  // * default_options has to be valid JSON
  const FormSchema = z.object({
    hide_model_names: z.coerce.boolean().default(false),
    request_timeout: z.coerce.number().min(5),
    concurrent_inferences: z.coerce.number().min(1).max(5),
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

    // remove slash from server_url after port if it was added
    if (data.server_url.charAt(data.server_url.length - 1) === "/") {
      data = {
        ...data,
        server_url: data.server_url.slice(0, -1),
      };
    }

    const old_server_url = config.server_url;

    // * convert default_options to object and save changes
    setConfig({
      ...data,
      default_options: JSON.parse(data.default_options),
    });

    // Update models and version in form, in case user changed the server_url field
    if (data.server_url !== old_server_url) {
      queryClient.refetchQueries({ queryKey: ["get_models"] });
      queryClient.refetchQueries({ queryKey: ["get_ollama_version"] });
    }

    setOpen(false);

    toast({
      variant: "success",
      title: "Settings updated.",
      duration: 2500,
    });
  }

  /*  
      ! Undocumented behaviour
      - Form has to wrap the entire dialog
      - form has to be inside DialogContent
  */
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="transparentDark" size="icon">
                <GearIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Set default values for interacting with Ollama.
                <div className="pt-1 text-xs text-gray-500">
                  Ollama Grid Search version {appVersion}
                </div>
              </DialogDescription>
            </DialogHeader>
            {/* 
            form here
             */}

            {/* we need to set a max-height on this div for overflow to work */}
            <ScrollArea className="h-[500px]">
              <div className="grid max-h-[500px] gap-6 px-4 py-4">
                <div>
                  <FormField
                    control={form.control}
                    name="hide_model_names"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Hide Model Names</FormLabel>
                          <FormDescription>
                            Hides model names in results to prevent human biases
                            in evaluations.{" "}
                            <p>
                              (They are still shown in inspections and logs)
                            </p>
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                {/* end switch */}
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
                    name="request_timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Timeout (secs)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The timeout in seconds for each inference request.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="concurrent_inferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concurrent Inferences</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of concurrent inference requests sent to the
                          server (max. 5)
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
                          ) .
                          <p>
                            Adding new options may cause issues with inference.
                            Be careful.
                          </p>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <div className="flex w-full items-center justify-around">
                <Button type="submit">Save changes</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
