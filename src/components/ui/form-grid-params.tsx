import { configAtom, gridParamsAtom } from "@/Atoms";
import { useConfirm } from "@/components/ui/alert-dialog-provider";
import { Input } from "@/components/ui/input";
import { isCommaDelimitedList } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import ModelSelector from "../filters/ModelSelector";
import { PromptDialog } from "../prompt-dialog";
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import Spinner from "./spinner";
import { Textarea } from "./textarea";
import { useToast } from "./use-toast";

const validateNumberOrArray =
  (inputType: "float" | "int") => (value: string | number) => {
    const stringValue = typeof value === "string" ? value : value.toString();
    if (!isCommaDelimitedList(stringValue)) {
      console.error("caught invalid list", stringValue);
      return false;
    }
    const values = stringValue.split(",");

    // If there is more than one value (comma-separated), validate each value
    if (values.length > 1) {
      return values.every((val) => {
        const parsedValue =
          inputType === "float"
            ? parseFloat(val.trim())
            : parseInt(val.trim(), 10);
        return !isNaN(parsedValue);
      });
    } else {
      // If there is only one value, validate it directly
      const parsedValue =
        inputType === "float"
          ? parseFloat(stringValue.trim())
          : parseInt(stringValue.trim(), 10);
      return !isNaN(parsedValue);
    }
  };

export const ParamsFormSchema = z.object({
  experiment_uuid: z.string().optional(),
  models: z.string().array().nonempty({
    message: "Select at least 1 model.",
  }),
  prompt: z.string().min(1),
  temperatureList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
  repeatPenaltyList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
  topKList: z.custom(
    (value) => validateNumberOrArray("int")(value as string | number),
    {
      message: `Invalid int array format. Please enter at least one valid integer number. Use commas to delimit values.`,
    },
  ),
  topPList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
  repeatLastNList: z.custom(
    (value) => validateNumberOrArray("int")(value as string | number),
    {
      message: `Invalid integer array format. Please enter at least one valid integer number. Use commas to delimit values.`,
    },
  ),
  tfsZList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
  mirostatList: z.custom(
    (value) => validateNumberOrArray("int")(value as string | number),
    {
      message: `Invalid integer array format. Please enter at least one valid integer number. Use commas to delimit values.`,
    },
  ),
  mirostatTauList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
  mirostatEtaList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number. Use commas to delimit values.`,
    },
  ),
});

function paramsToArray(list: string): number[] {
  // If it's a scalar value, create an array with that value
  if (typeof list === "number") {
    const parsedValue = parseFloat(list);
    if (!isNaN(parsedValue)) {
      return [parsedValue];
    } else {
      throw new Error("Invalid input: not a number or list of numbers");
    }
  }

  // Otherwise, split the string and parse values as a list
  const values = list.split(",").map((value) => parseFloat(value));

  // Ensure all values are numbers
  return values.filter((value) => !isNaN(value));
}

export default function FormGridParams() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["get_inference"] });
  const { toast } = useToast();
  const [config, _] = useAtom(configAtom);
  const [__, setGridParams] = useAtom(gridParamsAtom);
  const confirm = useConfirm();
  const [promptContent, setPromtContent] = useState("Write a short sentence!");

  // Initiates for fields with value set in Settings > default options
  const form = useForm<z.infer<typeof ParamsFormSchema>>({
    resolver: zodResolver(ParamsFormSchema),
    defaultValues: {
      experiment_uuid: uuidv4(),
      prompt: promptContent,
      models: [],
      temperatureList: config.default_options.temperature,
      repeatPenaltyList: config.default_options.repeat_penalty,
      topKList: config.default_options.top_k,
      topPList: config.default_options.top_p,
      repeatLastNList: config.default_options.repeat_last_n,
      tfsZList: config.default_options.tfs_z,
      mirostatList: config.default_options.mirostat,
      mirostatTauList: config.default_options.mirostat_tau,
      mirostatEtaList: config.default_options.mirostat_eta,
    },
  });

  function onSubmit(data: z.infer<typeof ParamsFormSchema>) {
    // ! clear previous results (keep queries sequential)
    queryClient.removeQueries({ queryKey: ["get_inference"] });

    // regenerate uuid for this experiment so all results are refreshed
    setGridParams({
      ...data,
      experiment_uuid: uuidv4(),
      temperatureList: paramsToArray(data.temperatureList),
      repeatPenaltyList: paramsToArray(data.repeatPenaltyList),
      topKList: paramsToArray(data.topKList),
      topPList: paramsToArray(data.topPList),
      repeatLastNList: paramsToArray(data.repeatLastNList),
      tfsZList: paramsToArray(data.tfsZList),
      mirostatList: paramsToArray(data.mirostatList),
      mirostatTauList: paramsToArray(data.mirostatTauList),
      mirostatEtaList: paramsToArray(data.mirostatEtaList),
    });

    toast({
      title: "Running experiment.",
      duration: 2500,
    });
  }

  return (
    <div className="relative mb-12 flex min-h-screen flex-col overflow-y-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-grow space-y-6"
        >
          <div>
            <ModelSelector form={form} />
          </div>
          {/* prompt */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center justify-between font-bold">
                    <div>Prompt</div>
                    <PromptDialog originalForm={form} content={promptContent} />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      onKeyUp={() => setPromtContent(field.value)}
                    />
                  </FormControl>
                  <FormDescription>The prompt you want to test</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* temperature */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="temperatureList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Temperature List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "temperature" values (e.g.: 0.5, 0.6, 0.7)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* repeatPenalty */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="repeatPenaltyList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Repeat Penalty List
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "repeat_penalty" values (e.g.: 1.0, 1.2, 1.5)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* top_k */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="topKList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Top_K List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "top_k" values (e.g.: 5, 25, 50)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* top_p */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="topPList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Top_P List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "top_p" values (e.g.: 0.5, 0.75, 0.9)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* repeat_last_n */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="repeatLastNList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Repeat_Last_N List
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "repeat_last_n" values (e.g.: 16, 32, 64)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* tfs_z */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="tfsZList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tfs_Z List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "tfs_z" values (e.g.: 1, 1.5, 2)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* mirostat */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="mirostatList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Mirostat List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "mirostat" values (e.g.: 0, 1, 2)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* mirostat_tau */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="mirostatTauList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Mirostat Tau List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "mirostat_tau" values (e.g.: 1.0, 2.0, 5.0)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* mirostat_eta */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="mirostatEtaList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Mirostat Eta List</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    List of "mirostat_eta" values (e.g.: 0.1, 0.2, 0.3)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* ===================================== */}
          {/* Buttons */}
          <div
            id="button-area"
            className="fixed bottom-0 left-0 right-0 w-[479px] bg-white p-4 shadow-md dark:bg-zinc-950"
          >
            <div className="flex w-1/5 gap-4">
              {/* Ensure the button-area stays within the column */}
              <Button type="submit" disabled={!!isFetching}>
                {!!isFetching ? (
                  <div className="flex gap-2">
                    <Spinner className="h-4 w-4" /> <>Running...</>
                  </div>
                ) : (
                  "Start Experiment"
                )}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={!isFetching}
                onClick={async () => {
                  if (
                    await confirm({
                      title: "Sanity Check",
                      body: "Are you sure you want to do that? Fired queries may still run in the background.",
                      cancelButton: "Cancel",
                      actionButton: "Stop!",
                    })
                  ) {
                    queryClient.cancelQueries({
                      queryKey: ["get_inference"],
                    });
                  }
                }}
              >
                Stop Experiment
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
