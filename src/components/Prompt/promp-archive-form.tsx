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
  prompts: IPrompt[];
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
  const { prompts, currentPrompt, setOpen, setCurrentPrompt } = props;
  const { toast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [initialValues, setInitialValues] =
    useState<z.infer<typeof FormSchema>>(DEFAULT_VALUES);

  const FormSchema = z.object({
    uuid: z.string().optional(),
    name: z
      .string()
      .max(50)
      .min(1)
      .refine((name) => {
        // If editing an existing prompt, allow its current name
        if (currentPrompt && name === currentPrompt.name) {
          return true;
        }
        // Check if the name is unique among all other prompts
        return !prompts.some(
          (prompt) => prompt.name.toLowerCase() === name.toLowerCase(),
        );
      }, "A prompt with this name already exists"),
    slug: z
      .string()
      .max(50)
      .min(1)
      .regex(
        /^[a-z0-9-]+$/,
        "Make sure your command contains only lowercase letters, numbers, and hyphens",
      )
      .refine((slug) => {
        // If editing an existing prompt, allow its current slug
        if (currentPrompt && slug === currentPrompt.slug) {
          return true;
        }
        // Check if the slug is unique among all other prompts
        return !prompts.some(
          (prompt) => prompt.slug.toLowerCase() === slug.toLowerCase(),
        );
      }, "A slash command with this name already exists"),
    prompt: z.string().min(1),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  // Function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim(); // Remove leading/trailing spaces
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (prompt: IPrompt) => create_prompt(prompt),
    onSuccess: (_, variables) => {
      setCurrentPrompt(variables);
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
      // console.error(error);
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
      // console.error(error);
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
    // If we are creating a new promp, define its uuid
    // then call the correct mutation
    (data.uuid ? updateMutation : createMutation).mutate({
      ...data,
      uuid: data.uuid || uuidv4(),
    });
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
                  <Input
                    {...field}
                    onChangeCapture={(e) => {
                      // Only update slug if this is a new prompt and name changes
                      if (
                        !currentPrompt &&
                        e.currentTarget.value !== field.value
                      ) {
                        const newSlug = generateSlug(e.currentTarget.value);
                        form.setValue("slug", newSlug);
                      }
                    }}
                    autoCapitalize="none"
                    autoComplete="off"
                    maxLength={50}
                  />
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
                      maxLength={50}
                      autoCapitalize="none"
                      autoComplete="off"
                      // Tries to ensure MacOS doesn't autofuck and capitalize
                      onChangeCapture={(e) => {
                        e.currentTarget.value = generateSlug(
                          e.currentTarget.value,
                        );
                      }}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Typing "/" in a prompt input will display a list of commands
                  to autofill the field.
                  {/* <p>
                    A command can only contain lowercase letters, numbers, and
                    hyphens.
                  </p> */}
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
                  <Textarea {...field} rows={7} />
                </FormControl>
                <FormDescription>
                  You can define variables by enclosing them in square brackets,
                  like <b>[input]</b> or <b>[var]</b>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5 flex justify-end space-x-2">
          <Button
            type="button"
            variant="default"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save Prompt
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => setOpen(false)}
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
      </form>
    </Form>
  );
}

export default PromptArchiveForm;
