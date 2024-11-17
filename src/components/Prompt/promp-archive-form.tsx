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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { create_prompt, delete_prompt, update_prompt } from "../queries";
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

  //TODO: add validation rules for slug and to avoid duplicate slugs and names

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (prompt: IPrompt) => create_prompt(prompt),
    onSuccess: () => {
      // setCurrentPrompt(null);
      // setOpen(false);
      toast({
        variant: "success",
        title: "Prompt created successfully",
        duration: 2500,
      });
      queryClient.refetchQueries({
        queryKey: ["get_all_prompts"],
        exact: true,
      });
    },

    onError: (error) => {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Error creating prompt",
        description: error.toString(),
        duration: 3500,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (prompt: IPrompt) => update_prompt(prompt),
    onSuccess: () => {
      // setCurrentPrompt(null);
      // setOpen(false);
      toast({
        variant: "success",
        title: "Prompt updated successfully",
        duration: 2500,
      });
      queryClient.refetchQueries({
        queryKey: ["get_all_prompts"],
        exact: true,
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error updating prompt",
        description: error.toString(),
        duration: 3500,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => delete_prompt(uuid),
    onSuccess: () => {
      setCurrentPrompt(null);
      toast({
        variant: "success",
        title: "Prompt Deleted.",
        duration: 2500,
      });
      queryClient.refetchQueries({
        queryKey: ["get_all_prompts"],
        exact: true,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting prompt",
        description: error.toString(),
        duration: 3500,
      });
    },
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

    const promptData = {
      ...data,
      uuid: data.uuid || uuidv4(),
    };

    // If we are creating a new promp, define its uuid
    // then call the correct mutation
    (data.uuid ? updateMutation : createMutation).mutate(promptData);

    setCurrentPrompt(promptData);
  }

  async function deletePrompt(uuid: string) {
    if (
      await confirm({
        title: "Sanity Check",
        body: "Are you sure you want to do that?",
        cancelButton: "Cancel",
        actionButton: "Delete!",
      })
    ) {
      deleteMutation.mutate(uuid);
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
                    <Input
                      {...field}
                      className="pl-4"
                      disabled={currentPrompt !== null}
                    />
                  </FormControl>
                </div>

                <FormDescription>
                  Typing "/" in a prompt input will display a list of commands
                  to autofill the field.
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
          type="button"
          variant="default"
          onClick={async () => {
            setOpen(false);
          }}
        >
          Close
        </Button>

        {currentPrompt && (
          <div>
            <span className="mx-5"></span>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => await deletePrompt(currentPrompt.uuid)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
}
