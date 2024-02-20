import { configAtom, gridParamsAtom } from "@/Atoms";
import { useConfirm } from "@/components/ui/alert-dialog-provider";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import ModelSelector from "../filters/ModelSelector";
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
  uuid: z.string().optional(),
  models: z.string().array().nonempty({
    message: "Select at least 1 model.",
  }),
  prompt: z.string().min(1),
  temperatureList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number.`,
    },
  ),
  repeatPenaltyList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number.`,
    },
  ),
  topKList: z.custom(
    (value) => validateNumberOrArray("int")(value as string | number),
    {
      message: `Invalid int array format. Please enter at least one valid integer number.`,
    },
  ),
  topPList: z.custom(
    (value) => validateNumberOrArray("float")(value as string | number),
    {
      message: `Invalid float array format. Please enter at least one valid float number.`,
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

  // Starts with value set in Settings > default options
  const form = useForm<z.infer<typeof ParamsFormSchema>>({
    resolver: zodResolver(ParamsFormSchema),
    defaultValues: {
      uuid: uuidv4(),
      prompt: "Write a short sentence!",
      models: ["tinydolphin:v2.8", "tinyllama:1.1b-chat-v0.6-q4_0"],
      temperatureList: config.defaultOptions.temperature,
      repeatPenaltyList: config.defaultOptions.repeat_penalty,
      topKList: config.defaultOptions.top_k,
      topPList: config.defaultOptions.top_p,
    },
  });

  function onSubmit(data: z.infer<typeof ParamsFormSchema>) {
    // ! clear previous results (keep queries sequential)
    queryClient.removeQueries({ queryKey: ["get_inference"] });

    // regenerate uuid for this experiment so all results are refreshed
    setGridParams({
      ...data,
      uuid: uuidv4(),
      temperatureList: paramsToArray(data.temperatureList),
      repeatPenaltyList: paramsToArray(data.repeatPenaltyList),
      topKList: paramsToArray(data.topKList),
      topPList: paramsToArray(data.topPList),
    });

    toast({
      title: "Running experiment.",
      duration: 2500,
    });
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-y-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex-grow"
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
                  <FormLabel className="font-bold">Prompt</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
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
          <div
            id="button-area"
            className="w-[479px] fixed bottom-0 left-0 right-0 p-4 shadow-md bg-white dark:bg-zinc-950"
          >
            <div className="flex gap-4 w-1/5">
              {/* Ensure the button-area stays within the column */}
              <Button type="submit" disabled={!!isFetching}>
                {!!isFetching ? (
                  <div className="flex gap-2">
                    <Spinner className="w-4 h-4" /> <>Running...</>
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
