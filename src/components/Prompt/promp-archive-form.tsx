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
import { Switch } from "../ui/switch";

interface IProps {
  currentPrompt: IPrompt | null;
}

export function PromptArchiveForm(props: IProps) {
  const { currentPrompt } = props;
  const [initialValues, setInitialValues] = useState<
    z.infer<typeof FormSchema>
  >({
    uuid: "",
    name: "",
    slug: "",
    prompt: "",
    notes: "",
    is_active: true,
    date_created: 0,
    last_modified: 0,
  });

  const FormSchema = z.object({
    uuid: z.string().optional(),
    name: z.string().max(50).min(1),
    slug: z.string().max(50).min(1),
    prompt: z.string().min(1),
    notes: z.string().optional(),
    is_active: z.boolean().default(true),
    date_created: z.number().optional(),
    last_modified: z.number().optional(),
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
        is_active: currentPrompt.is_active,
        date_created: currentPrompt.date_created,
        last_modified: currentPrompt.last_modified,
      });
      form.reset(initialValues);
    } else {
      setInitialValues({
        uuid: "",
        name: "",
        slug: "",
        prompt: "",
        notes: "",
        is_active: true,
        date_created: 0,
        last_modified: 0,
      });
      form.reset({
        uuid: "",
        name: "",
        slug: "",
        prompt: "",
        notes: "",
        is_active: true,
        date_created: 0,
        last_modified: 0,
      });
    }
  }, [currentPrompt, form, initialValues]);

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
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormMessage />
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
      </form>
    </Form>
  );
}
