import { PromptDialog } from "@/components/prompt-dialog";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useFieldArray, useFormState } from "react-hook-form";
import { PromptTextArea } from "../prompt-textarea";

interface IProps {
  form: any;
}

function PromptSelector({ form }: IProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prompts",
  });

  const { errors } = useFormState({
    control: form.control,
  });

  const handleAppendPrompt = () => {
    append("");
    form.setValue(`prompts.${fields.length}`, "");
  };

  const handlePromptChange = (value: string, index: number) => {
    form.setValue(`prompts.${index}`, value);
    form.trigger();
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
          {errors.prompts && typeof errors.prompts === "object" && (
            <div className="text-red-500 dark:text-red-900">
              {errors.prompts.root?.message?.toString()}
            </div>
          )}
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
                        handleChange={(e) =>
                          handlePromptChange(e.target.value, index)
                        }
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
                    <PromptTextArea
                      value={fieldProps.value}
                      onChange={(value) => {
                        fieldProps.onChange(value);
                        handlePromptChange(value, index);
                      }}
                      className="flex-1"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          {fields.length === 1 && (
            <FormDescription>
              Add another prompt to test multiple prompts.
            </FormDescription>
          )}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleAppendPrompt}
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
