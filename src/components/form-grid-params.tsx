import { formValuesAtom } from "@/Atoms";
import ModelSelector from "@/components/Selectors/ModelSelector";
import PromptSelector from "@/components/Selectors/PromptSelector";
import SystemPromptSelector from "@/components/Selectors/SystemPromptSelector";
import { useConfirm } from "@/components/ui/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { isCommaDelimitedList } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { ScrollArea } from "./ui/scroll-area";

const validateNumberOrArray =
  (inputType: "float" | "int") => (value: string | number) => {
    const stringValue = typeof value === "string" ? value : value.toString();
    if (!isCommaDelimitedList(stringValue)) {
      // console.error("caught invalid list", stringValue);
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
  prompts: z
    .string()
    .array()
    .nonempty({
      message: "Create at least 1 prompt.",
    })
    .refine((arr) => !arr.some((val) => val.trim() === ""), {
      message: "All prompts must have content.",
    }),
  system_prompt: z.string(),
  generations: z.coerce.number().int().min(1),
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

/**
 * Takes a list of values which can be a scalar number, an array of numbers and/or strings,
 * or a comma-separated string of numbers and/or strings, and returns a flattened array
 * of numbers. If the input contains any non-number values, they are ignored.
 *
 * @param {string | number | (string | number)[]} list - The input list of values
 * @returns {number[]} - A flattened array of numbers
 */
function formValueToArray(
  list: string | number | (string | number)[],
): number[] {
  // If it's a scalar value, create an array with that value
  if (typeof list === "number") {
    return [list];
  }

  // If it's an array, flatten it
  if (Array.isArray(list)) {
    return list
      .flat()
      .map((value) => (typeof value === "number" ? value : parseFloat(value)));
  }

  // Otherwise, split the string and parse values as a list
  const values = list.split(",").map((value) => parseFloat(value));

  // Ensure all values are numbers
  return values.filter((value) => !isNaN(value));
}

/**
 * Converts an value (which can be a scalar, a string, or an array of numbers or strings)
 * into a string representation that can be used as the value for a text input field.
 * If the input is an array, the values are joined with a comma and a space.
 * If the input is not an array, the value is converted to a string using the toString() method.
 * If the input is not a number, string, or array, an error is thrown.
 *
 * * Essentially, this is the opposite of what formValueToArray() does
 * @param {number|string|(number|string)[]} input - The input value
 * @returns {string} - The string representation of the input
 */
function arrayToFormValue(input: number | (number | string)[]): string {
  if (Array.isArray(input)) {
    return input.join(", ").toString();
  } else if (typeof input === "number" || typeof input === "string") {
    return input.toString();
  } else {
    throw new Error("Invalid input type");
  }
}

export default function FormGridParams() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["get_inference"] });
  const { toast } = useToast();
  const [formValues, setFormValues] = useAtom(formValuesAtom);
  const confirm = useConfirm();

  // Initiates for fields with value set in Settings > default options
  const form = useForm<z.infer<typeof ParamsFormSchema>>({
    resolver: zodResolver(ParamsFormSchema),
    defaultValues: {
      experiment_uuid: uuidv4(),
      prompts: formValues.prompts,
      system_prompt: formValues.system_prompt,
      models: [],
      temperatureList: arrayToFormValue(formValues.temperatureList),
      repeatPenaltyList: arrayToFormValue(formValues.repeatPenaltyList),
      topKList: arrayToFormValue(formValues.topKList),
      topPList: arrayToFormValue(formValues.topPList),
      repeatLastNList: arrayToFormValue(formValues.repeatLastNList),
      tfsZList: arrayToFormValue(formValues.tfsZList),
      mirostatList: arrayToFormValue(formValues.mirostatList),
      mirostatTauList: arrayToFormValue(formValues.mirostatTauList),
      mirostatEtaList: arrayToFormValue(formValues.mirostatEtaList),
      generations: formValues.generations,
    },
  });

  // Updates form values when the user clones an experiment
  useEffect(() => {
    form.reset({
      // experiment_uuid: formValues.experiment_uuid,
      prompts: formValues.prompts,
      system_prompt: formValues.system_prompt,
      models: formValues.models,
      temperatureList: arrayToFormValue(formValues.temperatureList),
      repeatPenaltyList: arrayToFormValue(formValues.repeatPenaltyList),
      topKList: arrayToFormValue(formValues.topKList),
      topPList: arrayToFormValue(formValues.topPList),
      repeatLastNList: arrayToFormValue(formValues.repeatLastNList),
      tfsZList: arrayToFormValue(formValues.tfsZList),
      mirostatList: arrayToFormValue(formValues.mirostatList),
      mirostatTauList: arrayToFormValue(formValues.mirostatTauList),
      mirostatEtaList: arrayToFormValue(formValues.mirostatEtaList),
      generations: formValues.generations,
    });
  }, [formValues, form]);

  function onSubmit(data: z.infer<typeof ParamsFormSchema>) {
    // ! clear previous results (keep queries sequential)
    queryClient.removeQueries({ queryKey: ["get_inference"] });

    // regenerate uuid for this experiment so all results are refreshed
    setFormValues({
      ...data,
      experiment_uuid: uuidv4(),
      temperatureList: formValueToArray(data.temperatureList),
      repeatPenaltyList: formValueToArray(data.repeatPenaltyList),
      topKList: formValueToArray(data.topKList),
      topPList: formValueToArray(data.topPList),
      repeatLastNList: formValueToArray(data.repeatLastNList),
      tfsZList: formValueToArray(data.tfsZList),
      mirostatList: formValueToArray(data.mirostatList),
      mirostatTauList: formValueToArray(data.mirostatTauList),
      mirostatEtaList: formValueToArray(data.mirostatEtaList),
    });

    toast({
      // variant: "info",
      title: "Running experiment.",
      duration: 2500,
    });
  }

  useEffect(() => {
    form.trigger();
  }, [form]);

  return (
    <ScrollArea className="h-[calc(100vh-120px)] p-3">
      <div className="relative mb-12 flex min-h-screen flex-col">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow space-y-6"
          >
            <ModelSelector form={form} />
            <PromptSelector form={form} />
            <SystemPromptSelector form={form} />

            {/* generations */}
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="generations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Generations per parameter set
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Values higher than "1" will result in multiple generations
                      for each combination of parameters.
                    </FormDescription>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Temperature List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            The temperature of the model. Increasing the
                            temperature will make the model answer more
                            creatively.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Repeat Penalty List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Sets how strongly to penalize repetitions. A higher
                            value (e.g., 1.5) will penalize repetitions more
                            strongly, while a lower value (e.g., 0.9) will be
                            more lenient.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Top_K List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Reduces the probability of generating nonsense. A
                            higher value (e.g. 100) will give more diverse
                            answers, while a lower value (e.g. 10) will be more
                            conservative.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Top_P List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Works together with top-k. A higher value (e.g.,
                            0.95) will lead to more diverse text, while a lower
                            value (e.g., 0.5) will generate more focused and
                            conservative text.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Repeat_Last_N List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Sets how far back for the model to look back to
                            prevent repetition. (Default: 64, 0 = disabled, -1 =
                            num_ctx)
                          </TooltipContent>
                        </Tooltip>
                      </Button>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Tfs_Z List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Tail free sampling is used to reduce the impact of
                            less probable tokens from the output. A higher value
                            (e.g., 2.0) will reduce the impact more, while a
                            value of 1.0 disables this setting.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Mirostat List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Enable Mirostat sampling for controlling perplexity.
                            (default: 0, 0 = disabled, 1 = Mirostat, 2 =
                            Mirostat 2.0)
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Mirostat Tau List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Controls the balance between coherence and diversity
                            of the output. A lower value will result in more
                            focused and coherent text.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <FormLabel className="flex items-center font-bold">
                      <span className="flex-1">Mirostat Eta List</span>
                      <Button variant="ghost" size="sm" type="button">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Influences how quickly the algorithm responds to
                            feedback from the generated text. A lower learning
                            rate will result in slower adjustments, while a
                            higher learning rate will make the algorithm more
                            responsive.
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    </FormLabel>
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
                    <div className="flex items-center gap-2">
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
    </ScrollArea>
  );
}
