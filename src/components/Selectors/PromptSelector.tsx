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
import { TrashIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as React from "react";
import { useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { IPrompt } from "@/Interfaces";
import { get_all_prompts } from "../queries";

interface IProps {
  form: any;
}

function PromptSelector({ form }: IProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prompts",
  });

  const promptQuery = useQuery<IPrompt[]>({
    queryKey: ["get_all_prompts"],
    queryFn: (): Promise<IPrompt[]> => get_all_prompts(),
    refetchInterval: 1000 * 30 * 1,
    refetchOnWindowFocus: "always",
    staleTime: 0,
    // cacheTime: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    form.setValue(`prompts.${index}`, e.target.value);
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center justify-between font-bold">
                    Prompt {fields.length > 1 && (index + 1).toString()}
                    <div>
                      <PromptDialog
                        content={field.value}
                        handleChange={handleChange}
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
                    <Textarea
                      {...field}
                      className="flex-1"
                      rows={4}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </FormControl>
                  <FormDescription>The prompt you want to test</FormDescription>
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
