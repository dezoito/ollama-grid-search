import { PromptDialog } from "@/components/prompt-dialog";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { useFieldArray, useFormState } from "react-hook-form";
import { Autocomplete } from "./autocomplete";
import { z } from "zod";
import { ParamsFormSchema } from "../form-grid-params";

interface IProps {
  form: any;
}

function PromptSelector({ form }: IProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prompts",
  });

  // Explicitly type the errors
  const { errors } = useFormState<z.infer<typeof ParamsFormSchema>>({
    control: form.control,
  });

  const [showAutocomplete, setShowAutocomplete] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    const value = e.target.value;

    // Update form value
    form.setValue(`prompts.${index}`, value);

    // Check for autocomplete trigger
    const shouldShowAutocomplete = value.startsWith("/");
    setShowAutocomplete(shouldShowAutocomplete);
    setCurrentIndex(index);
  };

  return (
    <FormField
      control={form.control}
      name="prompts"
      render={() => (
        <FormItem>
          <FormLabel className="flex flex-row items-center justify-between text-base font-bold">
            Prompts
          </FormLabel>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`prompts.${index}`}
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center justify-between font-bold">
                    Prompt {fields.length > 1 && (index + 1).toString()}
                    <div>
                      <PromptDialog
                        content={fieldProps.value}
                        handleChange={(e) => handlePromptChange(e, index)}
                        idx={index}
                        fieldName={`prompts.${index}`}
                        fieldLabel="prompt"
                      />
                      {fields.length > 1 && (
                        <Button
                          variant="destructiveGhost"
                          size="sm"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TrashIcon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>Delete prompt</TooltipContent>
                          </Tooltip>
                        </Button>
                      )}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <>
                      <Textarea
                        {...fieldProps}
                        className="flex-1"
                        rows={4}
                        onChange={(e) => {
                          fieldProps.onChange(e);
                          handlePromptChange(e, index);
                        }}
                        placeholder="Type '/' to search prompts..."
                      />
                      <Autocomplete
                        trigger={showAutocomplete && currentIndex === index}
                        index={index}
                        inputText={fieldProps.value}
                        onSelect={(value) => {
                          fieldProps.onChange(value);
                          form.setValue(`prompts.${index}`, value);
                          setShowAutocomplete(false);
                        }}
                      />
                    </>
                  </FormControl>
                  {/* Specific error message for each prompt */}
                  {errors.prompts &&
                    Array.isArray(errors.prompts) &&
                    errors.prompts[index]?.message && (
                      <FormMessage>{errors.prompts[index].message}</FormMessage>
                    )}
                </FormItem>
              )}
            />
          ))}

          {/* Global form message for prompts array */}
          <FormMessage />
          {fields.length === 1 && (
            <FormDescription>
              Add another prompt to test multiple prompts.
            </FormDescription>
          )}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => append("")}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Another Prompt
          </Button>
        </FormItem>
      )}
    />
  );
}

export default PromptSelector;
