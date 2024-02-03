import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import ModelSelector from "../filters/ModelSelector";
import { Form } from "./form";
import { useToast } from "./use-toast";

export default function FormGridParams() {
  const { toast } = useToast();

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
    defaultValues: {},
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // if (Object.keys(form.formState.errors).length > 0) {
    //   console.log("FORM ERRORS", form.formState.errors);
    // }

    console.log(data);
    toast({
      title: "SStarting Experiment.",
      duration: 2500,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ModelSelector />;
      </form>
    </Form>
  );
}
