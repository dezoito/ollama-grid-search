import { IPrompt } from "@/Interfaces";
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
import { TrashIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useFieldArray } from "react-hook-form";
import { get_all_prompts } from "../queries";

interface IProps {
  form: any;
}

interface AutocompleteProps {
  trigger: boolean;
  index: number;
  onSelect: (value: string) => void;
}

function Autocomplete({ trigger, index, onSelect }: AutocompleteProps) {
  const [filteredPrompts, setFilteredPrompts] = React.useState<IPrompt[]>([]);

  const promptQuery = useQuery<IPrompt[]>({
    queryKey: ["get_all_prompts"],
    queryFn: (): Promise<IPrompt[]> => get_all_prompts(),
    refetchInterval: 1000 * 30 * 1,
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });

  React.useEffect(() => {
    if (trigger) {
      setFilteredPrompts(promptQuery.data || []);
    } else {
      setFilteredPrompts([]);
    }
  }, [trigger, promptQuery.data]);

  return (
    <div className="relative" id={`autocomplete-${index}`}>
      {filteredPrompts.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-40 overflow-auto rounded border bg-white shadow">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.slug}
              className="p-2 last:cursor-pointer hover:bg-gray-100 dark:bg-gray-800"
              onClick={() => onSelect(prompt.prompt)}
            >
              <strong>{prompt.slug}</strong> - {prompt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromptSelector({ form }: IProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prompts",
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
                        onSelect={(value) => {
                          fieldProps.onChange(value);
                          form.setValue(`prompts.${index}`, value);
                          setShowAutocomplete(false);
                        }}
                      />
                    </>
                  </FormControl>
                  <FormDescription></FormDescription>
                </FormItem>
              )}
            />
          ))}

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
          >
            Add Another Prompt
          </Button>
        </FormItem>
      )}
    />
  );
}

export default PromptSelector;
