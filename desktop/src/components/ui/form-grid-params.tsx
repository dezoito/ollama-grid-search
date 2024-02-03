import { configAtom } from "@/Atoms";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import z from "zod";
import ModelSelector from "../filters/ModelSelector";
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

export default function FormGridParams() {
  const { toast } = useToast();
  const [config, _] = useAtom(configAtom);

  const FormSchema = z.object({
    models: z.string().array().nonempty({
      message: "Select at least 1 model.",
    }),
    prompt: z.string().min(1),
    temperatureArray: z.string().refine(
      (value) => {
        // Split the input string by commas
        const values = value.split(",");

        // Check if at least one value is a valid float number
        return values.some((val) => {
          const floatValue = parseFloat(val.trim());
          return !isNaN(floatValue);
        });
      },
      {
        message:
          "Invalid temperature array format. Please enter at least one valid float number.",
      },
    ),
  });
  // Starts with value set in Settings > default options
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      temperatureArray: config.defaultOptions.temperature,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // if (Object.keys(form.formState.errors).length > 0) {
    //   console.log("FORM ERRORS", form.formState.errors);
    // }

    console.log(data);

    toast({
      title: "Running experiment.",
      duration: 2500,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            name="temperatureArray"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Temperature Array</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>The prompt you want to test</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
