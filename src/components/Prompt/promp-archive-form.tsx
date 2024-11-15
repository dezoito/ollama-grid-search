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
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useConfirm } from "../ui/alert-dialog-provider";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface IProps {
  currentPrompt: IPrompt | null;
  setCurrentPrompt: (prompt: IPrompt | null) => void;
  setOpen: (open: boolean) => void;
}

const DEFAULT_VALUES = {
  uuid: "",
  name: "",
  slug: "",
  prompt: "",
};

export function PromptArchiveForm(props: IProps) {
  const { currentPrompt, setOpen, setCurrentPrompt } = props;
  const { toast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

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

  async function deletePrompt(uuid: string) {
    console.log("deleting prompt", uuid);
    if (
      await confirm({
        title: "Sanity Check",
        body: "Are you sure you want to do that?",
        cancelButton: "Cancel",
        actionButton: "Delete!",
      })
    ) {
      //TODO: add mutation to delete the current prompt
      setCurrentPrompt(null);

      toast({
        variant: "success",
        title: "Prompt Deleted.",
        duration: 2500,
      });
      queryClient.refetchQueries({
        queryKey: ["get_all_prompts"],
      });
    }
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
      <div className="mt-5 flex justify-end space-x-2">
        <Button
          type="button"
          variant="default"
          onClick={form.handleSubmit(onSubmit)} //Bypasses ShadCN form on modal bug
        >
          Save Prompt
        </Button>

        <Button
          className="ml-5"
          type="button"
          variant="ghost"
          onClick={async () => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>

        {currentPrompt && (
          <Button
            className="ml-10"
            type="button"
            variant="destructive"
            onClick={async () => await deletePrompt(currentPrompt.uuid)}
          >
            Delete
          </Button>
        )}
      </div>
    </Form>
  );
}
