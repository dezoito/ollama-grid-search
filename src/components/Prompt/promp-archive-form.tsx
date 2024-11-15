import { IPrompt } from "@/Interfaces";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface IProps {
  currentPrompt: IPrompt | null;
  setOpen: (open: boolean) => void;
}

const DEFAULT_VALUES = {
  uuid: "",
  name: "",
  slug: "",
  prompt: "",
};

export function PromptArchiveForm(props: IProps) {
  const { currentPrompt, setOpen } = props;
  const { toast } = useToast();
  const [initialValues, setInitialValues] =
    useState<z.infer<typeof FormSchema>>(DEFAULT_VALUES);

  const FormSchema = z.object({
    uuid: z.string().optional(),
    name: z.string().max(50).min(1),
    slug: z.string().max(50).min(1),
    prompt: z.string().min(1),
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

    toast({
      variant: "success",
      title: "Prompt saved.",
      duration: 2500,
    });
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
                <FormLabel className="font-bold">Name</FormLabel>
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
                <FormLabel className="font-bold">Slash Command</FormLabel>
                <div className="relative mt-1 flex items-center">
                  <span className="absolute left-2 font-bold text-gray-500">
                    /
                  </span>
                  <FormControl>
                    <Input {...field} className="pl-6" />
                  </FormControl>
                </div>

                <FormDescription>
                  You can type "/" and the command above to autofill prompt
                  inputs.
                </FormDescription>
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
                <FormLabel className="font-bold">Prompt Text</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={8} />
                </FormControl>
                <FormDescription>
                  (Variable support will be added in the future.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>

      {/* Buttons to save and cancel */}
      <div className="mt-2 flex justify-end space-x-2">
        <Button
          type="button"
          variant="default"
          onClick={form.handleSubmit(onSubmit)} //Bypasses ShadCN form on modal bug
        >
          Save Prompt
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </Form>
  );
}
