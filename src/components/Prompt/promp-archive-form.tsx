import { IPrompt } from "@/Interfaces";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface IProps {
  currentPrompt: IPrompt | null;
}

const DEFAULT_VALUES = {
  uuid: "",
  name: "",
  slug: "",
  prompt: "",
  notes: "",
};

export function PromptArchiveForm(props: IProps) {
  const { currentPrompt } = props;
  const [initialValues, setInitialValues] =
    useState<z.infer<typeof FormSchema>>(DEFAULT_VALUES);

  const FormSchema = z.object({
    uuid: z.string().optional(),
    name: z.string().max(50).min(1),
    slug: z.string().max(50).min(1),
    prompt: z.string().min(1),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (currentPrompt) {
      setInitialValues({
        uuid: currentPrompt.uuid,
        name: currentPrompt.name,
        slug: currentPrompt.slug,
        prompt: currentPrompt.prompt,
        notes: currentPrompt.notes || "",
      });
    } else {
      setInitialValues(DEFAULT_VALUES);
    }
  }, [currentPrompt]);

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-grow space-y-6"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
