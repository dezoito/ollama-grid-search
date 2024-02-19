import { configAtom, gridParamsAtom } from "@/Atoms";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
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

  // Starts with value set in Settings > default options
  const form = useForm<z.infer<typeof ParamsFormSchema>>({
    resolver: zodResolver(ParamsFormSchema),
    defaultValues: {
      prompt: "Write a short sentence!",
      models: ["dolphin-mistral:v2.6"],
      temperatureList: config.defaultOptions.temperature,
      repeatPenaltyList: config.defaultOptions.repeat_penalty,
      topKList: config.defaultOptions.top_k,
      topPList: config.defaultOptions.top_p,
    },
  });

  function onSubmit(data: z.infer<typeof ParamsFormSchema>) {
    setGridParams({
      ...data,
      temperatureList: paramsToArray(data.temperatureList),
      repeatPenaltyList: paramsToArray(data.repeatPenaltyList),
      topKList: paramsToArray(data.topKList),
      topPList: paramsToArray(data.topPList),
    });

    // clear previous results
    queryClient.removeQueries({
      queryKey: ["get_inference"],
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
            <div className="w-1/5">
              {/* Ensure the button-area stays within the column */}
              <Button type="submit" disabled={!!isFetching}>
                {!!isFetching ? (
                  <div className="flex gap-2">
                    <Spinner /> <>Running...</>
                  </div>
                ) : (
                  "Start Experiment"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function Spinner() {
  // ref: https://flowbite.com/docs/components/spinner/
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-4 h-4 text-black animate-spin dark:text-white  fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
}
